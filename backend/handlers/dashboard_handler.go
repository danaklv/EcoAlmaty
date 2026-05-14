package handlers

import (
	"dl/services"
	"dl/utils"
	"net/http"
)

type DashboardHandler struct {
	ProfileService      *services.ProfileService
	RatingService       *services.RatingService
	EcoService          *services.EcoService
	GamificationService *services.GamificationService
	ChallengeService    *services.ChallengeService
}

func (h *DashboardHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	profile, _ := h.ProfileService.GetProfile(userID)
	leaderboard, _ := h.RatingService.GetLeaderboard(10)
	actions, _ := h.RatingService.GetUserActions(userID)
	ecoLatest, _ := h.EcoService.GetLatest(userID)
	streak, _ := h.GamificationService.GetStreak(userID)
	challenges, _ := h.ChallengeService.GetCurrent(userID)

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"profile":     profile,
		"leaderboard": leaderboard,
		"actions":     actions,
		"eco_latest":  ecoLatest,
		"streak":      streak,
		"challenges":  challenges,
	})
}
