package handlers

import (
	"dl/services"
	"dl/utils"
	"net/http"
)

type GamificationHandler struct {
	Service *services.GamificationService
}

func (h *GamificationHandler) GetStreak(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	result, err := h.Service.GetStreak(userID)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, result)
}

func (h *GamificationHandler) GetAchievements(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	result, err := h.Service.GetAchievements(userID)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"items": result,
	})
}