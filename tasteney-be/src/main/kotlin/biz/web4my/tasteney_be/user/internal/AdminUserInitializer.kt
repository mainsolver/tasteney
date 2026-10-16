package biz.web4my.tasteney_be.user.internal

import biz.web4my.tasteney_be.user.UserRole
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.security.SecureRandom
import java.time.Instant

@Component
class AdminUserInitializer(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    @Value("\${tasteney.admin.initial-email:admin-001@tasteney.com}")
    private val adminEmail: String,
    @Value("\${tasteney.admin.initial-password:}")
    private val configuredPassword: String
) : ApplicationRunner {

    private val logger = LoggerFactory.getLogger(AdminUserInitializer::class.java)

    override fun run(args: ApplicationArguments) {
        val email = adminEmail.trim().lowercase()
        if (userRepository.existsByEmail(email)) {
            logger.info("Admin account ($email) already exists. Skipping initialization.")
            return
        }

        val rawPassword = if (configuredPassword.isNotBlank()) {
            configuredPassword.trim()
        } else {
            generateSecureRandomPassword(20)
        }

        val adminUser = User(
            email = email,
            passwordHash = passwordEncoder.encode(rawPassword) ?: "",
            role = UserRole.ADMIN,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        userRepository.save(adminUser)

        val banner = """
        ========================================================================
        [TASTENEY INITIAL ADMIN BOOTSTRAP]
        An initial administrative account has been provisioned:
          Email:    $email
          Password: $rawPassword
          Role:     ADMIN
        Please store these credentials safely or change the password after login.
        ========================================================================
        """.trimIndent()

        logger.info("\n$banner")
    }

    private fun generateSecureRandomPassword(length: Int): String {
        val allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        val random = SecureRandom()
        return (1..length)
            .map { allowedChars[random.nextInt(allowedChars.length)] }
            .joinToString("")
    }
}
