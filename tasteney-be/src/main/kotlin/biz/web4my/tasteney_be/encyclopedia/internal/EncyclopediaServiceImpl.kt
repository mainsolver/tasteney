package biz.web4my.tasteney_be.encyclopedia.internal

import biz.web4my.tasteney_be.encyclopedia.ArticleDto
import biz.web4my.tasteney_be.encyclopedia.CategoryDto
import biz.web4my.tasteney_be.encyclopedia.CreateArticleRequest
import biz.web4my.tasteney_be.encyclopedia.EncyclopediaService
import biz.web4my.tasteney_be.encyclopedia.UpdateArticleRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class EncyclopediaServiceImpl(
    private val categoryRepository: EncyclopediaCategoryRepository,
    private val articleRepository: EncyclopediaArticleRepository
) : EncyclopediaService {

    @Transactional(readOnly = true)
    override fun findAllCategories(): List<CategoryDto> {
        return categoryRepository.findAll().map {
            CategoryDto(
                id = it.id,
                name = it.name,
                icon = it.icon,
                archetype = it.archetype
            )
        }
    }

    @Transactional(readOnly = true)
    override fun findCategoryById(id: String): CategoryDto? {
        return categoryRepository.findById(id)?.let {
            CategoryDto(
                id = it.id,
                name = it.name,
                icon = it.icon,
                archetype = it.archetype
            )
        }
    }

    @Transactional(readOnly = true)
    override fun findArticles(
        search: String?,
        category: String?,
        updatedSince: Instant?,
        active: Boolean?
    ): List<ArticleDto> {
        return articleRepository.findArticles(search, category, updatedSince, active)
    }

    @Transactional(readOnly = true)
    override fun findArticleById(id: String): ArticleDto? {
        return articleRepository.findById(id)
    }

    override fun createArticle(request: CreateArticleRequest): ArticleDto {
        require(request.title.isNotBlank()) { "Article title cannot be blank" }
        require(request.summary.isNotBlank()) { "Article summary cannot be blank" }
        require(request.content.isNotBlank()) { "Article content cannot be blank" }
        require(categoryRepository.existsById(request.category)) { "Category does not exist: ${request.category}" }

        val id = if (!request.id.isNullOrBlank()) {
            val trimmedId = request.id.trim()
            if (articleRepository.existsById(trimmedId)) {
                throw IllegalArgumentException("Article with id '$trimmedId' already exists")
            }
            trimmedId
        } else {
            generateUniqueId(request.category, request.title)
        }

        val now = Instant.now()
        val article = ArticleDto(
            id = id,
            title = request.title.trim(),
            category = request.category.trim(),
            type = request.type.trim(),
            summary = request.summary.trim(),
            content = request.content.trim(),
            active = request.active,
            wikipediaUrl = request.wikipediaUrl?.trim()?.ifBlank { null },
            translations = request.translations,
            tags = request.tags.map { it.trim() }.filter { it.isNotBlank() }.distinct(),
            relatedArticleIds = request.relatedArticleIds.map { it.trim() }.filter { it.isNotBlank() }.distinct(),
            location = request.location,
            ingredient = request.ingredient,
            createdAt = now,
            updatedAt = now
        )

        articleRepository.insert(article)
        return article
    }

    override fun updateArticle(id: String, request: UpdateArticleRequest): ArticleDto {
        val existing = articleRepository.findById(id)
            ?: throw IllegalArgumentException("Article not found with id: $id")

        require(request.title.isNotBlank()) { "Article title cannot be blank" }
        require(request.summary.isNotBlank()) { "Article summary cannot be blank" }
        require(request.content.isNotBlank()) { "Article content cannot be blank" }
        require(categoryRepository.existsById(request.category)) { "Category does not exist: ${request.category}" }

        val now = Instant.now()
        val updatedArticle = ArticleDto(
            id = existing.id,
            title = request.title.trim(),
            category = request.category.trim(),
            type = request.type.trim(),
            summary = request.summary.trim(),
            content = request.content.trim(),
            active = request.active,
            wikipediaUrl = request.wikipediaUrl?.trim()?.ifBlank { null },
            translations = request.translations,
            tags = request.tags.map { it.trim() }.filter { it.isNotBlank() }.distinct(),
            relatedArticleIds = request.relatedArticleIds.map { it.trim() }.filter { it.isNotBlank() }.distinct(),
            location = request.location,
            ingredient = request.ingredient,
            createdAt = existing.createdAt,
            updatedAt = now
        )

        articleRepository.update(updatedArticle)
        return updatedArticle
    }

    override fun deactivateArticle(id: String): ArticleDto {
        val existing = articleRepository.findById(id)
            ?: throw IllegalArgumentException("Article not found with id: $id")
        val now = Instant.now()
        articleRepository.setActive(id, false, now)
        return existing.copy(active = false, updatedAt = now)
    }

    override fun activateArticle(id: String): ArticleDto {
        val existing = articleRepository.findById(id)
            ?: throw IllegalArgumentException("Article not found with id: $id")
        val now = Instant.now()
        articleRepository.setActive(id, true, now)
        return existing.copy(active = true, updatedAt = now)
    }

    @Transactional(readOnly = true)
    override fun countArticles(active: Boolean?): Long {
        return articleRepository.count(active)
    }

    @Transactional(readOnly = true)
    override fun countCategories(): Long {
        return categoryRepository.count()
    }

    private fun generateUniqueId(category: String, title: String): String {
        val baseSlug = "${slugify(category)}-${slugify(title)}"
        if (!articleRepository.existsById(baseSlug)) {
            return baseSlug
        }
        var candidate = "$baseSlug-${UUID.randomUUID().toString().take(6)}"
        while (articleRepository.existsById(candidate)) {
            candidate = "$baseSlug-${UUID.randomUUID().toString().take(6)}"
        }
        return candidate
    }

    private fun slugify(input: String): String {
        val normalized = input.lowercase()
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
        return if (normalized.isBlank()) "item" else normalized
    }
}
