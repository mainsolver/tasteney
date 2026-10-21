package biz.web4my.tasteney_be.encyclopedia

import java.time.Instant

data class ArticleTranslationDto(
    val title: String? = null,
    val summary: String? = null,
    val content: String,
    val wikipediaUrl: String? = null
)

data class LocationMetadataDto(
    val region: String,
    val country: String,
    val latitude: Double? = null,
    val longitude: Double? = null
)

data class IngredientMetadataDto(
    val kind: String,
    val alsoKnownAs: List<String> = emptyList()
)

data class ArticleDto(
    val id: String,
    val title: String,
    val category: String,
    val type: String,
    val summary: String,
    val content: String,
    val active: Boolean = true,
    val wikipediaUrl: String? = null,
    val translations: Map<String, ArticleTranslationDto> = emptyMap(),
    val tags: List<String> = emptyList(),
    val relatedArticleIds: List<String> = emptyList(),
    val location: LocationMetadataDto? = null,
    val ingredient: IngredientMetadataDto? = null,
    val createdAt: Instant,
    val updatedAt: Instant
)
