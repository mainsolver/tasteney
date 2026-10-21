package biz.web4my.tasteney_be.mail

import biz.web4my.tasteney_be.mail.internal.MailEventListener
import biz.web4my.tasteney_be.mail.internal.MailTemplateService
import biz.web4my.tasteney_be.user.EmailVerificationRequestedEvent
import biz.web4my.tasteney_be.user.PasswordResetRequestedEvent
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import java.util.UUID

class MailEventListenerTest {

    private val mailService: MailService = mock(MailService::class.java)
    private val templateService: MailTemplateService = mock(MailTemplateService::class.java)
    private val listener = MailEventListener(mailService, templateService)

    @Test
    fun `onEmailVerificationRequested renders template and calls mailService`() {
        val event = EmailVerificationRequestedEvent(
            userId = UUID.randomUUID(),
            email = "user@example.com",
            token = "token123",
            verificationUrl = "http://localhost:8080/api/v1/auth/verify-email?token=token123"
        )

        `when`(templateService.buildEmailVerificationHtml("user@example.com", event.verificationUrl)).thenReturn("<html>verify</html>")
        `when`(templateService.buildEmailVerificationText("user@example.com", event.verificationUrl)).thenReturn("verify text")

        listener.onEmailVerificationRequested(event)

        verify(mailService).sendEmail("user@example.com", "Verifiziere deine E-Mail-Adresse für Tasteney", "<html>verify</html>", "verify text")
    }

    @Test
    fun `onPasswordResetRequested renders template and calls mailService`() {
        val event = PasswordResetRequestedEvent(
            userId = UUID.randomUUID(),
            email = "user@example.com",
            token = "reset123",
            resetUrl = "http://localhost:8080/api/v1/auth/reset-password?token=reset123"
        )

        `when`(templateService.buildPasswordResetHtml("user@example.com", event.resetUrl)).thenReturn("<html>reset</html>")
        `when`(templateService.buildPasswordResetText("user@example.com", event.resetUrl)).thenReturn("reset text")

        listener.onPasswordResetRequested(event)

        verify(mailService).sendEmail("user@example.com", "Setze dein Passwort für Tasteney zurück", "<html>reset</html>", "reset text")
    }
}
