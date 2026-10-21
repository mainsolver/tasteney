package biz.web4my.tasteney_be.user.internal

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("email_verification_tokens")
data class EmailVerificationToken(
    @Id
    val id: UUID? = null,
    @Column("user_id")
    val userId: UUID,
    val token: String,
    @Column("expires_at")
    val expiresAt: Instant,
    @Column("created_at")
    val createdAt: Instant = Instant.now()
)
