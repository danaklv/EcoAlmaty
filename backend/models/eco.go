package models

import "time"

type EcoAnswerRequest struct {
	Answers map[int]int `json:"answers"`
}

type EcoQuestion struct {
	ID        int64   `json:"id"`
	Category  string  `json:"category"`
	Question  string  `json:"question"`
	MaxValue  int     `json:"max_value"`
	Weight    float64 `json:"weight"`
	IsReverse bool    `json:"is_reverse"`
	Tip       string  `json:"tip"`
}

type EcoQuestionDTO struct {
	ID      int64          `json:"id"`
	Text    string         `json:"text"`
	Options []EcoOptionDTO `json:"options"`
}

type EcoOptionDTO struct {
	Value int    `json:"value"`
	Label string `json:"label"`
}

type EcoCategoryBreakdown struct {
	Category string   `json:"category"`
	Score    float64  `json:"score"`
	MaxScore float64  `json:"max_score"`
	Percent  float64  `json:"percent"`
	Level    string   `json:"level"`
	Tips     []string `json:"tips"`
}

type EcoLatestResultDTO struct {
	TotalScore              float64                     `json:"total_score"`
	MaxTotalScore           float64                     `json:"max_total_score"`
	Percent                 float64                     `json:"percent"`
	Category                string                      `json:"category"`
	Description             string                      `json:"description"`
	Tips                    []string                    `json:"tips"`
	StrongestCategory       string                      `json:"strongest_category"`
	WeakestCategory         string                      `json:"weakest_category"`
	Breakdown               []EcoCategoryBreakdown      `json:"breakdown"`
	PersonalRecommendations []EcoPersonalRecommendation `json:"personal_recommendations"`
	TakenAt                 string                      `json:"taken_at"`
}

type EcoResultBreakdown struct {
	ResultID int64   `json:"result_id"`
	Category string  `json:"category"`
	Score    float64 `json:"score"`
	MaxScore float64 `json:"max_score"`
	Percent  float64 `json:"percent"`
	Level    string  `json:"level"`
}

type EcoResult struct {
	ID                int64                       `json:"id"`
	UserID            int64                       `json:"user_id"`
	TotalScore        float64                     `json:"total_score"`
	MaxScore          float64                     `json:"max_score"`
	Percent           float64                     `json:"percent"`
	Category          string                      `json:"category"`
	Description       string                      `json:"description"`
	StrongestCategory string                      `json:"strongest_category"`
	WeakestCategory   string                      `json:"weakest_category"`
	CreatedAt         time.Time                   `json:"created_at"`
	Breakdown         []EcoResultBreakdown        `json:"breakdown"`
	Recommendations   []EcoPersonalRecommendation `json:"recommendations"`
}

type EcoPersonalRecommendation struct {
	Question string  `json:"question"`
	Category string  `json:"category"`
	Answer   int     `json:"answer"`
	MaxValue int     `json:"max_value"`
	Impact   float64 `json:"impact"`
	Tip      string  `json:"tip"`
}

type EcoTestResultDTO struct {
	TotalScore              float64                     `json:"total_score"`
	MaxTotalScore           float64                     `json:"max_total_score"`
	Percent                 float64                     `json:"percent"`
	Category                string                      `json:"category"`
	Description             string                      `json:"description"`
	Tips                    []string                    `json:"tips"`
	StrongestCategory       string                      `json:"strongest_category"`
	WeakestCategory         string                      `json:"weakest_category"`
	Breakdown               []EcoCategoryBreakdown      `json:"breakdown"`
	PersonalRecommendations []EcoPersonalRecommendation `json:"personal_recommendations"`
}


type EcoHistoryItemDTO struct {
	ResultID           int64   `json:"result_id"`
	TotalScore         float64 `json:"total_score"`
	MaxTotalScore      float64 `json:"max_total_score"`
	Percent            float64 `json:"percent"`
	Category           string  `json:"category"`
	Description        string  `json:"description"`
	StrongestCategory  string  `json:"strongest_category"`
	WeakestCategory    string  `json:"weakest_category"`
	TakenAt            string  `json:"taken_at"`
}

type EcoHistoryResponseDTO struct {
	Items  []EcoHistoryItemDTO `json:"items"`
	Limit  int                 `json:"limit"`
	Offset int                 `json:"offset"`
	Total  int                 `json:"total"`
}

type EcoProgressPointDTO struct {
	TakenAt string  `json:"taken_at"`
	Percent float64 `json:"percent"`
}

type EcoCategoryProgressDTO struct {
	Category   string                `json:"category"`
	Current    float64               `json:"current"`
	Previous   float64               `json:"previous"`
	Change     float64               `json:"change"`
	Direction  string                `json:"direction"`
	Points     []EcoProgressPointDTO `json:"points"`
}

type EcoProgressDTO struct {
	Days             int                    `json:"days"`
	TestsCount       int                    `json:"tests_count"`
	OverallCurrent   float64                `json:"overall_current"`
	OverallPrevious  float64                `json:"overall_previous"`
	OverallChange    float64                `json:"overall_change"`
	OverallDirection string                 `json:"overall_direction"`
	OverallPoints    []EcoProgressPointDTO  `json:"overall_points"`
	Categories       []EcoCategoryProgressDTO `json:"categories"`
}

type EcoProgressRow struct {
	ResultID        int64
	TakenAt         time.Time
	OverallPercent  float64
	Category        string
	CategoryPercent float64
}