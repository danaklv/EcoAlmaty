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
		('Use a reusable water bottle today', 6, 'water', 'daily'),
		('Use a reusable cup instead of a disposable one', 6, 'water', 'daily'),

		-- ENERGY / ECO HABITS
		('Use a reusable lunch container', 7, 'food', 'daily'),
	
		-- TRANSPORT
		('Use public transport instead of a taxi or private car', 9, 'transport', 'daily'),
		('Use a bicycle or walk instead of using a car', 8, 'transport', 'daily'),

		-- WASTE
		('Sort plastic, paper, or glass for recycling', 8, 'waste', 'daily'),
		('Take recyclable waste to a collection point', 10, 'waste', 'daily'),
		('Use a reusable shopping bag', 5, 'waste', 'daily'),

		-- NATURE / COMMUNITY
		('Plant or take care of a plant or tree', 10, 'nature', 'daily'),
		('Participate in a cleanup or eco event', 12, 'nature', 'daily'),
		('Donate clothes, books, or items for reuse', 10, 'nature', 'daily')
	`)

	if err != nil {
		return err
	}

	fmt.Println("✔ eco_actions seeded successfully")
	return nil
}