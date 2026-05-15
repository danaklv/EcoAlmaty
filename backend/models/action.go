package models

import "time"

type ActionSubmission struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	ActionID     int64     `json:"action_id"`
	ActionName   string    `json:"action_name"`
	PhotoURL     string    `json:"photo_url"`
	Status       string    `json:"status"`
	AIComment    string    `json:"ai_comment"`
	AIConfidence float64   `json:"ai_confidence"`
	Points       int       `json:"points"`
	CreatedAt    time.Time `json:"created_at"`
	ReviewedAt   time.Time `json:"reviewed_at"`
}

type AIModerationResult struct {
	Approved   bool    `json:"approved"`
	Confidence float64 `json:"confidence"`
	Comment    string  `json:"comment"`
}