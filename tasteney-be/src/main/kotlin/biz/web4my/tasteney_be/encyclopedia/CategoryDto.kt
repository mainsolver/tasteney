package biz.web4my.tasteney_be.encyclopedia

data class CategoryDto(
    val id: String,
    val name: String,
    val icon: String? = null,
    val archetype: String? = null
)
