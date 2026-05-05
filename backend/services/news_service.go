// package services

// import (
// 	"log"
// 	"time"

// 	"dl/models"
// 	"dl/repositories"

// 	"github.com/mmcdole/gofeed"
// )

// type NewsService struct {
// 	Repo *repositories.NewsRepository
// }

// func NewNewsService(repo *repositories.NewsRepository) *NewsService {
// 	return &NewsService{Repo: repo}
// }

// func (s *NewsService) UpdateNews() error {
// 	parser := gofeed.NewParser()

// 	feeds := []string{
// 		"https://news.google.com/rss/search?q=%D1%8D%D0%BA%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%8F+%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B&hl=ru&gl=KZ&ceid=KZ:ru",
// 	}
// 	var allNews []models.NewsItem

// 	for _, url := range feeds {
// 		feed, err := parser.ParseURL(url)
// 		if err != nil {
// 			log.Println("⚠️ RSS parse error:", err)
// 			continue
// 		}

// 		for _, item := range feed.Items {
// 			published := time.Now()
// 			if item.PublishedParsed != nil {
// 				published = *item.PublishedParsed
// 			}

// 			allNews = append(allNews, models.NewsItem{
// 				Title:       item.Title,
// 				Link:        item.Link,
// 				PublishedAt: published,
// 				Source:      feed.Title,
// 				Description: item.Description,
// 			})
// 		}
// 	}

// 	return s.Repo.SaveNews(allNews)
// }

// func (s *NewsService) GetAllNews() ([]models.NewsItem, error) {
// 	return s.Repo.GetAllNews()
// }

// func (s *NewsService) GetNews(limit, offset int) ([]models.NewsItem, error) {
// 	return s.Repo.GetNews(limit, offset)
// }

//	func (s *NewsService) CountNews() (int, error) {
//		return s.Repo.CountNews()
//	}
package services

import (
	"log"
	"regexp"
	"strings"
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

// Вспомогательная функция для поиска картинки в RSS-item
func extractImageURL(item *gofeed.Item) string {
	// 1. Ищем в Enclosures (часто используется новостными сайтами)
	for _, enclosure := range item.Enclosures {
		if strings.HasPrefix(enclosure.Type, "image/") || strings.HasSuffix(enclosure.URL, ".jpg") || strings.HasSuffix(enclosure.URL, ".png") {
			return enclosure.URL
		}
	}

	// 2. Ищем в Media Extensions (media:content или media:thumbnail)
	if media, ok := item.Extensions["media"]; ok {
		if content, ok := media["content"]; ok && len(content) > 0 {
			return content[0].Attrs["url"]
		}
		if thumbnail, ok := media["thumbnail"]; ok && len(thumbnail) > 0 {
			return thumbnail[0].Attrs["url"]
		}
	}

	// 3. Стандартный тег Image в RSS
	if item.Image != nil {
		return item.Image.URL
	}

	// 4. Пытаемся вытащить <img> тег прямо из текста описания (Google News часто делает так)
	imgRegex := regexp.MustCompile(`<img[^>]+src=["']([^"']+)["']`)
	matches := imgRegex.FindStringSubmatch(item.Description)
	if len(matches) > 1 {
		return matches[1]
	}

	if item.Content != "" {
		matches = imgRegex.FindStringSubmatch(item.Content)
		if len(matches) > 1 {
			return matches[1]
		}
	}

	return ""
}

func (s *NewsService) UpdateNews() error {
	parser := gofeed.NewParser()

	// Добавили больше источников (Казахстан и Алматы)
	feeds := []string{
		// Поиск в Google News по ключевым фразам (самый точный способ фильтрации)
		"https://news.google.com/rss/search?q=%D1%8D%D0%BA%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%8F+%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B&hl=ru&gl=KZ&ceid=KZ:ru",                                                              // "экология Алматы"
		"https://news.google.com/rss/search?q=%D0%B7%D0%B0%D0%B3%D1%80%D1%8F%D0%B7%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5+%D0%B2%D0%BE%D0%B7%D0%B4%D1%83%D1%85%D0%B0+%D0%B0%D0%BB%D0%BC%D0%B0%D1%82%D1%8B&hl=ru&gl=KZ&ceid=KZ:ru", // "загрязнение воздуха алматы"
		"https://news.google.com/rss/search?q=%D1%81%D0%BC%D0%BE%D0%B3+%D0%B0%D0%BB%D0%BC%D0%B0%D1%82%D1%8B&hl=ru&gl=KZ&ceid=KZ:ru",                                                                                      // "смог алматы"
		"https://news.google.com/rss/search?q=%D0%B2%D1%8B%D1%80%D1%83%D0%B1%D0%BA%D0%B0+%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D1%8C%D0%B5%D0%B2+%D0%B0%D0%BB%D0%BC%D0%B0%D1%82%D1%8B&hl=ru&gl=KZ&ceid=KZ:ru",                   // "вырубка деревьев алматы"
		"https://news.google.com/rss/search?q=%D0%A2%D0%AD%D0%A6-2+%D0%B0%D0%BB%D0%BC%D0%B0%D1%82%D1%8B+%D0%B3%D0%B0%D0%B7&hl=ru&gl=KZ&ceid=KZ:ru",                                                                       // "ТЭЦ-2 алматы газ" (важнейшая эко-тема)

		// Фильтрованный поиск по конкретным порталам (чтобы не брать весь мусор с Zakon/Tengri)
		"https://news.google.com/rss/search?q=site:vlast.kz+%D1%8D%D0%BA%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%8F&hl=ru&gl=KZ&ceid=KZ:ru",      // Экология на Vlast.kz
		"https://news.google.com/rss/search?q=site:informburo.kz+%D1%8D%D0%BA%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%8F&hl=ru&gl=KZ&ceid=KZ:ru", // Экология на Informburo
	}

	var allNews []models.NewsItem

	for _, url := range feeds {
		feed, err := parser.ParseURL(url)
		if err != nil {
			log.Printf("⚠️ Ошибка парсинга RSS (%s): %v\n", url, err)
			continue
		}

		for _, item := range feed.Items {
			published := time.Now()
			if item.PublishedParsed != nil {
				published = *item.PublishedParsed
			}

			// Вытаскиваем URL картинки
			imgURL := extractImageURL(item)

			allNews = append(allNews, models.NewsItem{
				Title:       item.Title,
				Link:        item.Link,
				PublishedAt: published,
				Source:      feed.Title,
				Description: item.Description,
				ImageURL:    imgURL, // Сохраняем картинку
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
