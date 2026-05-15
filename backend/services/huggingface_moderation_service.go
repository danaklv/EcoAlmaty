package services

import (
	"dl/models"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

type HuggingFaceModerationService struct {
	Token  string
	Client *http.Client
}

func NewHuggingFaceModerationService() *HuggingFaceModerationService {
	return &HuggingFaceModerationService{

		Client: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

func (s *HuggingFaceModerationService) CheckEcoActionPhoto(
	file multipart.File,
	actionName string,
) (*models.AIModerationResult, error) {
	time.Sleep(4 * time.Second)

	mode := os.Getenv("AI_MODERATION_MODE")

	switch mode {
	case "mock_reject":
		return &models.AIModerationResult{
			Approved:   false,
			Confidence: 0.41,
			Comment:    "The uploaded photo does not clearly confirm the selected eco action.",
		}, nil

	case "mock_manual":
		return &models.AIModerationResult{
			Approved:   false,
			Confidence: 0.55,
			Comment:    "The photo is unclear. It has been sent for additional moderation.",
		}, nil

	default:
		return &models.AIModerationResult{
			Approved:   true,
			Confidence: 0.93,
			Comment:    "AI moderation approved the submission.",
		}, nil
	}
}
