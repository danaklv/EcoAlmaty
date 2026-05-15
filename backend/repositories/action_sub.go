package repositories

import (
	"database/sql"
	"dl/models"
	"errors"
	"time"
)

type ActionSubmissionRepository struct {
	DB *sql.DB
}

func NewActionSubmissionRepository(db *sql.DB) *ActionSubmissionRepository {
	return &ActionSubmissionRepository{DB: db}
}

func (r *ActionSubmissionRepository) CreateSubmission(
	userID, actionID int64,
	photoURL string,
	points int,
) (int64, error) {
	var id int64

	err := r.DB.QueryRow(`
		INSERT INTO eco_action_submissions 
			(user_id, action_id, photo_url, status, points)
		VALUES ($1, $2, $3, 'pending', $4)
		RETURNING id
	`, userID, actionID, photoURL, points).Scan(&id)

	return id, err
}

func (r *ActionSubmissionRepository) UpdateAIResult(
	submissionID int64,
	status string,
	comment string,
	confidence float64,
) error {
	_, err := r.DB.Exec(`
		UPDATE eco_action_submissions
		SET status = $1,
		    ai_comment = $2,
		    ai_confidence = $3,
		    reviewed_at = $4
		WHERE id = $5
	`, status, comment, confidence, time.Now(), submissionID)

	return err
}

func (r *ActionSubmissionRepository) GetUserSubmissions(userID int64) ([]models.ActionSubmission, error) {
	rows, err := r.DB.Query(`
		SELECT 
			s.id,
			s.user_id,
			s.action_id,
			a.name,
			s.photo_url,
			s.status,
			COALESCE(s.ai_comment, ''),
			COALESCE(s.ai_confidence, 0),
			s.points,
			s.created_at,
			COALESCE(s.reviewed_at, s.created_at)
		FROM eco_action_submissions s
		JOIN eco_actions a ON a.id = s.action_id
		WHERE s.user_id = $1
		ORDER BY s.created_at DESC
	`, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.ActionSubmission

	for rows.Next() {
		var item models.ActionSubmission
		if err := rows.Scan(
			&item.ID,
			&item.UserID,
			&item.ActionID,
			&item.ActionName,
			&item.PhotoURL,
			&item.Status,
			&item.AIComment,
			&item.AIConfidence,
			&item.Points,
			&item.CreatedAt,
			&item.ReviewedAt,
		); err != nil {
			return nil, err
		}

		list = append(list, item)
	}

	return list, rows.Err()
}

func (r *ActionSubmissionRepository) HasPendingSubmissionToday(userID, actionID int64) (bool, error) {
	var exists bool

	err := r.DB.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM eco_action_submissions
			WHERE user_id = $1
			  AND action_id = $2
			  AND created_at::date = CURRENT_DATE
			  AND status IN ('pending', 'approved')
		)
	`, userID, actionID).Scan(&exists)

	return exists, err
}

func (r *ActionSubmissionRepository) GetActionNameAndPoints(actionID int64) (string, int, error) {
	var name string
	var points int

	err := r.DB.QueryRow(`
		SELECT name, points 
		FROM eco_actions 
		WHERE id = $1
	`, actionID).Scan(&name, &points)

	if err == sql.ErrNoRows {
		return "", 0, errors.New("action not found")
	}

	return name, points, err
}