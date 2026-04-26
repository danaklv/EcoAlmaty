package services

import (
	"dl/models"
	"dl/repositories"
	"fmt"
	"time"
)

type ChallengeService struct {
	Repo *repositories.ChallengeRepository
}

func NewChallengeService(repo *repositories.ChallengeRepository) *ChallengeService {
	return &ChallengeService{Repo: repo}
}

func startOfDay(t time.Time) time.Time {
	y, m, d := t.Date()
	return time.Date(y, m, d, 0, 0, 0, 0, t.Location())
}

func endOfDay(t time.Time) time.Time {
	y, m, d := t.Date()
	return time.Date(y, m, d, 23, 59, 59, 0, t.Location())
}

func startOfWeek(t time.Time) time.Time {
	wd := int(t.Weekday())
	if wd == 0 {
		wd = 7
	}
	return startOfDay(t.AddDate(0, 0, -(wd - 1)))
}

func endOfWeek(t time.Time) time.Time {
	return endOfDay(startOfWeek(t).AddDate(0, 0, 6))
}

func (s *ChallengeService) EnsureCurrentChallenges(userID int64) error {
	now := time.Now()

	if err := s.Repo.ExpireOldChallenges(userID, now); err != nil {
		return err
	}

	todayStart := startOfDay(now)
	todayEnd := endOfDay(now)

	if err := s.Repo.CreateChallengeIfNotExists(
		userID,
		"DAILY_ONE_ACTION",
		"One Green Action Today",
		"Complete 1 eco action today.",
		"daily",
		"action_count",
		nil,
		1,
		todayStart,
		todayEnd,
	); err != nil {
		return err
	}

	weekStart := startOfWeek(now)
	weekEnd := endOfWeek(now)

	if err := s.Repo.CreateChallengeIfNotExists(
		userID,
		"WEEKLY_ONE_TEST",
		"Weekly Eco Check-in",
		"Complete 1 eco test this week.",
		"weekly",
		"test_count",
		nil,
		1,
		weekStart,
		weekEnd,
	); err != nil {
		return err
	}

	weakestCategory, err := s.Repo.GetLatestWeakestCategory(userID)
	if err != nil {
		return err
	}

	if weakestCategory != "" {
		code := "WEEKLY_FOCUS_" + weakestCategory
		title := fmt.Sprintf("Focus on %s", weakestCategory)
		description := fmt.Sprintf("Complete 3 eco actions in category %s this week.", weakestCategory)

		if err := s.Repo.CreateChallengeIfNotExists(
			userID,
			code,
			title,
			description,
			"weekly",
			"category_action_count",
			&weakestCategory,
			3,
			weekStart,
			weekEnd,
		); err != nil {
			return err
		}
	}

	return nil
}

func (s *ChallengeService) GetCurrentChallenges(userID int64) (*models.ChallengeListResponse, error) {
	if err := s.EnsureCurrentChallenges(userID); err != nil {
		return nil, err
	}

	items, err := s.Repo.ListCurrentChallenges(userID, time.Now())
	if err != nil {
		return nil, err
	}

	return &models.ChallengeListResponse{
		Items: items,
	}, nil
}

func (s *ChallengeService) OnEcoAction(userID int64, actionCategory string) error {
	if err := s.EnsureCurrentChallenges(userID); err != nil {
		return err
	}
	return s.Repo.IncrementActionChallenges(userID, actionCategory, time.Now())
}

func (s *ChallengeService) OnEcoTestCompleted(userID int64) error {
	if err := s.EnsureCurrentChallenges(userID); err != nil {
		return err
	}
	return s.Repo.IncrementTestChallenges(userID, time.Now())
}