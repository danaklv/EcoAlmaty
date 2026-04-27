package repositories

import (
	"database/sql"
)

type FriendsRepository struct {
	DB *sql.DB
}

func NewFriendsRepository(db *sql.DB) *FriendsRepository {
	return &FriendsRepository{DB: db}
}

type FriendRequest struct {
	ID          int64  `json:"id"`
	RequesterID int64  `json:"requester_id"`
	AddresseeID int64  `json:"addressee_id"`
	Status      string `json:"status"`
	Username    string `json:"username"`
	Rating      int    `json:"rating"`
	Level       int    `json:"level"`
	League      string `json:"league"`
}

func (r *FriendsRepository) GetUserByUsername(username string) (int64, error) {
	var id int64
	err := r.DB.QueryRow(`SELECT id FROM users WHERE username = $1`, username).Scan(&id)
	return id, err
}

func (r *FriendsRepository) SendRequest(requesterID, addresseeID int64) error {
	_, err := r.DB.Exec(`
		INSERT INTO friends (requester_id, addressee_id, status)
		VALUES ($1, $2, 'pending')
		ON CONFLICT (requester_id, addressee_id) DO NOTHING
	`, requesterID, addresseeID)
	return err
}

func (r *FriendsRepository) UpdateStatus(requesterID, addresseeID int64, status string) error {
	_, err := r.DB.Exec(`
		UPDATE friends SET status = $1, updated_at = NOW()
		WHERE requester_id = $2 AND addressee_id = $3
	`, status, requesterID, addresseeID)
	return err
}

func (r *FriendsRepository) GetFriends(userID int64) ([]FriendRequest, error) {
	rows, err := r.DB.Query(`
		SELECT f.id, f.requester_id, f.addressee_id, f.status,
			u.username, u.rating, u.level, u.league
		FROM friends f
		JOIN users u ON (
			CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END = u.id
		)
		WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFriends(rows)
}

func (r *FriendsRepository) GetIncomingRequests(userID int64) ([]FriendRequest, error) {
	rows, err := r.DB.Query(`
		SELECT f.id, f.requester_id, f.addressee_id, f.status,
			u.username, u.rating, u.level, u.league
		FROM friends f
		JOIN users u ON f.requester_id = u.id
		WHERE f.addressee_id = $1 AND f.status = 'pending'
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanFriends(rows)
}

func scanFriends(rows *sql.Rows) ([]FriendRequest, error) {
	var result []FriendRequest
	for rows.Next() {
		var f FriendRequest
		if err := rows.Scan(&f.ID, &f.RequesterID, &f.AddresseeID, &f.Status,
			&f.Username, &f.Rating, &f.Level, &f.League); err != nil {
			return nil, err
		}
		result = append(result, f)
	}
	return result, nil
}
