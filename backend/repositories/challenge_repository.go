package repositories

import (
	"database/sql"
	"dl/models"
	"time"
)

type ChallengeRepository struct {
	DB *sql.DB
}

func NewChallengeRepository(db *sql.DB) *ChallengeRepository {
	return &ChallengeRepository{DB: db}
}

func (r *ChallengeRepository) ExpireOldChallenges(userID int64, today time.Time) error {
	_, err := r.DB.Exec(`
		UPDATE user_challenges
		SET status = 'expired'
		WHERE user_id = $1
		  AND status = 'active'
		  AND end_date < $2::date
	`, userID, today)
	return err
}

func (r *ChallengeRepository) CreateChallengeIfNotExists(
	userID int64,
	code, title, description, scope, kind string,
	category *string,
	targetValue int,
	startDate, endDate time.Time,
) error {
	_, err := r.DB.Exec(`
		INSERT INTO user_challenges (
			user_id, code, title, description, scope, kind,
			category, target_value, progress, status, start_date, end_date
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'active', $9::date, $10::date)
		ON CONFLICT (user_id, code, start_date) DO NOTHING
	`,
		userID, code, title, description, scope, kind,
		category, targetValue, startDate, endDate,
	)
	return err
}

func (r *ChallengeRepository) ListCurrentChallenges(userID int64, today time.Time) ([]models.UserChallenge, error) {
	rows, err := r.DB.Query(`
		SELECT id, code, title, description, scope, kind,
		       COALESCE(category, ''), target_value, progress, status,
		       start_date, end_date,
		       COALESCE(TO_CHAR(completed_at, 'YYYY-MM-DD"T"HH24:MI:SS'), '')
		FROM user_challenges
		WHERE user_id = $1
		  AND start_date <= $2::date
		  AND end_date >= $2::date
		ORDER BY scope ASC, created_at ASC
	`, userID, today)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.UserChallenge
	for rows.Next() {
		var item models.UserChallenge
		if err := rows.Scan(
			&item.ID,
			&item.Code,
			&item.Title,
			&item.Description,
			&item.Scope,
			&item.Kind,
			&item.Category,
			&item.TargetValue,
			&item.Progress,
			&item.Status,
			&item.StartDate,
			&item.EndDate,
			&item.CompletedAt,
		); err != nil {
			return nil, err
		}
		result = append(result, item)
	}

	return result, rows.Err()
}

func (r *ChallengeRepository) IncrementActionChallenges(userID int64, actionCategory string, today time.Time) error {
	_, err := r.DB.Exec(`
		UPDATE user_challenges
		SET progress = LEAST(progress + 1, target_value),
		    status = CASE
		        WHEN progress + 1 >= target_value THEN 'completed'
		        ELSE status
		    END,
		    completed_at = CASE
		        WHEN completed_at IS NULL AND progress + 1 >= target_value THEN NOW()
		        ELSE completed_at
		    END
		WHERE user_id = $1
		  AND status = 'active'
		  AND start_date <= $2::date
		  AND end_date >= $2::date
		  AND (
		        kind = 'action_count'
		        OR (kind = 'category_action_count' AND category = $3)
		  )
	`, userID, today, actionCategory)
	return err
}

func (r *ChallengeRepository) IncrementTestChallenges(userID int64, today time.Time) error {
	_, err := r.DB.Exec(`
		UPDATE user_challenges
		SET progress = LEAST(progress + 1, target_value),
		    status = CASE
		        WHEN progress + 1 >= target_value THEN 'completed'
		        ELSE status
		    END,
		    completed_at = CASE
		        WHEN completed_at IS NULL AND progress + 1 >= target_value THEN NOW()
		        ELSE completed_at
		    END
		WHERE user_id = $1
		  AND status = 'active'
		  AND start_date <= $2::date
		  AND end_date >= $2::date
		  AND kind = 'test_count'
	`, userID, today)
	return err
}

func (r *ChallengeRepository) GetLatestWeakestCategory(userID int64) (string, error) {
	var category sql.NullString
	err := r.DB.QueryRow(`
		SELECT weakest_category
		FROM eco_results
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`, userID).Scan(&category)

	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	if category.Valid {
		return category.String, nil
	}
	return "", nil
}

func (r *ChallengeRepository) GetActionMeta(actionID int64) (int, string, error) {
	var points int
	var category string
	err := r.DB.QueryRow(`
		SELECT points, category
		FROM eco_actions
		WHERE id = $1
	`, actionID).Scan(&points, &category)
	return points, category, err
}
