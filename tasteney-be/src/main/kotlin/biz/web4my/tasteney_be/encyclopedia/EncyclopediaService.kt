package biz.web4my.tasteney_be.encyclopedia

import java.time.Instant

interface EncyclopediaService {
    fun findAllCategories(): List<CategoryDto>
    fun findCategoryById(id: String): CategoryDto?
    fun findArticles(
        search: String? = null,
        category: String? = null,
        updatedSince: Instant? = null,
        active: Boolean? = null
    ): List<ArticleDto>
    fun findArticleById(id: String): ArticleDto?
    fun createArticle(request: CreateArticleRequest): ArticleDto
    fun updateArticle(id: String, request: UpdateArticleRequest): ArticleDto
    fun deactivateArticle(id: String): ArticleDto
    fun activateArticle(id: String): ArticleDto
    fun countArticles(active: Boolean? = null): Long
    fun countCategories(): Long
}
