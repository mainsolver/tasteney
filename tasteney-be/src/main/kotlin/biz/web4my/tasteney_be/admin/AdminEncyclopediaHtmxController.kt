package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.encyclopedia.EncyclopediaService
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam

@Controller
@RequestMapping("/admin/htmx/encyclopedia")
class AdminEncyclopediaHtmxController(
    private val encyclopediaService: EncyclopediaService
) {

    @GetMapping("/articles")
    fun articlesTable(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) status: String?,
        model: Model
    ): String {
        val selectedCategory = if (!category.isNullOrBlank() && category != "ALL") category else null
        val activeFilter = when (status?.trim()?.uppercase()) {
            "ACTIVE" -> true
            "INACTIVE" -> false
            else -> null
        }
        val articles = encyclopediaService.findArticles(
            search = query,
            category = selectedCategory,
            active = activeFilter
        )
        model.addAttribute("articles", articles)
        return "admin/fragments/article-table"
    }

    @PostMapping("/articles/{id}/toggle-active")
    fun toggleArticleActive(
        @PathVariable id: String,
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) status: String?,
        model: Model
    ): String {
        val article = encyclopediaService.findArticleById(id)
        if (article != null) {
            if (article.active) {
                encyclopediaService.deactivateArticle(id)
            } else {
                encyclopediaService.activateArticle(id)
            }
        }
        val selectedCategory = if (!category.isNullOrBlank() && category != "ALL") category else null
        val activeFilter = when (status?.trim()?.uppercase()) {
            "ACTIVE" -> true
            "INACTIVE" -> false
            else -> null
        }
        val articles = encyclopediaService.findArticles(
            search = query,
            category = selectedCategory,
            active = activeFilter
        )
        model.addAttribute("articles", articles)
        return "admin/fragments/article-table"
    }
}
