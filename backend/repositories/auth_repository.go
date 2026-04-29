package repositories

import (
	"database/sql"
	"time"
)

type AuthRepository struct {
	DB *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
	return &AuthRepository{DB: db}
}

// ---------------- SAVE REFRESH TOKEN ----------------

func (r *AuthRepository) SaveRefreshToken(userID int64, token string, expires time.Time) error {
	_, err := r.DB.Exec(`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
    `, userID, token, expires)
	return err
}

// ---------------- REVOKE REFRESH TOKEN ----------------

func (r *AuthRepository) RevokeRefreshToken(token string) error {
	_, err := r.DB.Exec(`
        UPDATE refresh_tokens SET revoked = true
        WHERE token = $1
    `, token)
	return err
}

func (r *AuthRepository) GetRefreshToken(token string) (int64, time.Time, bool, error) {
	var userID int64
	var expires time.Time
	var revoked bool

	err := r.DB.QueryRow(`
		SELECT user_id, expires_at, revoked
		FROM refresh_tokens
		WHERE token = $1
	`, token).Scan(&userID, &expires, &revoked)

	return userID, expires, revoked, err
}
