package utils

import (
	"dl/models"
	"sort"
)

type WeakAnswerInsight struct {
	Question string
	Category string
	Answer   int
	MaxValue int
	Impact   float64
	Tip      string
}

func FindWeakestAnswers(
	questions []models.EcoQuestion,
	answers map[int]int,
	limit int,
) []WeakAnswerInsight {
	var result []WeakAnswerInsight

	for _, q := range questions {
		answer, ok := answers[int(q.ID)]
		if !ok {
			continue
		}

		normalized := NormalizeAnswer(answer, q.MaxValue, q.IsReverse)

		// Чем ниже normalized, тем хуже.
		// Impact = "насколько сильно этот вопрос портит результат"
		impact := (1.0 - normalized) * q.Weight

		if impact <= 0 {
			continue
		}

		result = append(result, WeakAnswerInsight{
			Question: q.Question,
			Category: q.Category,
			Answer:   answer,
			MaxValue: q.MaxValue,
			Impact:   impact,
			Tip:      q.Tip,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Impact > result[j].Impact
	})

	if limit > 0 && len(result) > limit {
		result = result[:limit]
	}

	return result
}