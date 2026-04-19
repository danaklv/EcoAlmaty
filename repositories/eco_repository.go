package repositories

import (
	"database/sql"
	"dl/models"
	"time"
)

type EcoRepository struct {
	DB *sql.DB
}

func NewEcoRepository(db *sql.DB) *EcoRepository {
	return &EcoRepository{DB: db}
}

func (r *EcoRepository) GetQuestions() ([]models.EcoQuestion, error) {
	rows, err := r.DB.Query(`
        SELECT id, category, question, max_value, weight, is_reverse, tip
        FROM eco_questions
        ORDER BY id ASC
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []models.EcoQuestion

	for rows.Next() {
		var q models.EcoQuestion
		if err := rows.Scan(
			&q.ID,
			&q.Category,
			&q.Question,
			&q.MaxValue,
			&q.Weight,
			&q.IsReverse,
			&q.Tip,
		); err != nil {
			return nil, err
		}
		questions = append(questions, q)
	}

	return questions, rows.Err()
}

func (r *EcoRepository) SaveSubmission(
	userID int64,
	answers map[int]int,
	totalScore float64,
	maxScore float64,
	percent float64,
	category string,
	description string,
	strongestCategory string,
	weakestCategory string,
	breakdown []models.EcoCategoryBreakdown,
	recommendations []models.EcoPersonalRecommendation,
) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for qID, value := range answers {
		_, err := tx.Exec(`
			INSERT INTO eco_answers (user_id, question_id, value)
			VALUES ($1, $2, $3)
		`, userID, qID, value)
		if err != nil {
			return err
		}
	}

	var resultID int64
	err = tx.QueryRow(`
		INSERT INTO eco_results (
			user_id,
			total_score,
			max_score,
			percent,
			category,
			description,
			strongest_category,
			weakest_category
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`,
		userID,
		totalScore,
		maxScore,
		percent,
		category,
		description,
		strongestCategory,
		weakestCategory,
	).Scan(&resultID)
	if err != nil {
		return err
	}

	for _, b := range breakdown {
		_, err := tx.Exec(`
			INSERT INTO eco_result_breakdowns (
				result_id,
				category,
				score,
				max_score,
				percent,
				level
			)
			VALUES ($1, $2, $3, $4, $5, $6)
		`,
			resultID,
			b.Category,
			b.Score,
			b.MaxScore,
			b.Percent,
			b.Level,
		)
		if err != nil {
			return err
		}
	}

	for _, rec := range recommendations {
		_, err := tx.Exec(`
			INSERT INTO eco_result_recommendations (
				result_id,
				question,
				category,
				answer,
				max_value,
				impact,
				tip
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`,
			resultID,
			rec.Question,
			rec.Category,
			rec.Answer,
			rec.MaxValue,
			rec.Impact,
			rec.Tip,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *EcoRepository) GetLatestResult(userID int64) (*models.EcoResult, error) {
	var result models.EcoResult

	err := r.DB.QueryRow(`
        SELECT
            id,
            total_score,
            max_score,
            percent,
            category,
            description,
            strongest_category,
            weakest_category,
            created_at
        FROM eco_results
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
    `, userID).Scan(
		&result.ID,
		&result.TotalScore,
		&result.MaxScore,
		&result.Percent,
		&result.Category,
		&result.Description,
		&result.StrongestCategory,
		&result.WeakestCategory,
		&result.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	result.UserID = userID

	if err := r.loadResultDetails(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (r *EcoRepository) GetResultByID(userID, resultID int64) (*models.EcoResult, error) {
	var result models.EcoResult

	err := r.DB.QueryRow(`
        SELECT
            id,
            total_score,
            max_score,
            percent,
            category,
            description,
            strongest_category,
            weakest_category,
            created_at
        FROM eco_results
        WHERE id = $1 AND user_id = $2
    `, resultID, userID).Scan(
		&result.ID,
		&result.TotalScore,
		&result.MaxScore,
		&result.Percent,
		&result.Category,
		&result.Description,
		&result.StrongestCategory,
		&result.WeakestCategory,
		&result.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	result.UserID = userID

	if err := r.loadResultDetails(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (r *EcoRepository) loadResultDetails(result *models.EcoResult) error {
	breakdownRows, err := r.DB.Query(`
        SELECT category, score, max_score, percent, level
        FROM eco_result_breakdowns
        WHERE result_id = $1
        ORDER BY percent DESC
    `, result.ID)
	if err != nil {
		return err
	}
	defer breakdownRows.Close()

	for breakdownRows.Next() {
		var b models.EcoResultBreakdown
		if err := breakdownRows.Scan(
			&b.Category,
			&b.Score,
			&b.MaxScore,
			&b.Percent,
			&b.Level,
		); err != nil {
			return err
		}
		b.ResultID = result.ID
		result.Breakdown = append(result.Breakdown, b)
	}
	if err := breakdownRows.Err(); err != nil {
		return err
	}

	recRows, err := r.DB.Query(`
        SELECT question, category, answer, max_value, impact, tip
        FROM eco_result_recommendations
        WHERE result_id = $1
        ORDER BY impact DESC, id ASC
    `, result.ID)
	if err != nil {
		return err
	}
	defer recRows.Close()

	for recRows.Next() {
		var rec models.EcoPersonalRecommendation
		if err := recRows.Scan(
			&rec.Question,
			&rec.Category,
			&rec.Answer,
			&rec.MaxValue,
			&rec.Impact,
			&rec.Tip,
		); err != nil {
			return err
		}
		result.Recommendations = append(result.Recommendations, rec)
	}
	return recRows.Err()
}

func (r *EcoRepository) GetHistory(userID int64, limit, offset int) ([]models.EcoResult, error) {
	rows, err := r.DB.Query(`
        SELECT
            id,
            total_score,
            max_score,
            percent,
            category,
            description,
            strongest_category,
            weakest_category,
            created_at
        FROM eco_results
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
    `, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.EcoResult
	for rows.Next() {
		var item models.EcoResult
		if err := rows.Scan(
			&item.ID,
			&item.TotalScore,
			&item.MaxScore,
			&item.Percent,
			&item.Category,
			&item.Description,
			&item.StrongestCategory,
			&item.WeakestCategory,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}
		item.UserID = userID
		items = append(items, item)
	}

	return items, rows.Err()
}

func (r *EcoRepository) CountHistory(userID int64) (int, error) {
	var total int
	err := r.DB.QueryRow(`
        SELECT COUNT(*)
        FROM eco_results
        WHERE user_id = $1
    `, userID).Scan(&total)
	return total, err
}

func (r *EcoRepository) GetProgressRows(userID int64, since time.Time) ([]models.EcoProgressRow, error) {
	rows, err := r.DB.Query(`
        SELECT
            r.id,
            r.created_at,
            r.percent,
            b.category,
            b.percent
        FROM eco_results r
        LEFT JOIN eco_result_breakdowns b ON b.result_id = r.id
        WHERE r.user_id = $1
          AND r.created_at >= $2
        ORDER BY r.created_at ASC, b.category ASC
    `, userID, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.EcoProgressRow
	for rows.Next() {
		var row models.EcoProgressRow
		if err := rows.Scan(
			&row.ResultID,
			&row.TakenAt,
			&row.OverallPercent,
			&row.Category,
			&row.CategoryPercent,
		); err != nil {
			return nil, err
		}
		result = append(result, row)
	}

	return result, rows.Err()
}
