package handlers

import (
	"dl/services"
	"net/http"
	"strconv"
)

type NewsHandler struct {
	Service *services.NewsService
}

func NewNewsHandler(service *services.NewsService) *NewsHandler {
	return &NewsHandler{Service: service}
}

// ------------------------ GET ALL NEWS ------------------------

func (h *NewsHandler) GetAll(w http.ResponseWriter, r *http.Request) {
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

	news, err := h.Service.GetNews(limit, offset)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	total, err := h.Service.CountNews()
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"items":  news,
		"limit":  limit,
		"offset": offset,
		"total":  total,
	})
}
