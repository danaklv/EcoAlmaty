package services

import (
	"dl/models"
	"dl/repositories"
	"errors"
	"mime/multipart"
)

type ActionSubmissionService struct {
	Submissions *repositories.ActionSubmissionRepository
	Rating      *RatingService
	AI          *HuggingFaceModerationService
}

func NewActionSubmissionService(
	subRepo *repositories.ActionSubmissionRepository,
	ratingService *RatingService,
	aiService *HuggingFaceModerationService,
) *ActionSubmissionService {
	return &ActionSubmissionService{
		Submissions: subRepo,
		Rating:      ratingService,
		AI:          aiService,
	}
}

func (s *ActionSubmissionService) SubmitActionPhoto(
	userID int64,
	actionID int64,
	photoURL string,
	file multipart.File,
) (*models.AIModerationResult, error) {
	exists, err := s.Submissions.HasPendingSubmissionToday(userID, actionID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("action already submitted today")
	}

	actionName, points, err := s.Submissions.GetActionNameAndPoints(actionID)
	if err != nil {
		return nil, err
	}

	submissionID, err := s.Submissions.CreateSubmission(userID, actionID, photoURL, points)
	if err != nil {
		return nil, err
	}

	if _, err := file.Seek(0, 0); err != nil {
		return nil, err
	}

	aiResult, err := s.AI.CheckEcoActionPhoto(file, actionName)
	if err != nil {
		_ = s.Submissions.UpdateAIResult(
			submissionID,
			"pending",
			"AI moderation failed. Waiting for manual review.",
			0,
		)
		return nil, err
	}

	status := "rejected"

	if aiResult.Approved && aiResult.Confidence >= 0.70 {
		status = "approved"

		if _, err := s.Rating.AddEcoAction(userID, actionID); err != nil {
			return nil, err
		}
	} else if aiResult.Confidence >= 0.45 && aiResult.Confidence < 0.70 {
		status = "pending"
	}
	if err := s.Submissions.UpdateAIResult(
		submissionID,
		status,
		aiResult.Comment,
		aiResult.Confidence,
	); err != nil {
		return nil, err
	}

	return aiResult, nil
}

func (s *ActionSubmissionService) GetMySubmissions(userID int64) ([]models.ActionSubmission, error) {
	return s.Submissions.GetUserSubmissions(userID)
}
