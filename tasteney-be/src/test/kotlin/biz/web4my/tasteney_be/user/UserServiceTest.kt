package biz.web4my.tasteney_be.user

import biz.web4my.tasteney_be.user.internal.EmailVerificationToken
import biz.web4my.tasteney_be.user.internal.EmailVerificationTokenRepository
import biz.web4my.tasteney_be.user.internal.PasswordResetToken
import biz.web4my.tasteney_be.user.internal.PasswordResetTokenRepository
import biz.web4my.tasteney_be.user.internal.User
import biz.web4my.tasteney_be.user.internal.UserRepository
import biz.web4my.tasteney_be.user.internal.UserServiceImpl
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.Optional
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class UserServiceTest {

    private val userRepository: UserRepository = mock(UserRepository::class.java)
    private val emailVerificationTokenRepository: EmailVerificationTokenRepository = mock(EmailVerificationTokenRepository::class.java)
    private val passwordResetTokenRepository: PasswordResetTokenRepository = mock(PasswordResetTokenRepository::class.java)
    private val passwordEncoder: PasswordEncoder = mock(PasswordEncoder::class.java)
    private val eventPublisher: ApplicationEventPublisher = mock(ApplicationEventPublisher::class.java)
    private lateinit var userService: UserServiceImpl

    @BeforeEach
    fun setUp() {
        userService = UserServiceImpl(
            userRepository = userRepository,
            emailVerificationTokenRepository = emailVerificationTokenRepository,
            passwordResetTokenRepository = passwordResetTokenRepository,
            passwordEncoder = passwordEncoder,
            eventPublisher = eventPublisher,
            baseUrl = "http://localhost:8080"
        )
    }

    @Test
    fun `register creates unverified user and publishes EmailVerificationRequestedEvent`() {
        val request = RegisterRequest(
            email = "tester@tasteney.com",
            password = "password123"
        )

        `when`(userRepository.existsByEmail("tester@tasteney.com")).thenReturn(false)
        `when`(passwordEncoder.encode("password123")).thenReturn("encodedSecret")

        val userId = UUID.randomUUID()
        val createdUser = User(
            id = userId,
            email = "tester@tasteney.com",
            passwordHash = "encodedSecret",
            role = UserRole.USER,
            emailVerified = false,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        `when`(userRepository.save(any(User::class.java))).thenReturn(createdUser)

        val result = userService.register(request)

        assertFalse(result.emailVerified)
        assertEquals("tester@tasteney.com", result.email)

        val tokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken::class.java)
        verify(emailVerificationTokenRepository).save(tokenCaptor.capture())
        val savedToken = tokenCaptor.value
        assertEquals(userId, savedToken.userId)
        assertNotNull(savedToken.token)

        val eventCaptor = ArgumentCaptor.forClass(EmailVerificationRequestedEvent::class.java)
        verify(eventPublisher).publishEvent(eventCaptor.capture())
        val publishedEvent = eventCaptor.value
        assertEquals("tester@tasteney.com", publishedEvent.email)
        assertEquals(savedToken.token, publishedEvent.token)
        assertTrue(publishedEvent.verificationUrl.contains(savedToken.token))
    }

    @Test
    fun `verifyEmail marks user as verified when token is valid`() {
        val userId = UUID.randomUUID()
        val token = "valid-token-123"
        val verificationToken = EmailVerificationToken(
            id = UUID.randomUUID(),
            userId = userId,
            token = token,
            expiresAt = Instant.now().plusSeconds(3600)
        )
        val user = User(
            id = userId,
            email = "user@tasteney.com",
            passwordHash = "hash",
            role = UserRole.USER,
            emailVerified = false
        )

        `when`(emailVerificationTokenRepository.findByToken(token)).thenReturn(verificationToken)
        `when`(userRepository.findById(userId)).thenReturn(Optional.of(user))
        val updatedUser = user.copy(emailVerified = true)
        `when`(userRepository.save(any(User::class.java))).thenReturn(updatedUser)

        val result = userService.verifyEmail(token)

        assertTrue(result.emailVerified)
        verify(emailVerificationTokenRepository).deleteByUserId(userId)
    }

    @Test
    fun `verifyEmail throws BAD_REQUEST when token is expired`() {
        val token = "expired-token"
        val verificationToken = EmailVerificationToken(
            id = UUID.randomUUID(),
            userId = UUID.randomUUID(),
            token = token,
            expiresAt = Instant.now().minusSeconds(10)
        )

        `when`(emailVerificationTokenRepository.findByToken(token)).thenReturn(verificationToken)

        val ex = assertFailsWith<ResponseStatusException> {
            userService.verifyEmail(token)
        }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `verifyEmail throws BAD_REQUEST when token does not exist`() {
        `when`(emailVerificationTokenRepository.findByToken("unknown")).thenReturn(null)

        val ex = assertFailsWith<ResponseStatusException> {
            userService.verifyEmail("unknown")
        }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `requestPasswordReset creates token and publishes PasswordResetRequestedEvent`() {
        val userId = UUID.randomUUID()
        val user = User(
            id = userId,
            email = "user@tasteney.com",
            passwordHash = "hash",
            role = UserRole.USER
        )

        `when`(userRepository.findByEmail("user@tasteney.com")).thenReturn(user)

        userService.requestPasswordReset("user@tasteney.com")

        val tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken::class.java)
        verify(passwordResetTokenRepository).save(tokenCaptor.capture())
        val savedToken = tokenCaptor.value
        assertEquals(userId, savedToken.userId)

        val eventCaptor = ArgumentCaptor.forClass(PasswordResetRequestedEvent::class.java)
        verify(eventPublisher).publishEvent(eventCaptor.capture())
        val publishedEvent = eventCaptor.value
        assertEquals("user@tasteney.com", publishedEvent.email)
        assertEquals(savedToken.token, publishedEvent.token)
    }

    @Test
    fun `resetPassword updates password when token is valid`() {
        val userId = UUID.randomUUID()
        val token = "reset-token-123"
        val resetToken = PasswordResetToken(
            id = UUID.randomUUID(),
            userId = userId,
            token = token,
            expiresAt = Instant.now().plusSeconds(1800)
        )
        val user = User(
            id = userId,
            email = "user@tasteney.com",
            passwordHash = "oldHash",
            role = UserRole.USER
        )

        `when`(passwordResetTokenRepository.findByToken(token)).thenReturn(resetToken)
        `when`(userRepository.findById(userId)).thenReturn(Optional.of(user))
        `when`(passwordEncoder.encode("brandNewPassword123")).thenReturn("newEncodedHash")

        val request = ResetPasswordRequest(
            token = token,
            newPassword = "brandNewPassword123",
            confirmPassword = "brandNewPassword123"
        )

        userService.resetPassword(request)

        val captor = ArgumentCaptor.forClass(User::class.java)
        verify(userRepository).save(captor.capture())
        assertEquals("newEncodedHash", captor.value.passwordHash)
        verify(passwordResetTokenRepository).deleteByUserId(userId)
    }

    @Test
    fun `resetPassword throws BAD_REQUEST when confirmation does not match`() {
        val request = ResetPasswordRequest(
            token = "any",
            newPassword = "password123",
            confirmPassword = "mismatchedPassword"
        )

        val ex = assertFailsWith<ResponseStatusException> {
            userService.resetPassword(request)
        }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `changePassword updates password hash when valid`() {
        val userId = UUID.randomUUID()
        val existingUser = User(
            id = userId,
            email = "admin@tasteney.com",
            passwordHash = "oldHash",
            role = UserRole.ADMIN,
            createdAt = Instant.now().minusSeconds(3600),
            updatedAt = Instant.now().minusSeconds(3600)
        )

        `when`(userRepository.findById(userId)).thenReturn(Optional.of(existingUser))
        `when`(passwordEncoder.matches("oldPassword", "oldHash")).thenReturn(true)
        `when`(passwordEncoder.encode("newPassword123")).thenReturn("newEncodedHash")

        val request = ChangePasswordRequest(
            currentPassword = "oldPassword",
            newPassword = "newPassword123",
            confirmPassword = "newPassword123"
        )

        userService.changePassword(userId, request)

        val captor = ArgumentCaptor.forClass(User::class.java)
        verify(userRepository).save(captor.capture())
        val savedUser = captor.value
        assertEquals("newEncodedHash", savedUser.passwordHash)
        assertTrue(savedUser.updatedAt.isAfter(existingUser.updatedAt))
    }

    @Test
    fun `changePassword throws NOT_FOUND when user does not exist`() {
        val userId = UUID.randomUUID()
        `when`(userRepository.findById(userId)).thenReturn(Optional.empty())

        val request = ChangePasswordRequest(
            currentPassword = "oldPassword",
            newPassword = "newPassword123",
            confirmPassword = "newPassword123"
        )

        val ex = assertFailsWith<ResponseStatusException> {
            userService.changePassword(userId, request)
        }
        assertEquals(HttpStatus.NOT_FOUND, ex.statusCode)
    }

    @Test
    fun `changePassword throws BAD_REQUEST when confirmation does not match`() {
        val userId = UUID.randomUUID()
        val existingUser = User(
            id = userId,
            email = "admin@tasteney.com",
            passwordHash = "oldHash",
            role = UserRole.ADMIN
        )

        `when`(userRepository.findById(userId)).thenReturn(Optional.of(existingUser))

        val request = ChangePasswordRequest(
            currentPassword = "oldPassword",
            newPassword = "newPassword123",
            confirmPassword = "mismatchedPassword"
        )

        val ex = assertFailsWith<ResponseStatusException> {
            userService.changePassword(userId, request)
        }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
        assertEquals("New password and confirmation do not match", ex.reason)
    }

    @Test
    fun `changePassword throws BAD_REQUEST when current password is incorrect`() {
        val userId = UUID.randomUUID()
        val existingUser = User(
            id = userId,
            email = "admin@tasteney.com",
            passwordHash = "oldHash",
            role = UserRole.ADMIN
        )

        `when`(userRepository.findById(userId)).thenReturn(Optional.of(existingUser))
        `when`(passwordEncoder.matches("wrongPassword", "oldHash")).thenReturn(false)

        val request = ChangePasswordRequest(
            currentPassword = "wrongPassword",
            newPassword = "newPassword123",
            confirmPassword = "newPassword123"
        )

        val ex = assertFailsWith<ResponseStatusException> {
            userService.changePassword(userId, request)
        }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
        assertEquals("Current password is incorrect", ex.reason)
    }

    @Test
    fun `changePassword throws BAD_REQUEST when new password is too short`() {
        val userId = UUID.randomUUID()
        val existingUser = User(
            id = userId,
            email = "admin@tasteney.com",
            passwordHash = "oldHash",
            role = UserRole.ADMIN
        )

        `when`(userRepository.findById(userId)).thenReturn(Optional.of(existingUser))
        `when`(passwordEncoder.matches("oldPassword", "oldHash")).thenReturn(true)

        val request = ChangePasswordRequest(
            currentPassword = "oldPassword",
            newPassword = "short",
            confirmPassword = "short"
        )

        val ex = assertFailsWith<ResponseStatusException> {
            userService.changePassword(userId, request)
        }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
        assertEquals("Password must be at least 6 characters", ex.reason)
    }

    @Test
    fun `createAdmin creates and returns admin user with role ADMIN`() {
        val request = CreateAdminRequest(
            email = "newadmin@tasteney.com",
            password = "securePassword123"
        )

        `when`(userRepository.existsByEmail("newadmin@tasteney.com")).thenReturn(false)
        `when`(passwordEncoder.encode("securePassword123")).thenReturn("encodedPassword")

        val createdUser = User(
            id = UUID.randomUUID(),
            email = "newadmin@tasteney.com",
            passwordHash = "encodedPassword",
            role = UserRole.ADMIN,
            emailVerified = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        val captor = ArgumentCaptor.forClass(User::class.java)
        `when`(userRepository.save(captor.capture())).thenReturn(createdUser)

        val result = userService.createAdmin(request)

        assertEquals("newadmin@tasteney.com", result.email)
        assertEquals(UserRole.ADMIN, result.role)
        assertTrue(result.emailVerified)
        val savedUser = captor.value
        assertEquals("newadmin@tasteney.com", savedUser.email)
        assertEquals(UserRole.ADMIN, savedUser.role)
        assertEquals("encodedPassword", savedUser.passwordHash)
    }

    @Test
    fun `createAdmin throws CONFLICT when email already exists`() {
        val request = CreateAdminRequest(
            email = "existing@tasteney.com",
            password = "securePassword123"
        )

        `when`(userRepository.existsByEmail("existing@tasteney.com")).thenReturn(true)

        val ex = assertFailsWith<ResponseStatusException> {
            userService.createAdmin(request)
        }
        assertEquals(HttpStatus.CONFLICT, ex.statusCode)
    }
}
