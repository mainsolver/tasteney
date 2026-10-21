package biz.web4my.tasteney_be.news

import java.util.UUID

interface NewsService {
    fun getLatestNews(limit: Int = 5): List<NewsArticleDto>
    fun findAllNews(search: String? = null, active: Boolean? = null): List<NewsArticleDto>
    fun findNewsById(id: UUID): NewsArticleDto?
    fun createNews(request: CreateNewsRequest): NewsArticleDto
    fun updateNews(id: UUID, request: UpdateNewsRequest): NewsArticleDto
    fun deactivateNews(id: UUID): NewsArticleDto
    fun activateNews(id: UUID): NewsArticleDto
    fun countNews(active: Boolean? = null): Long
}
