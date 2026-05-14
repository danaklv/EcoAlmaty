package utils

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"log"
	"net/mail"
	"os"

	"gopkg.in/gomail.v2"
)

func ValidateEmail(email string) error {
	if email == "" {
		return errors.New("email is required")
	}
	_, err := mail.ParseAddress(email)
	if err != nil {
		return errors.New("invalid email format")
	}
	return nil
}

func SendVerificationEmail(to, code string) error {
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	frontURL := os.Getenv("FRONTEND_URL")

	m := gomail.NewMessage()
	m.SetHeader("From", smtpUser)
	m.SetHeader("To", to)
	m.SetHeader("Subject", "Verify your email")
	verifyLink := frontURL + "/verify?code=" + code

html := `
<div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:40px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:16px; padding:40px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    
    <h1 style="color:#2E7D32; text-align:center;">
      🌱 EcoAlmaty
    </h1>

    <h2 style="color:#333; text-align:center;">
      Verify your email
    </h2>

    <p style="font-size:16px; color:#555; line-height:1.6;">
      Thank you for joining EcoAlmaty — your platform for environmental awareness and sustainable living.
    </p>

    <p style="font-size:16px; color:#555; line-height:1.6;">
      Please confirm your email address to activate your account.
    </p>

    <div style="text-align:center; margin:40px 0;">
      <a href="` + verifyLink + `" 
         style="
           background:#43A047;
           color:white;
           padding:14px 28px;
           text-decoration:none;
           border-radius:10px;
           font-size:16px;
           font-weight:bold;
           display:inline-block;
         ">
         Verify Email
      </a>
    </div>

    <p style="font-size:14px; color:#888;">
      If you did not create an account, you can safely ignore this email.
    </p>

    <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">

    <p style="font-size:12px; color:#aaa; text-align:center;">
      EcoAlmaty • Environmental Awareness Platform
    </p>

  </div>
</div>
`

m.SetBody("text/html", html)

	d := gomail.NewDialer("smtp.gmail.com", 587, smtpUser, smtpPass)

	if err := d.DialAndSend(m); err != nil {
		log.Println("Failed to send email:", err)
		return err
	}
	return nil
}

func GenerateVerificationCode() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
