package biz.web4my.tasteney_be.encyclopedia.internal

import java.time.Instant

data class EncyclopediaCategory(
    val id: String,
    val name: String,
    val icon: String? = null,
    val archetype: String? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)
