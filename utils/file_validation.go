package utils

import (
	"errors"
	"mime/multipart"
	"net/http"
	"path/filepath"
)

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
}

const maxFileSize = 5 * 1024 * 1024

func ValidateImage(file multipart.File, handler *multipart.FileHeader) error {
	ext := filepath.Ext(handler.Filename)
	if !allowedExtensions[ext] {
		return errors.New("invalid file type: only .jpg, .jpeg, .png, .gif allowed")
	}

	if handler.Size > maxFileSize {
		return errors.New("file too large: max 5MB allowed")
	}

	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil {
		return errors.New("failed to read file")
	}

	contentType := http.DetectContentType(buffer[:n])
	switch contentType {
	case "image/jpeg", "image/png", "image/gif":
	default:
		return errors.New("invalid image content type")
	}

	if _, err := file.Seek(0, 0); err != nil {
		return errors.New("failed to reset file pointer")
	}

	return nil
}