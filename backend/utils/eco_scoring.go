package utils

import (
	"dl/models"
	"sort"
)

type CategoryScore struct {
	Category string
	Score    float64
	MaxScore float64
	Percent  float64
}

func NormalizeAnswer(value, maxValue int, isReverse bool) float64 {
	if maxValue <= 0 {
		return 0
	}

	v := value
	if isReverse {
		v = maxValue - value
	}

	return float64(v) / float64(maxValue)
}

func ScoreQuestions(
	questions []models.EcoQuestion,
	answers map[int]int,
) (float64, float64, []CategoryScore) {
	totalScore := 0.0
	maxTotalScore := 0.0

	type agg struct {
		score float64
		max   float64
	}

	categoryMap := make(map[string]*agg)

	for _, q := range questions {
		answer, ok := answers[int(q.ID)]
		if !ok {
			continue
		}

		normalized := NormalizeAnswer(answer, q.MaxValue, q.IsReverse)
		weightedScore := normalized * q.Weight
		weightedMax := q.Weight

		totalScore += weightedScore
		maxTotalScore += weightedMax

		if _, exists := categoryMap[q.Category]; !exists {
			categoryMap[q.Category] = &agg{}
		}

		categoryMap[q.Category].score += weightedScore
		categoryMap[q.Category].max += weightedMax
	}

	var result []CategoryScore
	for category, a := range categoryMap {
		percent := 0.0
		if a.max > 0 {
			percent = (a.score / a.max) * 100
		}

		result = append(result, CategoryScore{
			Category: category,
			Score:    a.score,
			MaxScore: a.max,
			Percent:  percent,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Percent > result[j].Percent
	})

	return totalScore, maxTotalScore, result
}

func OverallEcoCategory(percent float64) (string, string) {
	switch {
	case percent >= 80:
		return "Eco Champion", "У вас очень экологичный образ жизни и устойчивые привычки."
	case percent >= 60:
		return "Eco Aware", "У вас уже есть хорошие экологичные привычки, но есть зоны для улучшения."
	case percent >= 40:
		return "Eco Beginner", "Вы начали двигаться в экологичную сторону, но потенциал роста ещё большой."
	default:
		return "High Impact", "Ваш текущий образ жизни создаёт заметную нагрузку на окружающую среду."
	}
}

func CategoryLevel(percent float64) string {
	switch {
	case percent >= 80:
		return "strong"
	case percent >= 60:
		return "good"
	case percent >= 40:
		return "average"
	default:
		return "weak"
	}
}

func CategoryTips(category string) []string {
	switch category {
	case "water":
		return []string{
			"Сократите время душа на 2–3 минуты",
			"Закрывайте кран во время чистки зубов",
			"Запускайте стирку только при полной загрузке",
		}
	case "energy":
		return []string{
			"Выключайте свет и технику, выходя из комнаты",
			"Не оставляйте зарядки и устройства включёнными без необходимости",
			"Старайтесь реже использовать кондиционер без нужды",
		}
	case "transport":
		return []string{
			"Чаще выбирайте пешие прогулки на короткие расстояния",
			"Используйте общественный транспорт вместо такси",
			"Сокращайте короткие поездки на личном автомобиле",
		}
	case "food":
		return []string{
			"Старайтесь не выбрасывать еду",
			"Используйте многоразовые контейнеры и бутылки",
			"Добавьте больше блюд без мяса в рацион",
		}
	case "waste":
		return []string{
			"Используйте многоразовые сумки",
			"Сортируйте пластик, бумагу и стекло",
			"Сократите использование одноразовой посуды и пакетов",
		}
	default:
		return []string{
			"Поддерживайте экологичные привычки каждый день",
		}
	}
}

func OptionLabel(value int) string {
	switch value {
	case 0:
		return "Никогда"
	case 1:
		return "Очень редко"
	case 2:
		return "Иногда"
	case 3:
		return "Часто"
	case 4:
		return "Почти всегда"
	case 5:
		return "Всегда"
	default:
		return "Неизвестно"
	}
}

func TipsByCategory(category string) []string {
	return CategoryTips(category)
}