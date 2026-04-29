package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"
)

type clientInfo struct {
	Count     int
	ExpiresAt time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	clients map[string]*clientInfo
	limit   int
	window  time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*clientInfo),
		limit:   limit,
		window:  window,
	}

	go rl.cleanupLoop()
	return rl
}

func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()

		rl.mu.Lock()
		for ip, info := range rl.clients {
			if now.After(info.ExpiresAt) {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func getIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getIP(r)
		now := time.Now()

		rl.mu.Lock()
		info, exists := rl.clients[ip]

		if !exists || now.After(info.ExpiresAt) {
			rl.clients[ip] = &clientInfo{
				Count:     1,
				ExpiresAt: now.Add(rl.window),
			}
			rl.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		if info.Count >= rl.limit {
			rl.mu.Unlock()
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}

		info.Count++
		rl.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}