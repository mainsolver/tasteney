package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.news.NewsService
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import java.util.UUID

@Controller
@RequestMapping("/admin/htmx/news")
class AdminNewsHtmxController(
    private val newsService: NewsService
) {

    @GetMapping
    fun newsTable(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) status: String?,
        model: Model
    ): String {
        val activeFilter = when (status?.trim()?.uppercase()) {
            "ACTIVE" -> true
            "INACTIVE" -> false
            else -> null
        }
        val newsArticles = newsService.findAllNews(
            search = query,
            active = activeFilter
        )
        model.addAttribute("newsArticles", newsArticles)
        return "admin/fragments/news-table"
    }

    @PostMapping("/{id}/toggle-active")
    fun toggleNewsActive(
        @PathVariable id: UUID,
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) status: String?,
        model: Model
    ): String {
        val news = newsService.findNewsById(id)
        if (news != null) {
            if (news.active) {
                newsService.deactivateNews(id)
            } else {
                newsService.activateNews(id)
            }
        }
        val activeFilter = when (status?.trim()?.uppercase()) {
            "ACTIVE" -> true
            "INACTIVE" -> false
            else -> null
        }
        val newsArticles = newsService.findAllNews(
            search = query,
            active = activeFilter
        )
        model.addAttribute("newsArticles", newsArticles)
        return "admin/fragments/news-table"
    }
}
