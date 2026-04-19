package middleware

import (
	"dl/utils"
	"encoding/json"
	"net/http"
	"strings"
)

func writeJSONError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": msg,
	})
}

func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeJSONError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			writeJSONError(w, http.StatusUnauthorized, "invalid token format")
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			writeJSONError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		ctx := utils.ContextWithUserID(r.Context(), claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}