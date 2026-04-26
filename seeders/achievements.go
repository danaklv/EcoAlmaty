package seeders

import (
	"database/sql"
	"fmt"
)

func SeedAchievements(db *sql.DB) error {
	fmt.Println("Seeding achievements...")

	_, err := db.Exec(`
		INSERT INTO achievements (code, title, description, icon, category, metric, target_value) VALUES
		('FIRST_ACTION', 'First Green Step', 'Record your first eco action', '🌱', 'actions', 'actions_count', 1),
		('ACTIONS_10', 'Eco Starter', 'Record 10 eco actions', '♻️', 'actions', 'actions_count', 10),
		('ACTIONS_50', 'Eco Habit Builder', 'Record 50 eco actions', '🌿', 'actions', 'actions_count', 50),

		('STREAK_3', '3-Day Streak', 'Complete eco actions 3 days in a row', '🔥', 'streak', 'streak_days', 3),
		('STREAK_7', '7-Day Streak', 'Complete eco actions 7 days in a row', '⚡', 'streak', 'streak_days', 7),
		('STREAK_30', '30-Day Streak', 'Complete eco actions 30 days in a row', '🏅', 'streak', 'streak_days', 30),

		('FIRST_TEST', 'First Eco Test', 'Complete your first eco test', '🧪', 'tests', 'tests_count', 1),
		('TESTS_5', 'Eco Explorer', 'Complete 5 eco tests', '📘', 'tests', 'tests_count', 5),

		('ECO_AWARE', 'Eco Aware', 'Reach 60% eco score in a test', '🌍', 'results', 'best_percent', 60),
		('ECO_CHAMPION', 'Eco Champion', 'Reach 80% eco score in a test', '🏆', 'results', 'best_percent', 80)
		ON CONFLICT (code) DO NOTHING
	`)
	if err != nil {
		return err
	}

	fmt.Println("✔ achievements seeded successfully")
	return nil
}