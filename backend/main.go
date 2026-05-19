package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"syscall"
	"time"

	"dl/handlers"
	"dl/middleware"
	"dl/repositories"
	"dl/seeders"
	"dl/services"
	"dl/utils"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	_ = godotenv.Load()

	// --- Конфигурация (env с fallback) ---
	dbURL := getenv("DATABASE_URL", "postgres://postgres:password@localhost:5432/ecoApp?sslmode=disable")
	port := getenv("PORT", "8080")
	addr := ":" + port
	uploadsDir := getenv("UPLOADS_DIR", "./uploads")
	newsIntervalMin := getenvInt("NEWS_INTERVAL_MIN", 30)

	if err := utils.EnsureJWTSecret(); err != nil {
		log.Fatal(err)
	}

	// --- Создать папку uploads если нет ---
	if err := ensureDir(uploadsDir); err != nil {
		log.Fatalf("failed to ensure uploads dir: %v", err)
	}

	// --- DB init ---
	db := InitDB(dbURL)
	defer db.Close()

	if err := seeders.RunAllSeeders(db); err != nil {
		log.Fatal("Failed to run seeders: ", err)
	}

	authLimiter := middleware.NewRateLimiter(5, time.Minute)
	passwordLimiter := middleware.NewRateLimiter(3, time.Minute)
	// --- AUTH ---
	userRepo := repositories.NewUserRepository(db)
	authRepo := repositories.NewAuthRepository(db)
	authService := services.NewAuthService(userRepo, authRepo)
	authHandler := &handlers.AuthHandler{Service: authService}

	// --- PROFILE ---
	profileRepo := repositories.NewProfileRepository(db)
	profileService := services.NewProfileService(profileRepo)
	profileHandler := &handlers.ProfileHandler{Service: profileService}

	// --- GAMIFICATION ---

	gamificationRepo := repositories.NewGamificationRepository(db)
	gamificationService := services.NewGamificationService(gamificationRepo)
	gamificationHandler := &handlers.GamificationHandler{Service: gamificationService}

	// --- CHALLENGES ---
	challengeRepo := repositories.NewChallengeRepository(db)
	challengeService := services.NewChallengeService(challengeRepo)
	challengeHandler := &handlers.ChallengeHandler{Service: challengeService}

	// --- RATING ---
	ratingRepo := repositories.NewRatingRepository(db)
	ratingService := services.NewRatingService(
		ratingRepo,
		gamificationService,
		challengeService,
		challengeRepo,
	)
	ratingHandler := &handlers.RatingHandler{Service: ratingService}

	// --- FRIENDS ---
	friendsRepo := repositories.NewFriendsRepository(db)
	friendsService := services.NewFriendsService(friendsRepo)
	friendsHandler := &handlers.FriendsHandler{Service: friendsService}

	// --- NEWS ---
	newsRepo := repositories.NewNewsRepository(db)
	newsService := services.NewNewsService(newsRepo)
	newsHandler := handlers.NewNewsHandler(newsService)

	// --- ECO ---
	ecoRepo := repositories.NewEcoRepository(db)
	ecoService := services.NewEcoService(
		ecoRepo,
		gamificationService,
		challengeService,
	)
	ecoHandler := handlers.EcoHandler{Service: ecoService}

	// AI CHECK
	submissionRepo := repositories.NewActionSubmissionRepository(db)
	aiService := services.NewHuggingFaceModerationService()
	submissionService := services.NewActionSubmissionService(
		submissionRepo,
		ratingService,
		aiService,
	)
	submissionHandler := handlers.NewActionSubmissionHandler(submissionService)

	// --- Router ---
	mux := http.NewServeMux()

	dashboardHandler := &handlers.DashboardHandler{
		ProfileService:      profileService,
		RatingService:       ratingService,
		EcoService:          ecoService,
		GamificationService: gamificationService,
	}

	mux.Handle(
		"/dashboard",
		middleware.JWTAuth(http.HandlerFunc(dashboardHandler.GetDashboard)),
	)
	// Public auth routes
	mux.Handle("/register", authLimiter.Limit(http.HandlerFunc(authHandler.Register)))
	mux.Handle("/login", authLimiter.Limit(http.HandlerFunc(authHandler.Login)))
	mux.Handle("/forgot-password", passwordLimiter.Limit(http.HandlerFunc(authHandler.ForgotPassword)))

	mux.HandleFunc("/verify", authHandler.Verify)
	mux.HandleFunc("/reset-password", authHandler.ResetPassword)
	mux.HandleFunc("/refresh", authHandler.Refresh)
	mux.HandleFunc("/logout", authHandler.Logout)
	// TODO: add /refresh, /logout endpoints in AuthHandler (and implement refresh token storage)

	// Static uploads
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadsDir))))

	// Friends routes
	mux.Handle("/friends/send", middleware.JWTAuth(http.HandlerFunc(friendsHandler.SendRequest)))
	mux.Handle("/friends/respond", middleware.JWTAuth(http.HandlerFunc(friendsHandler.RespondRequest)))
	mux.Handle("/friends", middleware.JWTAuth(http.HandlerFunc(friendsHandler.GetFriends)))
	mux.Handle("/friends/requests", middleware.JWTAuth(http.HandlerFunc(friendsHandler.GetIncomingRequests)))
	mux.Handle("/users/search", middleware.JWTAuth(http.HandlerFunc(friendsHandler.SearchUsers)))
	mux.Handle("/friends/sent", middleware.JWTAuth(http.HandlerFunc(friendsHandler.GetSentRequests)))

	// Protected profile routes (JWTAuth wrapper uses current signature: middleware.JWTAuth(next http.HandlerFunc) http.HandlerFunc)
	mux.Handle("/eco", middleware.JWTAuth(http.HandlerFunc(ecoHandler.GetQuestions)))
	mux.Handle("/profile", middleware.JWTAuth(http.HandlerFunc(profileHandler.GetProfile)))
	mux.Handle("/update-profile", middleware.JWTAuth(http.HandlerFunc(profileHandler.UpdateProfile)))
	mux.Handle("/delete-profile", middleware.JWTAuth(http.HandlerFunc(profileHandler.DeleteProfile)))
	mux.Handle("/upload-avatar", middleware.JWTAuth(http.HandlerFunc(profileHandler.UploadAvatar)))

	mux.Handle("/eco-actions", middleware.JWTAuth(http.HandlerFunc(ratingHandler.GetEcoActions)))
	mux.Handle("/add-action", middleware.JWTAuth(http.HandlerFunc(ratingHandler.AddAction)))
	mux.Handle("/user-actions", middleware.JWTAuth(http.HandlerFunc(ratingHandler.GetUserActions)))
	mux.Handle("/leaderboard", middleware.JWTAuth(http.HandlerFunc(ratingHandler.GetLeaderboard)))

	//gamification routes
	mux.Handle("/gamification/streak", middleware.JWTAuth(http.HandlerFunc(gamificationHandler.GetStreak)))
	mux.Handle("/gamification/achievements", middleware.JWTAuth(http.HandlerFunc(gamificationHandler.GetAchievements)))

	mux.Handle("/challenges/current", middleware.JWTAuth(http.HandlerFunc(challengeHandler.GetCurrent)))

	// =============================
	// ECO FOOTPRINT TEST
	// =============================
	mux.Handle("/eco/questions", middleware.JWTAuth(http.HandlerFunc(ecoHandler.GetQuestions)))
	mux.Handle("/eco/submit", middleware.JWTAuth(http.HandlerFunc(ecoHandler.Submit)))
	mux.Handle("/eco/latest", middleware.JWTAuth(http.HandlerFunc(ecoHandler.GetLatest)))
	mux.Handle("/eco/result", middleware.JWTAuth(http.HandlerFunc(ecoHandler.GetResult)))
	mux.Handle("/eco/history", middleware.JWTAuth(http.HandlerFunc(ecoHandler.GetHistory)))
	mux.Handle("/eco/progress", middleware.JWTAuth(http.HandlerFunc(ecoHandler.GetProgress)))

	//forecast
	mux.Handle("/forecast/bot", middleware.JWTAuth(http.HandlerFunc(forecastBotProxyHandler)))
	mux.Handle("/forecast/proxy", middleware.JWTAuth(http.HandlerFunc(forecastProxyHandler)))
	
	// AI ROUTE
	mux.Handle(
		"/actions/submit",
		middleware.JWTAuth(http.HandlerFunc(submissionHandler.SubmitActionPhoto)),
	)

	mux.Handle(
		"/my-submissions",
		middleware.JWTAuth(http.HandlerFunc(submissionHandler.GetMySubmissions)),
	)

	// News (public)
	mux.HandleFunc("/news", newsHandler.GetAll)

	// Middleware chain: CORS -> (optionally Logging/Recovery) -> mux
	handler := middleware.EnableCORS(mux)
	handler = middleware.RequestLogger(handler)
	handler = middleware.Recovery(handler)
	// TODO: add middleware.Recovery(handler) and middleware.RequestLogger(handler) if добавите реализации

	// --- Background job: обновление новостей по расписанию ---
	go func() {
		ticker := time.NewTicker(time.Duration(newsIntervalMin) * time.Minute)
		defer ticker.Stop()

		// Запуск сразу при старте
		if err := newsService.UpdateNews(); err != nil {
			log.Println("news update error:", err)
		}

		for range ticker.C {
			if err := newsService.UpdateNews(); err != nil {
				log.Println("news update error:", err)
			}
		}
	}()

	// --- HTTP Server с таймаутами и graceful shutdown ---
	srv := &http.Server{
		Addr:         addr,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Запускаем сервер в горутине
	go func() {
		log.Printf("Server listening on %s\n", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe error: %v", err)
		}
	}()

	// Graceful shutdown при SIGINT/SIGTERM
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server Shutdown Failed:%+v", err)
	}

	log.Println("Server exited properly")
}

// InitDB теперь принимает строку подключения
func InitDB(connStr string) *sql.DB {
	var db *sql.DB
	var err error

	for i := 0; i < 10; i++ {
		db, err = sql.Open("postgres", connStr)
		if err != nil {
			log.Println("DB open error:", err)
			time.Sleep(2 * time.Second)
			continue
		}

		err = db.Ping()
		if err == nil {
			log.Println("Connected to DB")
			return db
		}

		log.Println("Waiting for DB...", err)
		time.Sleep(2 * time.Second)
	}

	log.Fatal("Failed to connect to DB after retries")
	return nil
}

// Помощники
func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getenvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if t, err := strconv.Atoi(v); err == nil {
			return t
		}
	}
	return fallback
}

func ensureDir(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		if err := os.MkdirAll(path, 0755); err != nil {
			return err
		}
	}
	// защитим от относительных путей и вернём абсолютный путь (по желанию)
	_, err := filepath.Abs(path)
	return err
}

//forecast
func forecastProxyHandler(w http.ResponseWriter, r *http.Request) {
	body, _ := io.ReadAll(r.Body)

	req, _ := http.NewRequest("POST",
		"https://ecoalmaty-ml-production.up.railway.app/api/v1/forecast/",
		bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

func forecastBotProxyHandler(w http.ResponseWriter, r *http.Request) {
	body, _ := io.ReadAll(r.Body)
	req, _ := http.NewRequest("POST",
		"https://ecoalmaty-ml-production.up.railway.app/api/v1/bot/forecast",
		bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}
