package biz.web4my.tasteney_be.user.internal

import biz.web4my.tasteney_be.user.ChangePasswordRequest
import biz.web4my.tasteney_be.user.CreateAdminRequest
import biz.web4my.tasteney_be.user.EmailVerificationRequestedEvent
import biz.web4my.tasteney_be.user.PasswordResetRequestedEvent
import biz.web4my.tasteney_be.user.RegisterRequest
import biz.web4my.tasteney_be.user.ResetPasswordRequest
import biz.web4my.tasteney_be.user.UserDto
import biz.web4my.tasteney_be.user.UserRole
import biz.web4my.tasteney_be.user.UserService
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Duration
import java.time.Instant
import java.util.UUID

@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val eventPublisher: ApplicationEventPublisher,
    @Value("\${tasteney.app.base-url:http://localhost:8080}") private val baseUrl: String
) : UserService {

    @Transactional
    override fun register(request: RegisterRequest): UserDto {
        val normalizedEmail = request.email.trim().lowercase()
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User with email already exists")
        }

        val user = User(
            email = normalizedEmail,
            passwordHash = passwordEncoder.encode(request.password) ?: "",
            role = UserRole.USER,
            emailVerified = false,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        val saved = userRepository.save(user)
        val savedId = saved.id ?: UUID.randomUUID()

        val token = UUID.randomUUID().toString().replace("-", "")
        emailVerificationTokenRepository.deleteByUserId(savedId)
        val verificationToken = EmailVerificationToken(
            userId = savedId,
            token = token,
            expiresAt = Instant.now().plus(Duration.ofHours(24))
        )
        emailVerificationTokenRepository.save(verificationToken)

        val verificationUrl = "$baseUrl/api/v1/auth/verify-email?token=$token"
        eventPublisher.publishEvent(
            EmailVerificationRequestedEvent(
                userId = savedId,
                email = saved.email,
                token = token,
                verificationUrl = verificationUrl
            )
        )

        return saved.toDto()
    }

    @Transactional
    override fun verifyEmail(token: String): UserDto {
        val cleanToken = token.trim()
        val verificationToken = emailVerificationTokenRepository.findByToken(cleanToken)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired verification token")

        if (verificationToken.expiresAt.isBefore(Instant.now())) {
            emailVerificationTokenRepository.deleteByToken(cleanToken)
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired verification token")
        }

        val user = userRepository.findById(verificationToken.userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        }

        val updatedUser = user.copy(
            emailVerified = true,
            updatedAt = Instant.now()
        )
        val saved = userRepository.save(updatedUser)
        emailVerificationTokenRepository.deleteByUserId(user.id!!)

        return saved.toDto()
    }

    @Transactional
    override fun resendVerificationEmail(email: String) {
        val normalizedEmail = email.trim().lowercase()
        val user = userRepository.findByEmail(normalizedEmail) ?: return

        if (user.emailVerified) {
            return
        }

        val userId = user.id ?: return
        emailVerificationTokenRepository.deleteByUserId(userId)
        val token = UUID.randomUUID().toString().replace("-", "")
        val verificationToken = EmailVerificationToken(
            userId = userId,
            token = token,
            expiresAt = Instant.now().plus(Duration.ofHours(24))
        )
        emailVerificationTokenRepository.save(verificationToken)

        val verificationUrl = "$baseUrl/api/v1/auth/verify-email?token=$token"
        eventPublisher.publishEvent(
            EmailVerificationRequestedEvent(
                userId = userId,
                email = user.email,
                token = token,
                verificationUrl = verificationUrl
            )
        )
    }

    @Transactional
    override fun requestPasswordReset(email: String) {
        val normalizedEmail = email.trim().lowercase()
        val user = userRepository.findByEmail(normalizedEmail) ?: return
        val userId = user.id ?: return

        passwordResetTokenRepository.deleteByUserId(userId)
        val token = UUID.randomUUID().toString().replace("-", "")
        val resetToken = PasswordResetToken(
            userId = userId,
            token = token,
            expiresAt = Instant.now().plus(Duration.ofHours(1))
        )
        passwordResetTokenRepository.save(resetToken)

        val resetUrl = "$baseUrl/api/v1/auth/reset-password?token=$token"
        eventPublisher.publishEvent(
            PasswordResetRequestedEvent(
                userId = userId,
                email = user.email,
                token = token,
                resetUrl = resetUrl
            )
        )
    }

    @Transactional
    override fun resetPassword(request: ResetPasswordRequest) {
        if (request.confirmPassword != null && request.newPassword != request.confirmPassword) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirmation do not match")
        }

        if (request.newPassword.length < 6) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters")
        }

        val cleanToken = request.token.trim()
        val resetToken = passwordResetTokenRepository.findByToken(cleanToken)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token")

        if (resetToken.expiresAt.isBefore(Instant.now())) {
            passwordResetTokenRepository.deleteByToken(cleanToken)
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token")
        }

        val user = userRepository.findById(resetToken.userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        }

        val updatedUser = user.copy(
            passwordHash = passwordEncoder.encode(request.newPassword) ?: "",
            updatedAt = Instant.now()
        )
        userRepository.save(updatedUser)
        passwordResetTokenRepository.deleteByUserId(user.id!!)
    }

    override fun validatePasswordResetToken(token: String): Boolean {
        val resetToken = passwordResetTokenRepository.findByToken(token.trim()) ?: return false
        return !resetToken.expiresAt.isBefore(Instant.now())
    }

    @Transactional
    override fun changePassword(userId: UUID, request: ChangePasswordRequest) {
        val user = userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        }

        if (request.newPassword != request.confirmPassword) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirmation do not match")
        }

        if (!passwordEncoder.matches(request.currentPassword, user.passwordHash)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect")
        }

        if (request.newPassword.length < 6) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters")
        }

        val updatedUser = user.copy(
            passwordHash = passwordEncoder.encode(request.newPassword) ?: "",
            updatedAt = Instant.now()
        )
        userRepository.save(updatedUser)
    }

    @Transactional
    override fun createAdmin(request: CreateAdminRequest): UserDto {
        val normalizedEmail = request.email.trim().lowercase()
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User with email already exists")
        }

        val user = User(
            email = normalizedEmail,
            passwordHash = passwordEncoder.encode(request.password) ?: "",
            role = UserRole.ADMIN,
            emailVerified = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        val saved = userRepository.save(user)
        return saved.toDto()
    }

    override fun findByEmail(email: String): UserDto? {
        return userRepository.findByEmail(email.trim().lowercase())?.toDto()
    }

    override fun findById(id: UUID): UserDto? {
        return userRepository.findById(id).orElse(null)?.toDto()
    }

    override fun findAll(search: String?, role: UserRole?): List<UserDto> {
        val allUsers = userRepository.findAll().map { it.toDto() }
        return allUsers
            .filter { user ->
                val matchesSearch = search.isNullOrBlank() || user.email.contains(search.trim(), ignoreCase = true)
                val matchesRole = role == null || user.role == role
                matchesSearch && matchesRole
            }
            .sortedByDescending { it.createdAt }
    }

    override fun countUsers(): Long = userRepository.count()

    override fun countAdmins(): Long = userRepository.countByRole(UserRole.ADMIN)

    private fun User.toDto(): UserDto = UserDto(
        id = id ?: UUID.randomUUID(),
        email = email,
        role = role,
        emailVerified = emailVerified,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
