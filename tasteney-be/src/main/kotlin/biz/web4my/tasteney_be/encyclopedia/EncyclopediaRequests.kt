package biz.web4my.tasteney_be.encyclopedia

data class CreateArticleRequest(
    val id: String? = null,
    val category: String,
    val type: String = "general",
    val title: String,
    val summary: String,
    val content: String,
    val active: Boolean = true,
    val wikipediaUrl: String? = null,
    val translations: Map<String, ArticleTranslationDto> = emptyMap(),
    val tags: List<String> = emptyList(),
    val relatedArticleIds: List<String> = emptyList(),
    val location: LocationMetadataDto? = null,
    val ingredient: IngredientMetadataDto? = null
)

data class UpdateArticleRequest(
    val category: String,
    val type: String = "general",
    val title: String,
    val summary: String,
    val content: String,
    val active: Boolean = true,
    val wikipediaUrl: String? = null,
    val translations: Map<String, ArticleTranslationDto> = emptyMap(),
    val tags: List<String> = emptyList(),
    val relatedArticleIds: List<String> = emptyList(),
    val location: LocationMetadataDto? = null,
    val ingredient: IngredientMetadataDto? = null
)
