package services

import (
	"dl/models"
	"dl/repositories"
	"time"
)

type GamificationService struct {
	Repo *repositories.GamificationRepository
}

func NewGamificationService(repo *repositories.GamificationRepository) *GamificationService {
	return &GamificationService{Repo: repo}
}

func (s *GamificationService) OnEcoAction(userID int64) error {
	_, err := s.Repo.UpdateStreak(userID, time.Now())
	if err != nil {
		return err
	}
	return s.evaluateAchievements(userID)
}

func (s *GamificationService) OnEcoTestCompleted(userID int64) error {
	return s.evaluateAchievements(userID)
}

func (s *GamificationService) GetStreak(userID int64) (*models.StreakDTO, error) {
	streak, err := s.Repo.GetStreak(userID)
	if err != nil {
		return nil, err
	}

	dto := &models.StreakDTO{
		CurrentStreak: streak.CurrentStreak,
		LongestStreak: streak.LongestStreak,
	}

	if streak.LastActionDate != nil {
		dto.LastActionDate = streak.LastActionDate.Format("2006-01-02")
	}

	return dto, nil
}

func (s *GamificationService) GetAchievements(userID int64) ([]models.AchievementProgressDTO, error) {
	if err := s.evaluateAchievements(userID); err != nil {
		return nil, err
	}

	stats, err := s.collectStats(userID)
	if err != nil {
		return nil, err
	}

	achievements, err := s.Repo.ListAchievements()
	if err != nil {
		return nil, err
	}

	unlocked, err := s.Repo.GetUnlockedAchievements(userID)
	if err != nil {
		return nil, err
	}

	var result []models.AchievementProgressDTO
	for _, a := range achievements {
		currentValue := metricValue(a.Metric, stats)
		progressPercent := 0.0
		if a.TargetValue > 0 {
			progressPercent = (currentValue / a.TargetValue) * 100
		}
		if progressPercent > 100 {
			progressPercent = 100
		}

		dto := models.AchievementProgressDTO{
			Code:            a.Code,
			Title:           a.Title,
			Description:     a.Description,
			Icon:            a.Icon,
			Category:        a.Category,
			Metric:          a.Metric,
			TargetValue:     a.TargetValue,
			CurrentValue:    currentValue,
			ProgressPercent: progressPercent,
			Unlocked:        false,
		}

		if unlockedAt, ok := unlocked[a.Code]; ok {
			dto.Unlocked = true
			dto.UnlockedAt = unlockedAt.Format(time.RFC3339)
		}

		result = append(result, dto)
	}

	return result, nil
}

func (s *GamificationService) evaluateAchievements(userID int64) error {
	stats, err := s.collectStats(userID)
	if err != nil {
		return err
	}

	achievements, err := s.Repo.ListAchievements()
	if err != nil {
		return err
	}

	unlocked, err := s.Repo.GetUnlockedAchievements(userID)
	if err != nil {
		return err
	}

	for _, a := range achievements {
		if _, exists := unlocked[a.Code]; exists {
			continue
		}

		currentValue := metricValue(a.Metric, stats)
		if currentValue >= a.TargetValue {
			if err := s.Repo.UnlockAchievement(userID, a.ID); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *GamificationService) collectStats(userID int64) (*models.GamificationStats, error) {
	actionsCount, err := s.Repo.CountUserActions(userID)
	if err != nil {
		return nil, err
	}

	testsCount, err := s.Repo.CountUserTests(userID)
	if err != nil {
		return nil, err
	}

	bestPercent, err := s.Repo.GetBestEcoPercent(userID)
	if err != nil {
		return nil, err
	}

	streak, err := s.Repo.GetStreak(userID)
	if err != nil {
		return nil, err
	}

	return &models.GamificationStats{
		ActionsCount:  actionsCount,
		TestsCount:    testsCount,
		CurrentStreak: streak.CurrentStreak,
		LongestStreak: streak.LongestStreak,
		BestPercent:   bestPercent,
	}, nil
}

func metricValue(metric string, stats *models.GamificationStats) float64 {
	switch metric {
	case "actions_count":
		return float64(stats.ActionsCount)
	case "tests_count":
		return float64(stats.TestsCount)
	case "streak_days":
		return float64(stats.CurrentStreak)
	case "best_percent":
		return stats.BestPercent
	default:
		return 0
	}
}
