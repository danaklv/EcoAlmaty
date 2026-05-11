package seeders

import (
	"database/sql"
	"fmt"
)

func SeedEcoActions(db *sql.DB) error {
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM eco_actions`).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		fmt.Println("eco_actions already seeded")
		return nil
	}

	fmt.Println("Seeding eco_actions...")

	_, err = db.Exec(`
		INSERT INTO eco_actions (name, points, category, cooldown_type) VALUES

		-- WATER
		('Take a shorter shower', 6, 'water', 'daily'),
		('Turn off water when not using it', 5, 'water', 'daily'),

		-- ENERGY
		('Turn off lights when leaving a room', 5, 'energy', 'daily'),
		('Unplug unused chargers and electronics', 5, 'energy', 'daily'),

		-- TRANSPORT
		('Walk instead of taking a short car ride', 8, 'transport', 'daily'),
		('Use public transport instead of taxi', 9, 'transport', 'daily'),

		-- FOOD
		('Use a reusable bottle or container', 6, 'food', 'daily'),
		('Avoid food waste today', 8, 'food', 'daily'),

		-- WASTE
		('Sort waste for recycling', 8, 'waste', 'daily'),
		('Use a reusable shopping bag', 5, 'waste', 'daily')
	`)

	if err != nil {
		return err
	}

	fmt.Println("✔ eco_actions seeded successfully")
	return nil
}