package handlers

import (
	"dl/services"
	"dl/utils"
	"fmt"
	"io"
	"net/http"
	"os"
)

type ActionSubmissionHandler struct {
	Service *services.ActionSubmissionService
}

func NewActionSubmissionHandler(service *services.ActionSubmissionService) *ActionSubmissionHandler {
	return &ActionSubmissionHandler{Service: service}
}

func (h *ActionSubmissionHandler) SubmitActionPhoto(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		jsonError(w, http.StatusBadRequest, "could not parse form")
		return
	}

	actionID, err := parseInt64FormValue(r, "action_id")
	if err != nil {
		jsonError(w, http.StatusBadRequest, "action_id is required")
		return
	}

	file, handler, err := r.FormFile("photo")
	if err != nil {
		jsonError(w, http.StatusBadRequest, "photo is required")
		return
	}
	defer file.Close()

	if err := utils.ValidateImage(file, handler); err != nil {
		jsonError(w, http.StatusBadRequest, err.Error())
		return
	}

	filename := fmt.Sprintf("action_%d_user_%d_%s", actionID, userID, handler.Filename)
	filePath := fmt.Sprintf("./uploads/actions/%s", filename)

	if err := os.MkdirAll("./uploads/actions", os.ModePerm); err != nil {
		jsonError(w, http.StatusInternalServerError, "could not create upload directory")
		return
	}

	dst, err := os.Create(filePath)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "could not save file")
		return
	}
	defer dst.Close()

	if _, err := file.Seek(0, 0); err != nil {
		jsonError(w, http.StatusInternalServerError, "could not reset file")
		return
	}

	if _, err := io.Copy(dst, file); err != nil {
		jsonError(w, http.StatusInternalServerError, "failed to save image")
		return
	}

	publicPath := "/uploads/actions/" + filename

	if _, err := file.Seek(0, 0); err != nil {
		jsonError(w, http.StatusInternalServerError, "could not reset file")
		return
	}

	result, err := h.Service.SubmitActionPhoto(userID, actionID, publicPath, file)
	if err != nil {
		jsonError(w, http.StatusBadRequest, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"message":    "action submitted successfully",
		"ai_result":  result,
		"photo_url":  publicPath,
	})
}

func (h *ActionSubmissionHandler) GetMySubmissions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	userID, err := utils.UserIDFromContext(r.Context())
	if err != nil {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	submissions, err := h.Service.GetMySubmissions(userID)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse(w, http.StatusOK, submissions)
}

func parseInt64FormValue(r *http.Request, key string) (int64, error) {
	value := r.FormValue(key)
	if value == "" {
		return 0, fmt.Errorf("%s is required", key)
	}

	var result int64
	_, err := fmt.Sscanf(value, "%d", &result)
	if err != nil {
		return 0, err
	}

	return result, nil
}