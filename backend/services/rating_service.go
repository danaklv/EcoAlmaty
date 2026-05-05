package services

import (
	"dl/models"
	"dl/repositories"
	"errors"
)

type RatingService struct {
	Repo          *repositories.RatingRepository
	Gamification  *GamificationService
	Challenges    *ChallengeService
	ChallengeRepo *repositories.ChallengeRepository
}

func NewRatingService(
	repo *repositories.RatingRepository,
	gamification *GamificationService,
	challenges *ChallengeService,
	challengeRepo *repositories.ChallengeRepository,
) *RatingService {
	return &RatingService{
		Repo:          repo,
		Gamification:  gamification,
		Challenges:    challenges,
		ChallengeRepo: challengeRepo,
	}
}

func (s *RatingService) AddEcoAction(userID, actionID int64) (*models.AddActionResult, error) {
	used, err := s.Repo.ActionUsedToday(userID, actionID)
	if err != nil {
		return nil, err
	}
	if used {
		return nil, errors.New("action already used today")
	}

	points, category, err := s.ChallengeRepo.GetActionMeta(actionID)
	if err != nil {
		return nil, err
	}

	currentRating, err := s.Repo.GetUserRating(userID)
	if err != nil {
		return nil, err
	}

	newRating := currentRating + points

	level := 1
	league := "Green Seed"

	switch {
	case newRating >= 1000:
		level, league = 5, "Earth Legend"
	case newRating >= 500:
		level, league = 4, "Planet Guardian"
	case newRating >= 250:
		level, league = 3, "Nature Keeper"
	case newRating >= 100:
		level, league = 2, "Eco Enthusiast"
	}

	if err := s.Repo.ApplyEcoAction(
		userID,
		actionID,
		points,
		level,
		league,
	); err != nil {
		return nil, err
	}

	if s.Gamification != nil {
		_ = s.Gamification.OnEcoAction(userID)
	}

	if s.Challenges != nil {
		_ = s.Challenges.OnEcoAction(userID, category)
	}

	return &models.AddActionResult{
		NewRating: newRating,
		NewLevel:  level,
		NewLeague: league,
	}, nil
}

func (s *RatingService) GetUserActions(userID int64) ([]models.UserAction, error) {
	return s.Repo.GetUserActions(userID)
}

func (s *RatingService) GetLeaderboard(limit, offset int) ([]models.LeaderboardEntry, error) {
	return s.Repo.GetLeaderboard(limit, offset)
}

func (s *RatingService) CountLeaderboard() (int, error) {
	return s.Repo.CountLeaderboard()
}

func (s *RatingService) GetEcoActions() ([]models.EcoAction, error) {
	return s.Repo.GetEcoActions()
}
