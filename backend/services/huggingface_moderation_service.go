package services

import (
	"bytes"
	"dl/models"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"
)

type HuggingFaceModerationService struct {
	Token  string
	Client *http.Client
}

func NewHuggingFaceModerationService() *HuggingFaceModerationService {
	return &HuggingFaceModerationService{
		Token: os.Getenv("HUGGINGFACE_API_TOKEN"),
		Client: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

type hfClassification []struct {
	Label string  `json:"label"`
	Score float64 `json:"score"`
}

func (s *HuggingFaceModerationService) CheckEcoActionPhoto(
	file multipart.File,
	actionName string,
) (*models.AIModerationResult, error) {
	// Если токен не задан — используем мок
	if s.Token == "" {
		return &models.AIModerationResult{
			Approved:   true,
			Confidence: 0.85,
			Comment:    "Mock approval: no AI token configured.",
		}, nil
	}

	// Читаем файл в байты
	imageData, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read image: %w", err)
	}

	// Используем google/vit-base-patch16-224 — бесплатная модель классификации изображений
	apiURL := "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224"

	req, err := http.NewRequest("POST", apiURL, bytes.NewReader(imageData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.Token)
	req.Header.Set("Content-Type", "application/octet-stream")

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HuggingFace API error: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		// Модель ещё грузится — одобряем pending
		if resp.StatusCode == 503 {
			return &models.AIModerationResult{
				Approved:   false,
				Confidence: 0.55,
				Comment:    "AI model is loading. Submission sent for manual review.",
			}, nil
		}
		return nil, fmt.Errorf("HuggingFace API returned %d: %s", resp.StatusCode, string(body))
	}

	var classifications hfClassification
	if err := json.Unmarshal(body, &classifications); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if len(classifications) == 0 {
		return nil, fmt.Errorf("empty classification result")
	}

	// Проверяем соответствие экшену
	result := analyzeClassification(classifications, actionName)
	fmt.Printf("=== HF RAW RESPONSE === %s\n", string(body))
	fmt.Printf("=== AI RESULT === approved=%v confidence=%.2f comment=%s\n",
		result.Approved, result.Confidence, result.Comment)
	return result, nil
}

// ecoKeywords — ключевые слова для каждого типа эко-экшена
var ecoKeywords = map[string][]string{
	"recycle": {"trash", "garbage", "recycling", "bin", "waste", "bottle", "can", "paper",
		"ashcan", "wastebin", "dustbin", "basket", "plastic", "container"},
	"sort":      {"trash", "garbage", "bin", "waste", "ashcan", "wastebin", "dustbin", "plastic"},
	"bike":      {"bicycle", "bike", "cycling", "wheel", "helmet"},
	"tree":      {"tree", "plant", "forest", "garden", "leaf", "nature", "grass"},
	"water":     {"water", "river", "lake", "ocean", "sea", "faucet", "tap"},
	"walk":      {"walking", "pedestrian", "street", "path", "sidewalk"},
	"transport": {"bus", "tram", "subway", "metro", "train", "public"},
	"waste":     {"trash", "garbage", "bin", "waste", "ashcan", "wastebin", "dustbin", "plastic", "recycle"},
	"plastic":   {"plastic", "bottle", "bag", "container", "packaging"},
}

func analyzeClassification(results hfClassification, actionName string) *models.AIModerationResult {
	actionLower := strings.ToLower(actionName)

	// Определяем релевантные ключевые слова для экшена
	relevantKeywords := []string{}
	for key, keywords := range ecoKeywords {
		if strings.Contains(actionLower, key) {
			relevantKeywords = append(relevantKeywords, keywords...)
		}
	}

	// Если ключевых слов нет — общая проверка на природу/окружающую среду
	if len(relevantKeywords) == 0 {
		relevantKeywords = []string{"nature", "plant", "tree", "outdoor", "green", "environment", "recycling", "bicycle"}
	}

	// Ищем совпадения в топ-5 результатах
	topScore := 0.0
	matchScore := 0.0
	topLabel := ""

	limit := 5
	if len(results) < limit {
		limit = len(results)
	}

	for i, r := range results[:limit] {
		if i == 0 {
			topScore = r.Score
			topLabel = r.Label
		}
		labelLower := strings.ToLower(r.Label)
		for _, kw := range relevantKeywords {
			if strings.Contains(labelLower, kw) {
				matchScore += r.Score
				break
			}
		}
	}

	// Решение
	confidence := matchScore
	if confidence == 0 {
		// Нет совпадений — используем топ score как базу но снижаем
		confidence = topScore * 0.4
	}

	if confidence >= 0.70 {
		return &models.AIModerationResult{
			Approved:   true,
			Confidence: confidence,
			Comment:    fmt.Sprintf("AI approved: detected '%s' relevant to action '%s'.", topLabel, actionName),
		}
	} else if confidence >= 0.45 {
		return &models.AIModerationResult{
			Approved:   false,
			Confidence: confidence,
			Comment:    "Photo unclear. Sent for manual review.",
		}
	}

	return &models.AIModerationResult{
		Approved:   false,
		Confidence: confidence,
		Comment:    fmt.Sprintf("Photo does not match action '%s'. Please upload a relevant photo.", actionName),
	}
}
