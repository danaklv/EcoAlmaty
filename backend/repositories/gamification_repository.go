package repositories

import (
	"database/sql"
	"dl/models"
	"time"
)

type GamificationRepository struct {
	DB *sql.DB
}

func NewGamificationRepository(db *sql.DB) *GamificationRepository {
	return &GamificationRepository{DB: db}
}

func sameDate(a, b time.Time) bool {
	return a.Format("2006-01-02") == b.Format("2006-01-02")
}

func isYesterday(last, today time.Time) bool {
	return last.AddDate(0, 0, 1).Format("2006-01-02") == today.Format("2006-01-02")
}

func (r *GamificationRepository) UpdateStreak(userID int64, today time.Time) (*models.UserStreak, error) {
	var streak models.UserStreak
	var lastAction sql.NullTime

	err := r.DB.QueryRow(`
		SELECT user_id, current_streak, longest_streak, last_action_date, updated_at
		FROM user_streaks
		WHERE user_id = $1
	`, userID).Scan(
		&streak.UserID,
		&streak.CurrentStreak,
		&streak.LongestStreak,
		&lastAction,
		&streak.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		var created models.UserStreak
		err = r.DB.QueryRow(`
			INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_action_date, updated_at)
			VALUES ($1, 1, 1, $2, NOW())
			RETURNING user_id, current_streak, longest_streak, last_action_date, updated_at
		`, userID, today).Scan(
			&created.UserID,
			&created.CurrentStreak,
			&created.LongestStreak,
			&lastAction,
			&created.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		if lastAction.Valid {
			created.LastActionDate = &lastAction.Time
		}
		return &created, nil
	}

	if err != nil {
		return nil, err
	}

	if lastAction.Valid {
		streak.LastActionDate = &lastAction.Time
	}

	if streak.LastActionDate != nil {
		if sameDate(*streak.LastActionDate, today) {
			return &streak, nil
		}

		if isYesterday(*streak.LastActionDate, today) {
			streak.CurrentStreak++
		} else {
			streak.CurrentStreak = 1
		}
	} else {
		streak.CurrentStreak = 1
	}

	if streak.CurrentStreak > streak.LongestStreak {
		streak.LongestStreak = streak.CurrentStreak
	}

	var updated models.UserStreak
	var updatedLastAction sql.NullTime
	err = r.DB.QueryRow(`
		UPDATE user_streaks
		SET current_streak = $1,
			longest_streak = $2,
			last_action_date = $3,
			updated_at = NOW()
		WHERE user_id = $4
		RETURNING user_id, current_streak, longest_streak, last_action_date, updated_at
	`,
		streak.CurrentStreak,
		streak.LongestStreak,
		today,
		userID,
	).Scan(
		&updated.UserID,
		&updated.CurrentStreak,
		&updated.LongestStreak,
		&updatedLastAction,
		&updated.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if updatedLastAction.Valid {
		updated.LastActionDate = &updatedLastAction.Time
	}

	return &updated, nil
}

func (r *GamificationRepository) GetStreak(userID int64) (*models.UserStreak, error) {
	var streak models.UserStreak
	var lastAction sql.NullTime

	err := r.DB.QueryRow(`
		SELECT user_id, current_streak, longest_streak, last_action_date, updated_at
		FROM user_streaks
		WHERE user_id = $1
	`, userID).Scan(
		&streak.UserID,
		&streak.CurrentStreak,
		&streak.LongestStreak,
		&lastAction,
		&streak.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return &models.UserStreak{
			UserID:        userID,
			CurrentStreak: 0,
			LongestStreak: 0,
		}, nil
	}
	if err != nil {
		return nil, err
	}

	if lastAction.Valid {
		streak.LastActionDate = &lastAction.Time
	}

	return &streak, nil
}

func (r *GamificationRepository) CountUserActions(userID int64) (int, error) {
	var total int
	err := r.DB.QueryRow(`
		SELECT COUNT(*)
		FROM user_actions
		WHERE user_id = $1
	`, userID).Scan(&total)
	return total, err
}

func (r *GamificationRepository) CountUserTests(userID int64) (int, error) {
	var total int
	err := r.DB.QueryRow(`
		SELECT COUNT(*)
		FROM eco_results
		WHERE user_id = $1
	`, userID).Scan(&total)
	return total, err
}

func (r *GamificationRepository) GetBestEcoPercent(userID int64) (float64, error) {
	var best sql.NullFloat64
	err := r.DB.QueryRow(`
		SELECT MAX(percent)
		FROM eco_results
		WHERE user_id = $1
	`, userID).Scan(&best)
	if err != nil {
		return 0, err
	}
	if !best.Valid {
		return 0, nil
	}
	return best.Float64, nil
}

func (r *GamificationRepository) ListAchievements() ([]models.Achievement, error) {
	rows, err := r.DB.Query(`
		SELECT id, code, title, description, icon, category, metric, target_value
		FROM achievements
		ORDER BY category ASC, target_value ASC, id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.Achievement
	for rows.Next() {
		var a models.Achievement
		if err := rows.Scan(
			&a.ID,
			&a.Code,
			&a.Title,
			&a.Description,
			&a.Icon,
			&a.Category,
			&a.Metric,
			&a.TargetValue,
		); err != nil {
			return nil, err
		}
		result = append(result, a)
	}

	return result, rows.Err()
}

func (r *GamificationRepository) UnlockAchievement(userID, achievementID int64) error {
	_, err := r.DB.Exec(`
		INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (user_id, achievement_id) DO NOTHING
	`, userID, achievementID)
	return err
}

func (r *GamificationRepository) GetUnlockedAchievements(userID int64) (map[string]time.Time, error) {
	rows, err := r.DB.Query(`
		SELECT a.code, ua.unlocked_at
		FROM user_achievements ua
		JOIN achievements a ON a.id = ua.achievement_id
		WHERE ua.user_id = $1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]time.Time)
	for rows.Next() {
		var code string
		var unlockedAt time.Time
		if err := rows.Scan(&code, &unlockedAt); err != nil {
			return nil, err
		}
		result[code] = unlockedAt
	}

	return result, rows.Err()
}
