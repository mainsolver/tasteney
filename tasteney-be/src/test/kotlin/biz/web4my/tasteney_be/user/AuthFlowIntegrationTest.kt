package biz.web4my.tasteney_be.user

import biz.web4my.tasteney_be.mail.internal.ConsoleMailService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("JUNIT")
class AuthFlowIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var consoleMailService: ConsoleMailService

    @Autowired
    private lateinit var userService: UserService

    @BeforeEach
    fun setUp() {
        consoleMailService.clear()
    }

    @Test
    fun `full registration, email verification, and password reset workflow`() {
        val uniqueEmail = "user_${UUID.randomUUID()}@tasteney.com"
        val initialPassword = "initialPassword123"

        // 1. Register User
        mockMvc.perform(
            post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"email":"$uniqueEmail","password":"$initialPassword"}""")
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.email").value(uniqueEmail))
            .andExpect(jsonPath("$.emailVerified").value(false))

        // Verify email was sent via event to ConsoleMailService
        assertEquals(1, consoleMailService.sentEmails.size)
        val verificationEmail = consoleMailService.sentEmails.first()
        assertEquals(uniqueEmail, verificationEmail.to)
        assertTrue(verificationEmail.subject.contains("Verifiziere deine E-Mail-Adresse"))

        // Extract token from email
        val tokenRegex = "token=([a-f0-9]+)".toRegex()
        val matchResult = tokenRegex.find(verificationEmail.textContent)
        assertNotNull(matchResult, "Token should be present in verification email text")
        val verificationToken = matchResult.groupValues[1]

        // 2. Verify Email via GET endpoint (simulating clicking browser link)
        mockMvc.perform(
            get("/api/v1/auth/verify-email")
                .param("token", verificationToken)
                .header("Accept", "text/html")
        )
            .andExpect(status().isOk)

        // Confirm user is now verified
        val verifiedUser = userService.findByEmail(uniqueEmail)
        assertNotNull(verifiedUser)
        assertTrue(verifiedUser.emailVerified)

        // 3. Request Password Reset
        consoleMailService.clear()
        mockMvc.perform(
            post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"email":"$uniqueEmail"}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.message").exists())

        // Verify reset email was sent via event
        assertEquals(1, consoleMailService.sentEmails.size)
        val resetEmail = consoleMailService.sentEmails.first()
        assertEquals(uniqueEmail, resetEmail.to)
        assertTrue(resetEmail.subject.contains("Passwort"))

        val resetTokenMatch = tokenRegex.find(resetEmail.textContent)
        assertNotNull(resetTokenMatch, "Reset token should be present in email text")
        val resetToken = resetTokenMatch.groupValues[1]

        // 4. Validate reset token via GET
        mockMvc.perform(
            get("/api/v1/auth/reset-password")
                .param("token", resetToken)
                .header("Accept", "application/json")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.valid").value(true))

        // 5. Reset Password
        val newPassword = "newSuperSecretPassword123"
        mockMvc.perform(
            post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"token":"$resetToken","newPassword":"$newPassword","confirmPassword":"$newPassword"}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.message").value("Password has been reset successfully."))

        // 6. Login with new password
        mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"email":"$uniqueEmail","password":"$newPassword"}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value(uniqueEmail))
            .andExpect(jsonPath("$.emailVerified").value(true))
    }
}
