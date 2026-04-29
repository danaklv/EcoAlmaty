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
		INSERT INTO eco_actions (name, points, category) VALUES
		-- WATER
		('Took a shorter shower today', 6, 'water'),
		('Turned off water while brushing teeth', 5, 'water'),
		('Ran washing machine only with full load', 7, 'water'),
		('Reported or fixed a water leak', 10, 'water'),

		-- ENERGY
		('Turned off lights when leaving room', 4, 'energy'),
		('Unplugged unused electronics', 5, 'energy'),
		('Used natural light instead of turning on lamps', 4, 'energy'),
		('Reduced air conditioner or heater usage', 7, 'energy'),

		-- TRANSPORT
		('Walked instead of taking a short car ride', 8, 'transport'),
		('Used public transport instead of taxi', 9, 'transport'),
		('Skipped one unnecessary taxi ride', 8, 'transport'),
		('Used bicycle or walked for commute', 10, 'transport'),

		-- FOOD
		('Had a meat-free meal today', 7, 'food'),
		('Used a reusable bottle or cup', 5, 'food'),
		('Avoided food waste today', 8, 'food'),
		('Packed food in reusable container', 6, 'food'),

		-- WASTE
		('Sorted waste for recycling', 8, 'waste'),
		('Used reusable shopping bag', 5, 'waste'),
		('Avoided disposable tableware', 7, 'waste'),
		('Reused an item instead of throwing it away', 6, 'waste'),

		-- GENERAL
		('Completed eco test this week', 10, 'general'),
		('Read an article about sustainability', 3, 'general')
	`)
	if err != nil {
		return err
	}

	fmt.Println("✔ eco_actions seeded successfully")
	return nil
}
