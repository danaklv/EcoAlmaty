package handlers

import (
	"dl/models"
	"dl/services"
	"dl/utils"
	"encoding/json"
	"net/http"
	"strconv"
)

type RatingHandler struct {
	Service *services.RatingService
}

// ------------------------ ADD ECO ACTION ------------------------

func (h *RatingHandler) AddAction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var data struct {
		ActionID int64 `json:"action_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	if data.ActionID == 0 {
		jsonError(w, http.StatusBadRequest, "action_id is required")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	result, err := h.Service.AddEcoAction(userID, data.ActionID)
if err != nil {
	jsonError(w, http.StatusBadRequest, err.Error())
	return
}

jsonResponse(w, http.StatusOK, map[string]interface{}{
	"message":    "action recorded successfully",
	"new_rating": result.NewRating,
	"new_level":  result.NewLevel,
	"new_league": result.NewLeague,
})

	
}

// ------------------------ GET USER ACTION HISTORY ------------------------

func (h *RatingHandler) GetUserActions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	actions, err := h.Service.GetUserActions(userID)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, actions)
}

// ------------------------ GET LEADERBOARD ------------------------

func (h *RatingHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	limit := 10
	offset := 0

	if v := r.URL.Query().Get("limit"); v != "" {
		parsed, err := strconv.Atoi(v)
		if err != nil || parsed <= 0 || parsed > 100 {
			jsonError(w, http.StatusBadRequest, "invalid limit")
			return
		}
		limit = parsed
	}

	if v := r.URL.Query().Get("offset"); v != "" {
		parsed, err := strconv.Atoi(v)
		if err != nil || parsed < 0 {
			jsonError(w, http.StatusBadRequest, "invalid offset")
			return
		}
		offset = parsed
	}

	leaderboard, err := h.Service.GetLeaderboard(limit, offset)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	total, err := h.Service.CountLeaderboard()
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"items":  leaderboard,
		"limit":  limit,
		"offset": offset,
		"total":  total,
	})
}

func (h *RatingHandler) GetEcoActions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	actions, err := h.Service.GetEcoActions()
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if actions == nil {
		actions = []models.EcoAction{}
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"items": actions,
	})
}
