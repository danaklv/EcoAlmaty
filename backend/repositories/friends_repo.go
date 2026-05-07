package repositories

import (
	"database/sql"
	"dl/models"
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

type UserSearchResult struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	League   string `json:"league"`
	Level    int    `json:"level"`
}

func (r *FriendsRepository) SearchUsers(query string, excludeID int64) ([]UserSearchResult, error) {
	rows, err := r.DB.Query(`
		SELECT id, username, league, level
		FROM users
		WHERE username ILIKE $1 AND id != $2
		ORDER BY username
		LIMIT 20
	`, "%"+query+"%", excludeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []UserSearchResult
	for rows.Next() {
		var u UserSearchResult
		if err := rows.Scan(&u.ID, &u.Username, &u.League, &u.Level); err != nil {
			return nil, err
		}
		result = append(result, u)
	}
	return result, nil
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

func (r *FriendsRepository) GetFriendsLeaderboard(userID int64, limit, offset int) ([]models.LeaderboardEntry, error) {
	rows, err := r.DB.Query(`
		SELECT 
			u.id,
			u.username,
			u.rating,
			u.level,
			u.league,
			COALESCE(u.profile_picture, '') AS avatar
		FROM users u
		WHERE u.id = $1

		UNION

		SELECT 
			u.username,
			u.rating,
			u.level,
			u.league,
			COALESCE(u.profile_picture, '') AS avatar
		FROM users u
		WHERE u.id IN (
			SELECT 
				CASE
					WHEN fr.requester_id = $1 THEN fr.addressee_id
					ELSE fr.requester_id
				END AS friend_id
			FROM friends fr
			WHERE (fr.requester_id = $1 OR fr.addressee_id = $1)
			  AND fr.status = 'accepted'
		)

		ORDER BY rating DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.LeaderboardEntry

	for rows.Next() {
		var item models.LeaderboardEntry
		if err := rows.Scan(
			&item.UserID,
			&item.Username,
			&item.Rating,
			&item.Level,
			&item.League,
			&item.Avatar,
		); err != nil {
			return nil, err
		}

		list = append(list, item)
	}

	return list, rows.Err()
}

func (r *FriendsRepository) GetSentRequests(userID int64) ([]UserSearchResult, error) {
	rows, err := r.DB.Query(`                                                                                                                                                                          
		SELECT u.id, u.username, u.league, u.level
		FROM friends f                                                                                                                                                                                 
		JOIN users u ON f.addressee_id = u.id                                                                                                                                                        
		WHERE f.requester_id = $1 AND f.status = 'pending'                                                                                                                                             
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []UserSearchResult
	for rows.Next() {
		var u UserSearchResult
		if err := rows.Scan(&u.ID, &u.Username, &u.League, &u.Level); err != nil {
			return nil, err
		}
		result = append(result, u)
	}
	return result, nil
}

func (r *FriendsRepository) CountFriendsLeaderboard(userID int64) (int, error) {
	var total int

	err := r.DB.QueryRow(`
		SELECT COUNT(*)
		FROM users u
		WHERE u.id = $1
		   OR u.id IN (
				SELECT 
					CASE
						WHEN fr.requester_id = $1 THEN fr.addressee_id
						ELSE fr.requester_id
					END AS friend_id
				FROM friends fr
				WHERE (fr.requester_id = $1 OR fr.addressee_id = $1)
				  AND fr.status = 'accepted'
		   )
	`, userID).Scan(&total)

	return total, err
}
