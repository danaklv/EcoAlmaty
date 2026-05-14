package services

import (
	"database/sql"
	"dl/models"
	"dl/repositories"
	"errors"
)

type FriendsService struct {
	Repo *repositories.FriendsRepository
}

func NewFriendsService(repo *repositories.FriendsRepository) *FriendsService {
	return &FriendsService{Repo: repo}
}

func (s *FriendsService) SearchUsers(query string, excludeID int64) ([]repositories.UserSearchResult, error) {
	return s.Repo.SearchUsers(query, excludeID)
}

func (s *FriendsService) GetSentRequests(userID int64) ([]repositories.UserSearchResult, error) {
	return s.Repo.GetSentRequests(userID)
}

func (s *FriendsService) SendRequest(requesterID int64, username string) error {
	if username == "" {
		return errors.New("username is required")
	}
	addresseeID, err := s.Repo.GetUserByUsername(username)
	if err == sql.ErrNoRows {
		return errors.New("user not found")
	}
	if err != nil {
		return err
	}
	if addresseeID == requesterID {
		return errors.New("cannot send request to yourself")
	}
	return s.Repo.SendRequest(requesterID, addresseeID)
}

func (s *FriendsService) AcceptRequest(addresseeID, requesterID int64) error {
	return s.Repo.UpdateStatus(requesterID, addresseeID, "accepted")
}

func (s *FriendsService) RejectRequest(addresseeID, requesterID int64) error {
	return s.Repo.UpdateStatus(requesterID, addresseeID, "rejected")
}

func (s *FriendsService) GetFriends(userID int64) ([]repositories.FriendRequest, error) {
	return s.Repo.GetFriends(userID)
}

func (s *FriendsService) GetIncomingRequests(userID int64) ([]repositories.FriendRequest, error) {
	return s.Repo.GetIncomingRequests(userID)
}

func (s *FriendsService) GetFriendsLeaderboard(userID int64, limit, offset int) ([]models.LeaderboardEntry, int, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	items, err := s.Repo.GetFriendsLeaderboard(userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.Repo.CountFriendsLeaderboard(userID)
	if err != nil {
		return nil, 0, err
	}

	return items, total, nil
}
