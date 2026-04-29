package services

import (
	"log"
	"time"

	"dl/models"
	"dl/repositories"

	"github.com/mmcdole/gofeed"
)

type NewsService struct {
	Repo *repositories.NewsRepository
}

func NewNewsService(repo *repositories.NewsRepository) *NewsService {
	return &NewsService{Repo: repo}
}

func (s *NewsService) UpdateNews() error {
	parser := gofeed.NewParser()

	feeds := []string{
		"https://news.google.com/rss/search?q=%D1%8D%D0%BA%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%8F+%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B&hl=ru&gl=KZ&ceid=KZ:ru",
	}
	var allNews []models.NewsItem

	for _, url := range feeds {
		feed, err := parser.ParseURL(url)
		if err != nil {
			log.Println("⚠️ RSS parse error:", err)
			continue
		}

		for _, item := range feed.Items {
			published := time.Now()
			if item.PublishedParsed != nil {
				published = *item.PublishedParsed
			}

			allNews = append(allNews, models.NewsItem{
				Title:       item.Title,
				Link:        item.Link,
				PublishedAt: published,
				Source:      feed.Title,
				Description: item.Description,
			})
		}
	}

	return s.Repo.SaveNews(allNews)
}

func (s *NewsService) GetAllNews() ([]models.NewsItem, error) {
	return s.Repo.GetAllNews()
}

func (s *NewsService) GetNews(limit, offset int) ([]models.NewsItem, error) {
	return s.Repo.GetNews(limit, offset)
}

func (s *NewsService) CountNews() (int, error) {
	return s.Repo.CountNews()
}
