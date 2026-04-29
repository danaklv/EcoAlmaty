package services

import (
	"database/sql"
	"dl/repositories"
	"errors"
)

type FriendsService struct {
	Repo *repositories.FriendsRepository
}

func NewFriendsService(repo *repositories.FriendsRepository) *FriendsService {
	return &FriendsService{Repo: repo}
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