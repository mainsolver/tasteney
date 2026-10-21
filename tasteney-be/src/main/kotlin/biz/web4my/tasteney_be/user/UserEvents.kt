package biz.web4my.tasteney_be.user

import java.util.UUID

data class EmailVerificationRequestedEvent(
    val userId: UUID,
    val email: String,
    val token: String,
    val verificationUrl: String
)

data class PasswordResetRequestedEvent(
    val userId: UUID,
    val email: String,
    val token: String,
    val resetUrl: String
)
