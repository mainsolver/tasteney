package biz.web4my.tasteney_be.news.internal

import biz.web4my.tasteney_be.news.NewsArticleDto
import biz.web4my.tasteney_be.news.NewsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/news")
class NewsRestController(
    private val newsService: NewsService
) {

    @GetMapping("/latest")
    fun getLatestNews(
        @RequestParam(required = false, defaultValue = "5") limit: Int
    ): ResponseEntity<List<NewsArticleDto>> {
        return ResponseEntity.ok(newsService.getLatestNews(limit))
    }

    @GetMapping
    fun getNews(
        @RequestParam(required = false, defaultValue = "5") limit: Int
    ): ResponseEntity<List<NewsArticleDto>> {
        return ResponseEntity.ok(newsService.getLatestNews(limit))
    }

    @GetMapping("/{id}")
    fun getNewsById(@PathVariable id: UUID): ResponseEntity<NewsArticleDto> {
        val news = newsService.findNewsById(id)
        if (news == null || !news.active) {
            return ResponseEntity.notFound().build()
        }
        return ResponseEntity.ok(news)
    }
}
