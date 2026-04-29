package models

type UserChallenge struct {
	ID          int64  `json:"id"`
	Code        string `json:"code"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Scope       string `json:"scope"`
	Kind        string `json:"kind"`
	Category    string `json:"category,omitempty"`
	TargetValue int    `json:"target_value"`
	Progress    int    `json:"progress"`
	Status      string `json:"status"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	CompletedAt string `json:"completed_at,omitempty"`
}

type ChallengeListResponse struct {
	Items []UserChallenge `json:"items"`
}