package biz.web4my.tasteney_be.user

import biz.web4my.tasteney_be.user.internal.AuthRestController
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class AuthRestControllerTest {

    private val userService: UserService = mock(UserService::class.java)
    private val authenticationManager: AuthenticationManager = mock(AuthenticationManager::class.java)
    private lateinit var controller: AuthRestController

    @BeforeEach
    fun setUp() {
        controller = AuthRestController(userService, authenticationManager)
    }

    @Test
    fun `register creates user and returns 201 Created`() {
        val request = RegisterRequest(email = "test@example.com", password = "password123")
        val expectedDto = UserDto(
            id = UUID.randomUUID(),
            email = "test@example.com",
            role = UserRole.USER,
            emailVerified = false,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        `when`(userService.register(request)).thenReturn(expectedDto)

        val response = controller.register(request)

        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals(expectedDto, response.body)
    }

    @Test
    fun `verifyEmail with POST returns 200 OK`() {
        val request = VerifyEmailRequest(token = "tok123")
        val expectedDto = UserDto(
            id = UUID.randomUUID(),
            email = "test@example.com",
            role = UserRole.USER,
            emailVerified = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        `when`(userService.verifyEmail("tok123")).thenReturn(expectedDto)

        val response = controller.verifyEmail(request, null)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("Email verified successfully", response.body?.message)
    }

    @Test
    fun `verifyEmailGet with HTML accept returns HTML`() {
        val expectedDto = UserDto(
            id = UUID.randomUUID(),
            email = "test@example.com",
            role = UserRole.USER,
            emailVerified = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        `when`(userService.verifyEmail("valid-tok")).thenReturn(expectedDto)

        val response = controller.verifyEmailGet("valid-tok", "text/html,application/xhtml+xml")

        assertEquals(HttpStatus.OK, response.statusCode)
        val bodyStr = response.body.toString()
        assertTrue(bodyStr.contains("E-Mail-Adresse erfolgreich bestätigt"))
    }

    @Test
    fun `resendVerification calls service and returns 200 OK`() {
        val request = ResendVerificationRequest(email = "test@example.com")

        val response = controller.resendVerification(request)

        verify(userService).resendVerificationEmail("test@example.com")
        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body?.message?.contains("Verification email sent") == true)
    }

    @Test
    fun `forgotPassword calls service and returns 200 OK`() {
        val request = ForgotPasswordRequest(email = "test@example.com")

        val response = controller.forgotPassword(request)

        verify(userService).requestPasswordReset("test@example.com")
        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body?.message?.contains("password reset link has been sent") == true)
    }

    @Test
    fun `resetPassword calls service and returns 200 OK`() {
        val request = ResetPasswordRequest(token = "tok123", newPassword = "newPassword123", confirmPassword = "newPassword123")

        val response = controller.resetPassword(request)

        verify(userService).resetPassword(request)
        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body?.message?.contains("Password has been reset") == true)
    }

    @Test
    fun `resetPasswordGet returns form for HTML request when token valid`() {
        `when`(userService.validatePasswordResetToken("tok123")).thenReturn(true)

        val response = controller.resetPasswordGet("tok123", "text/html")

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body.toString().contains("Neues Passwort vergeben"))
    }

    @Test
    fun `login with valid credentials returns 200 OK`() {
        val request = LoginRequest(email = "test@example.com", password = "password123")
        val authToken = UsernamePasswordAuthenticationToken(
            "test@example.com",
            "password123",
            listOf(SimpleGrantedAuthority("ROLE_USER"))
        )
        val expectedDto = UserDto(
            id = UUID.randomUUID(),
            email = "test@example.com",
            role = UserRole.USER,
            emailVerified = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        `when`(authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("test@example.com", "password123")))
            .thenReturn(authToken)
        `when`(userService.findByEmail("test@example.com")).thenReturn(expectedDto)

        val httpServletRequest = MockHttpServletRequest()
        val httpServletResponse = MockHttpServletResponse()

        val response = controller.login(request, httpServletRequest, httpServletResponse)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(expectedDto, response.body)
    }

    @Test
    fun `login with invalid credentials throws 401 Unauthorized`() {
        val request = LoginRequest(email = "test@example.com", password = "wrongPassword")

        `when`(authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("test@example.com", "wrongPassword")))
            .thenThrow(BadCredentialsException("Bad credentials"))

        val httpServletRequest = MockHttpServletRequest()
        val httpServletResponse = MockHttpServletResponse()

        val ex = assertFailsWith<ResponseStatusException> {
            controller.login(request, httpServletRequest, httpServletResponse)
        }

        assertEquals(HttpStatus.UNAUTHORIZED, ex.statusCode)
    }

    @Test
    fun `me returns current user info when authenticated`() {
        val expectedDto = UserDto(
            id = UUID.randomUUID(),
            email = "test@example.com",
            role = UserRole.USER,
            emailVerified = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        val auth: Authentication = UsernamePasswordAuthenticationToken(
            "test@example.com",
            "credentials",
            listOf(SimpleGrantedAuthority("ROLE_USER"))
        )

        `when`(userService.findByEmail("test@example.com")).thenReturn(expectedDto)

        val response = controller.me(auth)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(expectedDto, response.body)
    }

    @Test
    fun `me returns 401 when unauthenticated`() {
        val ex = assertFailsWith<ResponseStatusException> {
            controller.me(null)
        }

        assertEquals(HttpStatus.UNAUTHORIZED, ex.statusCode)
    }

    @Test
    fun `logout clears session and returns 204 No Content`() {
        val httpServletRequest = MockHttpServletRequest()
        httpServletRequest.session.setAttribute("user", "test")

        val response = controller.logout(httpServletRequest)

        assertEquals(HttpStatus.NO_CONTENT, response.statusCode)
    }
}
