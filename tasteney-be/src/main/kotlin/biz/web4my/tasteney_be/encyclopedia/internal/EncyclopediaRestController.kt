package biz.web4my.tasteney_be.encyclopedia.internal

import biz.web4my.tasteney_be.encyclopedia.ArticleDto
import biz.web4my.tasteney_be.encyclopedia.CategoryDto
import biz.web4my.tasteney_be.encyclopedia.EncyclopediaService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

@RestController
@RequestMapping("/api/v1/encyclopedia")
class EncyclopediaRestController(
    private val encyclopediaService: EncyclopediaService
) {

    @GetMapping("/categories")
    fun getCategories(): ResponseEntity<List<CategoryDto>> {
        return ResponseEntity.ok(encyclopediaService.findAllCategories())
    }

    @GetMapping("/articles")
    fun getArticles(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) since: Instant?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) updatedSince: Instant?,
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) category: String?
    ): ResponseEntity<List<ArticleDto>> {
        val effectiveSince = since ?: updatedSince
        val articles = encyclopediaService.findArticles(
            search = search,
            category = category,
            updatedSince = effectiveSince
        )
        return ResponseEntity.ok(articles)
    }

    @GetMapping("/articles/{id}")
    fun getArticleById(@PathVariable id: String): ResponseEntity<ArticleDto> {
        val article = encyclopediaService.findArticleById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(article)
    }
}
