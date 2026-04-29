package handlers

import (
	"dl/repositories"
	"dl/services"
	"dl/utils"
	"encoding/json"
	"net/http"
)

type FriendsHandler struct {
	Service *services.FriendsService
}

func (h *FriendsHandler) SendRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var body struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if err := h.Service.SendRequest(userID, body.Username); err != nil {
		jsonError(w, http.StatusBadRequest, err.Error())
		return
	}
	jsonResponse(w, http.StatusOK, map[string]string{"message": "request sent"})
}

func (h *FriendsHandler) RespondRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var body struct {
		RequesterID int64  `json:"requester_id"`
		Action      string `json:"action"` // "accept" or "reject"
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid body")
		return
	}
	switch body.Action {
	case "accept":
		err = h.Service.AcceptRequest(userID, body.RequesterID)
	case "reject":
		err = h.Service.RejectRequest(userID, body.RequesterID)
	default:
		jsonError(w, http.StatusBadRequest, "action must be accept or reject")
		return
	}
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	jsonResponse(w, http.StatusOK, map[string]string{"message": "done"})
}

func (h *FriendsHandler) GetFriends(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	friends, err := h.Service.GetFriends(userID)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if friends == nil {
		friends = []repositories.FriendRequest{}
	}
	jsonResponse(w, http.StatusOK, friends)
}

func (h *FriendsHandler) GetIncomingRequests(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	requests, err := h.Service.GetIncomingRequests(userID)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if requests == nil {
		requests = []repositories.FriendRequest{}
	}
	jsonResponse(w, http.StatusOK, requests)
}
