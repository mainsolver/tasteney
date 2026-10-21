package biz.web4my.tasteney_be.news.internal

import java.time.Instant
import java.util.UUID

data class NewsArticle(
    val id: UUID,
    val headline: String,
    val text: String,
    val imagePath: String? = null,
    val link: String? = null,
    val isActive: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
