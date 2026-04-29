package utils

import (
	"errors"
	"fmt"
	"log"
	"os"
	"regexp"

	"gopkg.in/gomail.v2"
)

func ValidatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	upper := regexp.MustCompile(`[A-Z]`)
	lower := regexp.MustCompile(`[a-z]`)
	number := regexp.MustCompile(`[0-9]`)
	special := regexp.MustCompile(`[!@#~$%^&*()+|_]`)

	if !upper.MatchString(password) {
		return errors.New("password must contain at least one uppercase letter")
	}
	if !lower.MatchString(password) {
		return errors.New("password must contain at least one lowercase letter")
	}
	if !number.MatchString(password) {
		return errors.New("password must contain at least one digit")
	}
	if !special.MatchString(password) {
		return errors.New("password must contain at least one special character")
	}
	return nil
}

func SendResetPasswordEmail(to, resetLink string) error {
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	m := gomail.NewMessage()
	m.SetHeader("From", smtpUser)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Password Reset Request")
	m.SetBody(
		"text/plain",
		fmt.Sprintf(
			"We received a request to reset your password.\n\n"+
				"Click the link below to set a new one (valid for 15 minutes):\n\n"+
				"%s\n\n"+
				"If you didn’t request this, you can safely ignore this email.",
			resetLink,
		),
	)

	d := gomail.NewDialer("smtp.gmail.com", 587, smtpUser, smtpPass)

	if err := d.DialAndSend(m); err != nil {
		log.Println("Failed to send password reset email:", err)
		return err
	}

	return nil
}