package seeders

import (
	"database/sql"
	"fmt"
)

func RunAllSeeders(db *sql.DB) error {
	fmt.Println("Running database seeders...")

	if err := SeedEcoQuestions(db); err != nil {
		return fmt.Errorf("eco questions seeder failed: %w", err)
	}

	if err := SeedEcoActions(db); err != nil {
		return fmt.Errorf("eco actions seeder failed: %w", err)
	}

	if err := SeedAchievements(db); err != nil {
		return fmt.Errorf("achievements seeder failed: %w", err)
	}

	fmt.Println("All seeders completed")
	return nil
}
