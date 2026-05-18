package services

import (
	"dl/repositories"
	"dl/utils"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	Users *repositories.UserRepository
	Auth  *repositories.AuthRepository
}

func NewAuthService(
	userRepo *repositories.UserRepository,
	authRepo *repositories.AuthRepository,
) *AuthService {
	return &AuthService{
		Users: userRepo,
		Auth:  authRepo,
	}
}

// --------------------------------------------------------
// REGISTER
// --------------------------------------------------------

func (s *AuthService) Register(username, email, password string) (string, string, error) {
	// trim
	username = strings.TrimSpace(username)
	email = strings.TrimSpace(email)

	// validation
	if err := utils.ValidateEmail(email); err != nil {
		return "", "", err
	}
	if err := utils.ValidateUsername(username); err != nil {
		return "", "", err
	}
	if err := utils.ValidatePassword(password); err != nil {
		return "", "", err
	}

	// hash
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", "", err
	}

	// try to create user
	userID, err := s.Users.CreateUser(username, email, hashed)

	// unique errors
	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok && pgErr.Code == "23505" {
			if strings.Contains(pgErr.Message, "users_email_key") {
				_ = s.Users.DeleteUnverifiedUserByEmail(email)
	
				userID, err = s.Users.CreateUser(username, email, hashed)
				if err != nil {
					return "", "", err
				}
			} else if strings.Contains(pgErr.Message, "users_username_key") {
				return "", "", errors.New("username already exists")
			} else {
				return "", "", errors.New("user already exists")
			}
		} else {
			return "", "", err
		}
	}

	// generate verification code
	code := utils.GenerateVerificationCode()
	expires := time.Now().Add(24 * time.Hour)

	// store code
	if err := s.Users.StoreVerificationCode(userID, code, expires); err != nil {
		return "", "", err
	}

	// send email
	if err := utils.SendVerificationEmail(email, code); err != nil {
		_ = s.Users.DeleteUnverifiedUser(userID)
		return "", "", errors.New("failed to send verification email")
	}
	// do not return tokens until email is verified
	// return "", "", nil
	access, refresh, err := utils.GenerateTokens(userID)
	if err != nil {
	    return "", "", err
	}
	if err := s.Auth.SaveRefreshToken(
	    userID,
	    refresh,
	    time.Now().Add(7*24*time.Hour),
	); err != nil {
	    return "", "", err
	}
	return access, refresh, nil
	}

// --------------------------------------------------------
// LOGIN
// --------------------------------------------------------

func (s *AuthService) Login(email, password string) (string, string, error) {
	email = strings.TrimSpace(email)

	userID, hashed, verified, err := s.Users.GetUserByEmail(email)
	fmt.Println(err)
	if err != nil {
		return "", "", errors.New("invalid email or password")
	}

	if bcrypt.CompareHashAndPassword(hashed, []byte(password)) != nil {
		return "", "", errors.New("invalid email or password")
	}

	if !verified {
		return "", "", errors.New("email not verified")
	}

	access, refresh, err := utils.GenerateTokens(userID)
	if err != nil {
		return "", "", err
	}

	// ⬇️ СОХРАНЯЕМ refresh token
	_ = s.Auth.SaveRefreshToken(
		userID,
		refresh,
		time.Now().Add(7*24*time.Hour),
	)

	return access, refresh, nil
}

// --------------------------------------------------------
// LOGOUT
// --------------------------------------------------------

func (s *AuthService) Logout(refreshToken string) error {
	_, expires, revoked, err := s.Auth.GetRefreshToken(refreshToken)
	if err != nil {
		return errors.New("invalid refresh token")
	}

	if revoked {
		return errors.New("token already revoked")
	}

	if time.Now().After(expires) {
		return errors.New("token expired")
	}

	return s.Auth.RevokeRefreshToken(refreshToken)
}

// --------------------------------------------------------
// VERIFY EMAIL
// --------------------------------------------------------

func (s *AuthService) VerifyEmail(code string) (string, string, error) {
	userID, expires, err := s.Users.GetUserByVerificationCode(code)
	if err != nil {
		return "", "", errors.New("invalid or expired verification link")
	}

	if time.Now().After(expires) {
		_ = s.Users.DeleteVerificationCode(userID)
		return "", "", errors.New("verification link expired")
	}

	if err := s.Users.SetUserVerified(userID); err != nil {
		return "", "", err
	}

	if err := s.Users.DeleteVerificationCode(userID); err != nil {
		return "", "", err
	}
	access, refresh, err := utils.GenerateTokens(userID)
	if err != nil {
		return "", "", err
	}

	if err := s.Auth.SaveRefreshToken(
		userID,
		refresh,
		time.Now().Add(7*24*time.Hour),
	); err != nil {
		return "", "", err
	}

	return access, refresh, nil

}

// --------------------------------------------------------
// REQUEST PASSWORD RESET
// --------------------------------------------------------

func (s *AuthService) RequestPasswordReset(email string) error {
	userID, _, _, err := s.Users.GetUserByEmail(email)
	if err != nil {
		return errors.New("user not found")
	}

	token := uuid.New().String()
	expires := time.Now().Add(15 * time.Minute)

	if err := s.Users.CreatePasswordReset(userID, token, expires); err != nil {
		return err
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	resetLink := frontendURL + "/reset-password?token=" + token
	go utils.SendResetPasswordEmail(email, resetLink)

	return nil
}

// --------------------------------------------------------
// RESET PASSWORD
// --------------------------------------------------------

func (s *AuthService) ResetPassword(token, newPassword string) error {
	userID, expires, used, err := s.Users.GetPasswordReset(token)
	if err != nil {
		return errors.New("invalid or expired token")
	}

	if used || time.Now().After(expires) {
		return errors.New("token expired or already used")
	}

	// validate new password
	if err := utils.ValidatePassword(newPassword); err != nil {
		return err
	}

	// hash new password
	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// update password
	if err := s.Users.UpdateUserPassword(userID, hashed); err != nil {
		return err
	}

	// mark token as used
	return s.Users.MarkResetTokenUsed(token)
}

func (s *AuthService) Refresh(refreshToken string) (string, string, error) {

	userID, expires, revoked, err := s.Auth.GetRefreshToken(refreshToken)
	if err != nil {
		return "", "", errors.New("invalid refresh token")
	}

	if revoked {
		return "", "", errors.New("token revoked")
	}

	if time.Now().After(expires) {
		return "", "", errors.New("token expired")
	}

	// генерим новые токены
	access, newRefresh, err := utils.GenerateTokens(userID)
	if err != nil {
		return "", "", err
	}

	// инвалидируем старый
	if err := s.Auth.RevokeRefreshToken(refreshToken); err != nil {
		return "", "", err
	}

	// сохраняем новый
	if err := s.Auth.SaveRefreshToken(
		userID,
		newRefresh,
		time.Now().Add(7*24*time.Hour),
	); err != nil {
		return "", "", err
	}

	return access, newRefresh, nil
}
