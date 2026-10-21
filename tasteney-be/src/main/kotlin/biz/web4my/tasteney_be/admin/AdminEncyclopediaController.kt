package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.encyclopedia.ArticleTranslationDto
import biz.web4my.tasteney_be.encyclopedia.CreateArticleRequest
import biz.web4my.tasteney_be.encyclopedia.EncyclopediaService
import biz.web4my.tasteney_be.encyclopedia.IngredientMetadataDto
import biz.web4my.tasteney_be.encyclopedia.LocationMetadataDto
import biz.web4my.tasteney_be.encyclopedia.UpdateArticleRequest
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
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

data class ArticleFormData(
    val id: String? = null,
    @field:NotBlank(message = "Category is required")
    val category: String = "",
    val type: String = "general",
    @field:NotBlank(message = "Title is required")
    val title: String = "",
    @field:NotBlank(message = "Summary is required")
    val summary: String = "",
    @field:NotBlank(message = "Content is required")
    val content: String = "",
    val active: Boolean = true,
    val wikipediaUrl: String? = null,
    val tags: String? = null,
    val relatedArticleIds: String? = null,
    val locationRegion: String? = null,
    val locationCountry: String? = null,
    val locationLatitude: Double? = null,
    val locationLongitude: Double? = null,
    val ingredientKind: String? = null,
    val ingredientAliases: String? = null,
    val deTitle: String? = null,
    val deSummary: String? = null,
    val deContent: String? = null,
    val deWikipediaUrl: String? = null
)

@Controller
@RequestMapping("/admin/encyclopedia")
class AdminEncyclopediaController(
    private val encyclopediaService: EncyclopediaService
) {

    @GetMapping
    fun listArticles(
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
        val categories = encyclopediaService.findAllCategories()
        val totalArticles = encyclopediaService.countArticles()
        val totalCategories = encyclopediaService.countCategories()

        model.addAttribute("articles", articles)
        model.addAttribute("categories", categories)
        model.addAttribute("totalArticles", totalArticles)
        model.addAttribute("totalCategories", totalCategories)
        model.addAttribute("selectedCategory", category ?: "ALL")
        model.addAttribute("selectedStatus", status?.trim()?.uppercase() ?: "ALL")
        model.addAttribute("query", query ?: "")

        return "admin/encyclopedia/index"
    }

    @GetMapping("/new")
    fun newArticleForm(model: Model): String {
        model.addAttribute("articleForm", ArticleFormData())
        model.addAttribute("categories", encyclopediaService.findAllCategories())
        model.addAttribute("isEdit", false)
        return "admin/encyclopedia/edit"
    }

    @PostMapping("/new")
    fun createArticle(
        @ModelAttribute("articleForm") form: ArticleFormData,
        bindingResult: BindingResult,
        model: Model,
        redirectAttributes: RedirectAttributes
    ): String {
        if (form.title.isBlank() || form.summary.isBlank() || form.content.isBlank() || form.category.isBlank()) {
            model.addAttribute("articleError", "Please fill in all required fields (Title, Category, Summary, Content).")
            model.addAttribute("categories", encyclopediaService.findAllCategories())
            model.addAttribute("isEdit", false)
            return "admin/encyclopedia/edit"
        }

        try {
            val location = if (!form.locationRegion.isNullOrBlank() || !form.locationCountry.isNullOrBlank() || form.locationLatitude != null || form.locationLongitude != null) {
                LocationMetadataDto(
                    region = form.locationRegion ?: "",
                    country = form.locationCountry ?: "",
                    latitude = form.locationLatitude,
                    longitude = form.locationLongitude
                )
            } else null

            val ingredient = if (!form.ingredientKind.isNullOrBlank() || !form.ingredientAliases.isNullOrBlank()) {
                val aliases = form.ingredientAliases?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()
                IngredientMetadataDto(
                    kind = form.ingredientKind ?: "",
                    alsoKnownAs = aliases
                )
            } else null

            val translations = mutableMapOf<String, ArticleTranslationDto>()
            if (!form.deContent.isNullOrBlank()) {
                translations["de"] = ArticleTranslationDto(
                    title = form.deTitle?.ifBlank { null },
                    summary = form.deSummary?.ifBlank { null },
                    content = form.deContent,
                    wikipediaUrl = form.deWikipediaUrl?.ifBlank { null }
                )
            }

            val tagsList = form.tags?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()
            val relatedList = form.relatedArticleIds?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()

            val request = CreateArticleRequest(
                id = form.id?.trim()?.ifBlank { null },
                category = form.category.trim(),
                type = form.type.trim().ifBlank { "general" },
                title = form.title.trim(),
                summary = form.summary.trim(),
                content = form.content.trim(),
                active = form.active,
                wikipediaUrl = form.wikipediaUrl?.trim()?.ifBlank { null },
                translations = translations,
                tags = tagsList,
                relatedArticleIds = relatedList,
                location = location,
                ingredient = ingredient
            )

            val created = encyclopediaService.createArticle(request)
            redirectAttributes.addFlashAttribute("articleSuccess", "Article '${created.title}' created successfully.")
            return "redirect:/admin/encyclopedia"
        } catch (ex: Exception) {
            model.addAttribute("articleError", ex.message ?: "Failed to create article.")
            model.addAttribute("categories", encyclopediaService.findAllCategories())
            model.addAttribute("isEdit", false)
            return "admin/encyclopedia/edit"
        }
    }

    @GetMapping("/{id}/edit")
    fun editArticleForm(@PathVariable id: String, model: Model): String {
        val article = encyclopediaService.findArticleById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found: $id")

        val deTrans = article.translations["de"]
        val formData = ArticleFormData(
            id = article.id,
            category = article.category,
            type = article.type,
            title = article.title,
            summary = article.summary,
            content = article.content,
            active = article.active,
            wikipediaUrl = article.wikipediaUrl,
            tags = article.tags.joinToString(", "),
            relatedArticleIds = article.relatedArticleIds.joinToString(", "),
            locationRegion = article.location?.region,
            locationCountry = article.location?.country,
            locationLatitude = article.location?.latitude,
            locationLongitude = article.location?.longitude,
            ingredientKind = article.ingredient?.kind,
            ingredientAliases = article.ingredient?.alsoKnownAs?.joinToString(", "),
            deTitle = deTrans?.title,
            deSummary = deTrans?.summary,
            deContent = deTrans?.content,
            deWikipediaUrl = deTrans?.wikipediaUrl
        )

        model.addAttribute("articleForm", formData)
        model.addAttribute("categories", encyclopediaService.findAllCategories())
        model.addAttribute("isEdit", true)
        model.addAttribute("articleId", id)
        return "admin/encyclopedia/edit"
    }

    @PostMapping("/{id}/edit")
    fun updateArticle(
        @PathVariable id: String,
        @ModelAttribute("articleForm") form: ArticleFormData,
        model: Model,
        redirectAttributes: RedirectAttributes
    ): String {
        if (form.title.isBlank() || form.summary.isBlank() || form.content.isBlank() || form.category.isBlank()) {
            model.addAttribute("articleError", "Please fill in all required fields (Title, Category, Summary, Content).")
            model.addAttribute("categories", encyclopediaService.findAllCategories())
            model.addAttribute("isEdit", true)
            model.addAttribute("articleId", id)
            return "admin/encyclopedia/edit"
        }

        try {
            val location = if (!form.locationRegion.isNullOrBlank() || !form.locationCountry.isNullOrBlank() || form.locationLatitude != null || form.locationLongitude != null) {
                LocationMetadataDto(
                    region = form.locationRegion ?: "",
                    country = form.locationCountry ?: "",
                    latitude = form.locationLatitude,
                    longitude = form.locationLongitude
                )
            } else null

            val ingredient = if (!form.ingredientKind.isNullOrBlank() || !form.ingredientAliases.isNullOrBlank()) {
                val aliases = form.ingredientAliases?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()
                IngredientMetadataDto(
                    kind = form.ingredientKind ?: "",
                    alsoKnownAs = aliases
                )
            } else null

            val translations = mutableMapOf<String, ArticleTranslationDto>()
            if (!form.deContent.isNullOrBlank()) {
                translations["de"] = ArticleTranslationDto(
                    title = form.deTitle?.trim()?.ifBlank { null },
                    summary = form.deSummary?.trim()?.ifBlank { null },
                    content = form.deContent,
                    wikipediaUrl = form.deWikipediaUrl?.trim()?.ifBlank { null }
                )
            }

            val tagsList = form.tags?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()
            val relatedList = form.relatedArticleIds?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()

            val request = UpdateArticleRequest(
                category = form.category.trim(),
                type = form.type.trim().ifBlank { "general" },
                title = form.title.trim(),
                summary = form.summary.trim(),
                content = form.content.trim(),
                active = form.active,
                wikipediaUrl = form.wikipediaUrl?.trim()?.ifBlank { null },
                translations = translations,
                tags = tagsList,
                relatedArticleIds = relatedList,
                location = location,
                ingredient = ingredient
            )

            val updated = encyclopediaService.updateArticle(id, request)
            redirectAttributes.addFlashAttribute("articleSuccess", "Article '${updated.title}' updated successfully.")
            return "redirect:/admin/encyclopedia"
        } catch (ex: Exception) {
            model.addAttribute("articleError", ex.message ?: "Failed to update article.")
            model.addAttribute("categories", encyclopediaService.findAllCategories())
            model.addAttribute("isEdit", true)
            model.addAttribute("articleId", id)
            return "admin/encyclopedia/edit"
        }
    }
}
