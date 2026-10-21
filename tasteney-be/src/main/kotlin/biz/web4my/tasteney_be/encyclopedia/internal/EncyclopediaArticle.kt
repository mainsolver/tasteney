package biz.web4my.tasteney_be.encyclopedia.internal

import java.time.Instant

data class EncyclopediaArticle(
    val id: String,
    val categoryId: String,
    val articleType: String,
    val title: String,
    val summary: String,
    val content: String,
    val isActive: Boolean = true,
    val wikipediaUrl: String? = null,
    val locationRegion: String? = null,
    val locationCountry: String? = null,
    val locationLatitude: Double? = null,
    val locationLongitude: Double? = null,
    val ingredientKind: String? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
