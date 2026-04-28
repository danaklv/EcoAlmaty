package services

import (
	"dl/models"
	"dl/repositories"
	"dl/utils"
	"fmt"
	"sort"
	"time"
)

type EcoService struct {
	Repo         *repositories.EcoRepository
	Gamification *GamificationService
	Challenges   *ChallengeService
}

func NewEcoService(
	repo *repositories.EcoRepository,
	gamification *GamificationService,
	challenges *ChallengeService,
) *EcoService {
	return &EcoService{
		Repo:         repo,
		Gamification: gamification,
		Challenges:   challenges,
	}
}
func (s *EcoService) SubmitAnswers(
	userID int64,
	answers map[int]int,
) (*models.EcoTestResultDTO, error) {

	if len(answers) == 0 {
		return nil, fmt.Errorf("answers are required")
	}

	questions, err := s.Repo.GetQuestions()
	if err != nil {
		return nil, err
	}

	questionMap := make(map[int]models.EcoQuestion)
	for _, q := range questions {
		questionMap[int(q.ID)] = q
	}

	for qID, value := range answers {
		q, ok := questionMap[qID]
		if !ok {
			return nil, fmt.Errorf("question %d not found", qID)
		}
		if value < 0 || value > q.MaxValue {
			return nil, fmt.Errorf("invalid value for question %d", qID)
		}
	}

	totalScore, maxTotalScore, categoryScores := utils.ScoreQuestions(questions, answers)

	percent := 0.0
	if maxTotalScore > 0 {
		percent = (totalScore / maxTotalScore) * 100
	}

	category, description := utils.OverallEcoCategory(percent)

	var breakdown []models.EcoCategoryBreakdown
	strongestCategory := ""
	weakestCategory := ""

	if len(categoryScores) > 0 {
		strongestCategory = categoryScores[0].Category
		weakestCategory = categoryScores[len(categoryScores)-1].Category
	}

	for _, c := range categoryScores {
		breakdown = append(breakdown, models.EcoCategoryBreakdown{
			Category: c.Category,
			Score:    c.Score,
			MaxScore: c.MaxScore,
			Percent:  c.Percent,
			Level:    utils.CategoryLevel(c.Percent),
			Tips:     utils.CategoryTips(c.Category),
		})
	}

	tips := utils.CategoryTips(weakestCategory)

	weakAnswers := utils.FindWeakestAnswers(questions, answers, 3)

	var personalRecommendations []models.EcoPersonalRecommendation
	for _, w := range weakAnswers {
		personalRecommendations = append(personalRecommendations, models.EcoPersonalRecommendation{
			Question: w.Question,
			Category: w.Category,
			Answer:   w.Answer,
			MaxValue: w.MaxValue,
			Impact:   w.Impact,
			Tip:      w.Tip,
		})
	}

	resultID, err := s.Repo.SaveSubmission(
		userID,
		answers,
		totalScore,
		maxTotalScore,
		percent,
		category,
		description,
		strongestCategory,
		weakestCategory,
		breakdown,
		personalRecommendations,
	)
	if err != nil {
		return nil, err
	}

	_ = resultID // если пока не возвращаешь result_id во фронт
	if s.Gamification != nil {
		_ = s.Gamification.OnEcoTestCompleted(userID)
	}

	if s.Challenges != nil {
		_ = s.Challenges.OnEcoTestCompleted(userID)
	}

	return &models.EcoTestResultDTO{
		TotalScore:              totalScore,
		MaxTotalScore:           maxTotalScore,
		Percent:                 percent,
		Category:                category,
		Description:             description,
		Tips:                    tips,
		StrongestCategory:       strongestCategory,
		WeakestCategory:         weakestCategory,
		Breakdown:               breakdown,
		PersonalRecommendations: personalRecommendations,
	}, nil
}

func (s *EcoService) GetLatest(userID int64) (*models.EcoLatestResultDTO, error) {
	raw, err := s.Repo.GetLatestResult(userID)
	if err != nil {
		return nil, err
	}
	return mapEcoResultToLatestDTO(raw), nil
}

func (s *EcoService) GetResult(userID, resultID int64) (*models.EcoLatestResultDTO, error) {
	raw, err := s.Repo.GetResultByID(userID, resultID)
	if err != nil {
		return nil, err
	}
	return mapEcoResultToLatestDTO(raw), nil
}

func mapEcoResultToLatestDTO(raw *models.EcoResult) *models.EcoLatestResultDTO {
	var breakdown []models.EcoCategoryBreakdown
	for _, b := range raw.Breakdown {
		breakdown = append(breakdown, models.EcoCategoryBreakdown{
			Category: b.Category,
			Score:    b.Score,
			MaxScore: b.MaxScore,
			Percent:  b.Percent,
			Level:    b.Level,
			Tips:     utils.CategoryTips(b.Category),
		})
	}

	tips := utils.CategoryTips(raw.WeakestCategory)

	return &models.EcoLatestResultDTO{
		TotalScore:              raw.TotalScore,
		MaxTotalScore:           raw.MaxScore,
		Percent:                 raw.Percent,
		Category:                raw.Category,
		Description:             raw.Description,
		Tips:                    tips,
		StrongestCategory:       raw.StrongestCategory,
		WeakestCategory:         raw.WeakestCategory,
		Breakdown:               breakdown,
		PersonalRecommendations: raw.Recommendations,
		TakenAt:                 raw.CreatedAt.Format(time.RFC3339),
	}
}

func (s *EcoService) GetHistory(userID int64, limit, offset int) (*models.EcoHistoryResponseDTO, error) {
	items, err := s.Repo.GetHistory(userID, limit, offset)
	if err != nil {
		return nil, err
	}

	total, err := s.Repo.CountHistory(userID)
	if err != nil {
		return nil, err
	}

	var result []models.EcoHistoryItemDTO
	for _, item := range items {
		result = append(result, models.EcoHistoryItemDTO{
			ResultID:          item.ID,
			TotalScore:        item.TotalScore,
			MaxTotalScore:     item.MaxScore,
			Percent:           item.Percent,
			Category:          item.Category,
			Description:       item.Description,
			StrongestCategory: item.StrongestCategory,
			WeakestCategory:   item.WeakestCategory,
			TakenAt:           item.CreatedAt.Format(time.RFC3339),
		})
	}

	return &models.EcoHistoryResponseDTO{
		Items:  result,
		Limit:  limit,
		Offset: offset,
		Total:  total,
	}, nil
}

func (s *EcoService) GetProgress(userID int64, days int) (*models.EcoProgressDTO, error) {
	since := time.Now().AddDate(0, 0, -days)

	rows, err := s.Repo.GetProgressRows(userID, since)
	if err != nil {
		return nil, err
	}

	overallSeen := make(map[int64]bool)
	var overallPoints []models.EcoProgressPointDTO

	categoryMap := make(map[string][]models.EcoProgressPointDTO)

	for _, row := range rows {
		if !overallSeen[row.ResultID] {
			overallPoints = append(overallPoints, models.EcoProgressPointDTO{
				TakenAt: row.TakenAt.Format(time.RFC3339),
				Percent: row.OverallPercent,
			})
			overallSeen[row.ResultID] = true
		}

		if row.Category != "" {
			categoryMap[row.Category] = append(categoryMap[row.Category], models.EcoProgressPointDTO{
				TakenAt: row.TakenAt.Format(time.RFC3339),
				Percent: row.CategoryPercent,
			})
		}
	}

	overallCurrent, overallPrevious, overallChange, overallDirection := summarizePoints(overallPoints)

	var categories []models.EcoCategoryProgressDTO
	for category, points := range categoryMap {
		current, previous, change, direction := summarizePoints(points)

		categories = append(categories, models.EcoCategoryProgressDTO{
			Category:  category,
			Current:   current,
			Previous:  previous,
			Change:    change,
			Direction: direction,
			Points:    points,
		})
	}

	sort.Slice(categories, func(i, j int) bool {
		return categories[i].Category < categories[j].Category
	})

	return &models.EcoProgressDTO{
		Days:             days,
		TestsCount:       len(overallPoints),
		OverallCurrent:   overallCurrent,
		OverallPrevious:  overallPrevious,
		OverallChange:    overallChange,
		OverallDirection: overallDirection,
		OverallPoints:    overallPoints,
		Categories:       categories,
	}, nil
}

func summarizePoints(points []models.EcoProgressPointDTO) (current, previous, change float64, direction string) {
	if len(points) == 0 {
		return 0, 0, 0, "stable"
	}

	current = points[len(points)-1].Percent
	previous = points[0].Percent
	change = current - previous
	direction = trendDirection(change)
	return
}

func trendDirection(change float64) string {
	switch {
	case change > 1:
		return "up"
	case change < -1:
		return "down"
	default:
		return "stable"
	}
}

func (s *EcoService) GetQuestions() ([]models.EcoQuestionDTO, error) {
	raw, err := s.Repo.GetQuestions()
	if err != nil {
		return nil, err
	}

	var result []models.EcoQuestionDTO
	for _, q := range raw {
		options := make([]models.EcoOptionDTO, 0, q.MaxValue+1)

		for i := 0; i <= q.MaxValue; i++ {
			options = append(options, models.EcoOptionDTO{
				Value: i,
				Label: utils.OptionLabel(i),
			})
		}

		result = append(result, models.EcoQuestionDTO{
			ID:      q.ID,
			Text:    q.Question,
			Options: options,
		})
	}

	return result, nil
}
