package repositories

import (
	"database/sql"
	"dl/models"
	"errors"
	"time"
)

type RatingRepository struct {
	DB *sql.DB
}

func NewRatingRepository(db *sql.DB) *RatingRepository {
	return &RatingRepository{DB: db}
}

// ------------------------ GET ACTION POINTS ------------------------

func (r *RatingRepository) GetActionPoints(actionID int64) (int, error) {
	var points int
	err := r.DB.QueryRow(`SELECT points FROM eco_actions WHERE id = $1`, actionID).Scan(&points)
	if err == sql.ErrNoRows {
		return 0, errors.New("action not found")
	}
	return points, err
}

// ------------------------ ADD USER ACTION ------------------------

func (r *RatingRepository) AddUserAction(userID, actionID int64, points int) error {
	_, err := r.DB.Exec(`
        INSERT INTO user_actions (user_id, action_id, points, created_at)
        VALUES ($1, $2, $3, $4)
    `, userID, actionID, points, time.Now())
	return err
}

// ------------------------ UPDATE RATING ------------------------

func (r *RatingRepository) UpdateRating(userID int64, points int) error {
	_, err := r.DB.Exec(`UPDATE users SET rating = rating + $1 WHERE id = $2`, points, userID)
	return err
}

// ------------------------ GET LEVEL ------------------------

func (r *RatingRepository) GetUserLevel(userID int64) (int, error) {
	var level int
	err := r.DB.QueryRow(`SELECT level FROM users WHERE id = $1`, userID).Scan(&level)
	return level, err
}

// ------------------------ UPDATE LEVEL ------------------------

func (r *RatingRepository) UpdateLevel(userID int64, level int, league string) error {
	_, err := r.DB.Exec(`
        UPDATE users SET level = $1, league = $2 WHERE id = $3
    `, level, league, userID)
	return err
}

// ------------------------ APPLY ECO ACTION ------------------------

func (r *RatingRepository) ApplyEcoAction(
	userID, actionID int64,
	points int,
	level int,
	league string,
) error {

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
        INSERT INTO user_actions (user_id, action_id, points, created_at)
        VALUES ($1, $2, $3, NOW())
    `, userID, actionID, points)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
        UPDATE users SET rating = rating + $1 WHERE id = $2
    `, points, userID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
        UPDATE users SET level = $1, league = $2 WHERE id = $3
    `, level, league, userID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// ------------------------ GET USER ACTIONS ------------------------

func (r *RatingRepository) GetUserActions(userID int64) ([]models.UserAction, error) {
	rows, err := r.DB.Query(`
        SELECT ua.action_id, a.name, ua.points, ua.created_at
        FROM user_actions ua
        JOIN eco_actions a ON ua.action_id = a.id
        WHERE ua.user_id = $1
        ORDER BY ua.created_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var actions []models.UserAction

	for rows.Next() {
		var a models.UserAction
		if err := rows.Scan(
			&a.ActionID,
			&a.ActionName,
			&a.Points,
			&a.CreatedAt,
		); err != nil {
			return nil, err
		}

		actions = append(actions, a)
	}

	return actions, rows.Err()
}
// ------------------------ LEADERBOARD ------------------------

func (r *RatingRepository) GetLeaderboard(limit, offset int) ([]models.LeaderboardEntry, error) {
	rows, err := r.DB.Query(`
		SELECT 
			username,
			rating,
			level,
			league,
			COALESCE(profile_picture, '') AS profile_picture
		FROM users
		ORDER BY rating DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.LeaderboardEntry
	for rows.Next() {
		var e models.LeaderboardEntry
		if err := rows.Scan(
			&e.Username,
			&e.Rating,
			&e.Level,
			&e.League,
			&e.Avatar,
		); err != nil {
			return nil, err
		}
		list = append(list, e)
	}

	return list, rows.Err()
}

func (r *RatingRepository) CountLeaderboard() (int, error) {
	var total int
	err := r.DB.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&total)
	return total, err
}

// ------------------------ GET USER RATING ------------------------

func (r *RatingRepository) GetUserRating(userID int64) (int, error) {
	var rating int
	err := r.DB.QueryRow(
		`SELECT rating FROM users WHERE id = $1`,
		userID,
	).Scan(&rating)
	return rating, err
}

// ------------------------ CHECK ACTION USED TODAY ------------------------

func (r *RatingRepository) ActionUsedToday(userID, actionID int64) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`
        SELECT EXISTS (
            SELECT 1 FROM user_actions
            WHERE user_id = $1
              AND action_id = $2
              AND created_at::date = CURRENT_DATE
        )
    `, userID, actionID).Scan(&exists)
	return exists, err
}

// ------------------------ GET COMPLETED ACTION IDs TODAY ------------------------

func (r *RatingRepository) GetCompletedActionIDs(userID int64) ([]int64, error) {
	rows, err := r.DB.Query(`
        SELECT DISTINCT action_id 
        FROM user_actions 
        WHERE user_id = $1 
        AND created_at::date = CURRENT_DATE
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}


func (r *RatingRepository) GetEcoActions() ([]models.EcoAction, error) {
	rows, err := r.DB.Query(`
		SELECT id, name, points, category, cooldown_type
		FROM eco_actions
		ORDER BY category ASC, points DESC, name ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var actions []models.EcoAction

	for rows.Next() {
		var action models.EcoAction
		if err := rows.Scan(
			&action.ID,
			&action.Name,
			&action.Points,
			&action.Category,
			&action.CooldownType,
		); err != nil {
			return nil, err
		}

		actions = append(actions, action)
	}

	return actions, rows.Err()
}


func (r *RatingRepository) GetUserStats(userID int64) (*models.UserStats, error) {
	var stats models.UserStats

	err := r.DB.QueryRow(`
		SELECT id, rating, level, league
		FROM users
		WHERE id = $1
	`, userID).Scan(
		&stats.UserID,
		&stats.Rating,
		&stats.Level,
		&stats.League,
	)

	if err != nil {
		return nil, err
	}

	return &stats, nil
}