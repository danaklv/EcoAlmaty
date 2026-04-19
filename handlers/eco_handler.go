package handlers

import (
	"dl/models"
	"dl/services"
	"dl/utils"
	"encoding/json"
	"net/http"
	"strconv"
)

type EcoHandler struct {
	Service *services.EcoService
}

func (h *EcoHandler) Submit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.EcoAnswerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	if len(req.Answers) == 0 {
		jsonError(w, http.StatusBadRequest, "answers are required")
		return
	}

	result, err := h.Service.SubmitAnswers(userID, req.Answers)
	if err != nil {
		jsonError(w, http.StatusBadRequest, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, result)
}

func (h *EcoHandler) GetLatest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	result, err := h.Service.GetLatest(userID)
	if err != nil {
		jsonError(w, http.StatusNotFound, "no results found")
		return
	}

	jsonResponse(w, http.StatusOK, result)
}

func (h *EcoHandler) GetResult(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	resultIDStr := r.URL.Query().Get("id")
	if resultIDStr == "" {
		jsonError(w, http.StatusBadRequest, "id is required")
		return
	}

	resultID, err := strconv.ParseInt(resultIDStr, 10, 64)
	if err != nil || resultID <= 0 {
		jsonError(w, http.StatusBadRequest, "invalid id")
		return
	}

	result, err := h.Service.GetResult(userID, resultID)
	if err != nil {
		jsonError(w, http.StatusNotFound, "result not found")
		return
	}

	jsonResponse(w, http.StatusOK, result)
}

func (h *EcoHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
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

	result, err := h.Service.GetHistory(userID, limit, offset)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, result)
}

func (h *EcoHandler) GetProgress(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	days := 30
	if v := r.URL.Query().Get("days"); v != "" {
		parsed, err := strconv.Atoi(v)
		if err != nil || parsed <= 0 || parsed > 365 {
			jsonError(w, http.StatusBadRequest, "invalid days")
			return
		}
		days = parsed
	}

	result, err := h.Service.GetProgress(userID, days)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, result)
}

func (h *EcoHandler) GetQuestions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	questions, err := h.Service.GetQuestions()
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, questions)
}