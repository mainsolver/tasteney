package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.news.CreateNewsRequest
import biz.web4my.tasteney_be.news.NewsService
import biz.web4my.tasteney_be.news.UpdateNewsRequest
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.validation.BindingResult
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.util.UUID

data class NewsFormData(
    val id: UUID? = null,
    @field:NotBlank(message = "Headline is required")
    @field:Size(max = 255, message = "Headline cannot exceed 255 characters")
    val headline: String = "",
    @field:NotBlank(message = "Text is required")
    @field:Size(max = 1000, message = "Text cannot exceed 1000 characters")
    val text: String = "",
    val imagePath: String? = null,
    val link: String? = null,
    val active: Boolean = true
)

@Controller
@RequestMapping("/admin/news")
class AdminNewsController(
    private val newsService: NewsService
) {

    @GetMapping
    fun listNews(
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
        val totalNews = newsService.countNews()
        val activeNews = newsService.countNews(active = true)

        model.addAttribute("newsArticles", newsArticles)
        model.addAttribute("totalNews", totalNews)
        model.addAttribute("activeNews", activeNews)
        model.addAttribute("selectedStatus", status?.trim()?.uppercase() ?: "ALL")
        model.addAttribute("query", query ?: "")

        return "admin/news/index"
    }

    @GetMapping("/new")
    fun newNewsForm(model: Model): String {
        model.addAttribute("newsForm", NewsFormData())
        model.addAttribute("isEdit", false)
        return "admin/news/edit"
    }

    @PostMapping("/new")
    fun createNews(
        @ModelAttribute("newsForm") form: NewsFormData,
        bindingResult: BindingResult,
        model: Model,
        redirectAttributes: RedirectAttributes
    ): String {
        if (form.headline.isBlank() || form.text.isBlank()) {
            model.addAttribute("newsError", "Please fill in all required fields (Headline, Text).")
            model.addAttribute("isEdit", false)
            return "admin/news/edit"
        }
        if (form.headline.length > 255) {
            model.addAttribute("newsError", "Headline cannot exceed 255 characters.")
            model.addAttribute("isEdit", false)
            return "admin/news/edit"
        }
        if (form.text.length > 1000) {
            model.addAttribute("newsError", "Text cannot exceed 1000 characters.")
            model.addAttribute("isEdit", false)
            return "admin/news/edit"
        }

        try {
            val request = CreateNewsRequest(
                headline = form.headline,
                text = form.text,
                imagePath = form.imagePath,
                link = form.link,
                active = form.active
            )
            val created = newsService.createNews(request)
            redirectAttributes.addFlashAttribute("newsSuccess", "News article '${created.headline}' created successfully.")
            return "redirect:/admin/news"
        } catch (ex: ResponseStatusException) {
            model.addAttribute("newsError", ex.reason ?: "Failed to create news article.")
            model.addAttribute("isEdit", false)
            return "admin/news/edit"
        } catch (ex: Exception) {
            model.addAttribute("newsError", ex.message ?: "Failed to create news article.")
            model.addAttribute("isEdit", false)
            return "admin/news/edit"
        }
    }

    @GetMapping("/{id}/edit")
    fun editNewsForm(@PathVariable id: UUID, model: Model, redirectAttributes: RedirectAttributes): String {
        val news = newsService.findNewsById(id)
        if (news == null) {
            redirectAttributes.addFlashAttribute("newsError", "News article not found.")
            return "redirect:/admin/news"
        }

        val formData = NewsFormData(
            id = news.id,
            headline = news.headline,
            text = news.text,
            imagePath = news.imagePath,
            link = news.link,
            active = news.active
        )

        model.addAttribute("newsForm", formData)
        model.addAttribute("isEdit", true)
        return "admin/news/edit"
    }

    @PostMapping("/{id}/edit")
    fun updateNews(
        @PathVariable id: UUID,
        @ModelAttribute("newsForm") form: NewsFormData,
        bindingResult: BindingResult,
        model: Model,
        redirectAttributes: RedirectAttributes
    ): String {
        if (form.headline.isBlank() || form.text.isBlank()) {
            model.addAttribute("newsError", "Please fill in all required fields (Headline, Text).")
            model.addAttribute("isEdit", true)
            return "admin/news/edit"
        }
        if (form.headline.length > 255) {
            model.addAttribute("newsError", "Headline cannot exceed 255 characters.")
            model.addAttribute("isEdit", true)
            return "admin/news/edit"
        }
        if (form.text.length > 1000) {
            model.addAttribute("newsError", "Text cannot exceed 1000 characters.")
            model.addAttribute("isEdit", true)
            return "admin/news/edit"
        }

        try {
            val request = UpdateNewsRequest(
                headline = form.headline,
                text = form.text,
                imagePath = form.imagePath,
                link = form.link,
                active = form.active
            )
            val updated = newsService.updateNews(id, request)
            redirectAttributes.addFlashAttribute("newsSuccess", "News article '${updated.headline}' updated successfully.")
            return "redirect:/admin/news"
        } catch (ex: ResponseStatusException) {
            model.addAttribute("newsError", ex.reason ?: "Failed to update news article.")
            model.addAttribute("isEdit", true)
            return "admin/news/edit"
        } catch (ex: Exception) {
            model.addAttribute("newsError", ex.message ?: "Failed to update news article.")
            model.addAttribute("isEdit", true)
            return "admin/news/edit"
        }
    }

    @PostMapping("/{id}/deactivate")
    fun deactivateNews(@PathVariable id: UUID, redirectAttributes: RedirectAttributes): String {
        try {
            val deactivated = newsService.deactivateNews(id)
            redirectAttributes.addFlashAttribute("newsSuccess", "News article '${deactivated.headline}' deactivated.")
        } catch (ex: Exception) {
            redirectAttributes.addFlashAttribute("newsError", ex.message ?: "Failed to deactivate news article.")
        }
        return "redirect:/admin/news"
    }

    @PostMapping("/{id}/activate")
    fun activateNews(@PathVariable id: UUID, redirectAttributes: RedirectAttributes): String {
        try {
            val activated = newsService.activateNews(id)
            redirectAttributes.addFlashAttribute("newsSuccess", "News article '${activated.headline}' activated.")
        } catch (ex: Exception) {
            redirectAttributes.addFlashAttribute("newsError", ex.message ?: "Failed to activate news article.")
        }
        return "redirect:/admin/news"
    }
}
