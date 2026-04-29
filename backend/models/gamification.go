package models

import "time"

type UserStreak struct {
	UserID         int64      `json:"user_id"`
	CurrentStreak  int        `json:"current_streak"`
	LongestStreak  int        `json:"longest_streak"`
	LastActionDate *time.Time `json:"last_action_date,omitempty"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type Achievement struct {
	ID          int64   `json:"id"`
	Code        string  `json:"code"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Icon        string  `json:"icon"`
	Category    string  `json:"category"`
	Metric      string  `json:"metric"`
	TargetValue float64 `json:"target_value"`
}

type AchievementProgressDTO struct {
	Code            string  `json:"code"`
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	Icon            string  `json:"icon"`
	Category        string  `json:"category"`
	Metric          string  `json:"metric"`
	TargetValue     float64 `json:"target_value"`
	CurrentValue    float64 `json:"current_value"`
	ProgressPercent float64 `json:"progress_percent"`
	Unlocked        bool    `json:"unlocked"`
	UnlockedAt      string  `json:"unlocked_at,omitempty"`
}

type StreakDTO struct {
	CurrentStreak int    `json:"current_streak"`
	LongestStreak int    `json:"longest_streak"`
	LastActionDate string `json:"last_action_date,omitempty"`
}

type GamificationStats struct {
	ActionsCount  int
	TestsCount    int
	CurrentStreak int
	LongestStreak int
	BestPercent   float64
}