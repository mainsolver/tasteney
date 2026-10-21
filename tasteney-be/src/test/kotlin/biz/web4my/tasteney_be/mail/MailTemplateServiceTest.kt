package biz.web4my.tasteney_be.mail

import biz.web4my.tasteney_be.mail.internal.MailTemplateService
import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class MailTemplateServiceTest {

    private val templateService = MailTemplateService()

    @Test
    fun `buildEmailVerificationHtml contains marketing colors, logo and verification link`() {
        val html = templateService.buildEmailVerificationHtml("sommelier@tasteney.com", "http://localhost:8080/api/v1/auth/verify-email?token=abc-123")

        assertTrue(html.contains("Tasteney"))
        assertTrue(html.contains("E-Mail Verifizierung"))
        assertTrue(html.contains("http://localhost:8080/api/v1/auth/verify-email?token=abc-123"))
        assertTrue(html.contains("#4d0011")) // primary burgundy
        assertTrue(html.contains("#c49a45")) // gold accent
        assertTrue(html.contains("#fcf9f4")) // canvas bg
    }

    @Test
    fun `buildEmailVerificationText contains verification link`() {
        val text = templateService.buildEmailVerificationText("sommelier@tasteney.com", "http://localhost:8080/api/v1/auth/verify-email?token=abc-123")

        assertTrue(text.contains("Willkommen bei Tasteney!"))
        assertTrue(text.contains("http://localhost:8080/api/v1/auth/verify-email?token=abc-123"))
    }

    @Test
    fun `buildPasswordResetHtml contains reset link and warning notes`() {
        val html = templateService.buildPasswordResetHtml("sommelier@tasteney.com", "http://localhost:8080/api/v1/auth/reset-password?token=reset-123")

        assertTrue(html.contains("Passwort zurücksetzen"))
        assertTrue(html.contains("http://localhost:8080/api/v1/auth/reset-password?token=reset-123"))
        assertTrue(html.contains("1 Stunde"))
        assertTrue(html.contains("#4d0011"))
    }

    @Test
    fun `buildPasswordResetText contains reset link`() {
        val text = templateService.buildPasswordResetText("sommelier@tasteney.com", "http://localhost:8080/api/v1/auth/reset-password?token=reset-123")

        assertTrue(text.contains("Passwort zurücksetzen"))
        assertTrue(text.contains("http://localhost:8080/api/v1/auth/reset-password?token=reset-123"))
    }
}
