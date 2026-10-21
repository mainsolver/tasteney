package biz.web4my.tasteney_be.user.internal

import biz.web4my.tasteney_be.user.UserRole
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("users")
data class User(
    @Id
    val id: UUID? = null,
    val email: String,
    @Column("password_hash")
    val passwordHash: String,
    val role: UserRole,
    @Column("email_verified")
    val emailVerified: Boolean = false,
    @Column("created_at")
    val createdAt: Instant = Instant.now(),
    @Column("updated_at")
    val updatedAt: Instant = Instant.now()
)
