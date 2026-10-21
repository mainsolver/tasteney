package biz.web4my.tasteney_be.user

import java.time.Instant
import java.util.UUID

data class UserDto(
    val id: UUID,
    val email: String,
    val role: UserRole,
    val emailVerified: Boolean = false,
    val createdAt: Instant,
    val updatedAt: Instant
)
