package utils

func CalculateEcoResult(score int) (string, string, []string) {
	switch {
	case score <= 10:
		return "High Impact", "Your footprint is quite high", []string{
			"Use public transport",
			"Reduce plastic usage",
		}
	case score <= 20:
		return "Moderate Impact", "You are on the right path", []string{
			"Save electricity",
			"Recycle more",
		}
	default:
		return "Eco Friendly", "Great job!", []string{
			"Share your habits",
			"Support eco initiatives",
		}
	}
}



