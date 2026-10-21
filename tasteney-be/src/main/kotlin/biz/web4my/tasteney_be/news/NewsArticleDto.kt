package biz.web4my.tasteney_be.news

import java.time.Instant
import java.util.UUID

data class NewsArticleDto(
    val id: UUID,
    val headline: String,
    val text: String,
    val imagePath: String? = null,
    val link: String? = null,
    val active: Boolean = true,
    val createdAt: Instant,
    val updatedAt: Instant
)
