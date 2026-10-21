package biz.web4my.tasteney_be.mail.internal

import biz.web4my.tasteney_be.mail.MailService
import biz.web4my.tasteney_be.user.EmailVerificationRequestedEvent
import biz.web4my.tasteney_be.user.PasswordResetRequestedEvent
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class MailEventListener(
    private val mailService: MailService,
    private val templateService: MailTemplateService
) {
    private val logger = LoggerFactory.getLogger(MailEventListener::class.java)

    @EventListener
    fun onEmailVerificationRequested(event: EmailVerificationRequestedEvent) {
        logger.info("Handling EmailVerificationRequestedEvent for user: {}", event.email)
        val subject = "Verifiziere deine E-Mail-Adresse für Tasteney"
        val html = templateService.buildEmailVerificationHtml(event.email, event.verificationUrl)
        val text = templateService.buildEmailVerificationText(event.email, event.verificationUrl)
        mailService.sendEmail(event.email, subject, html, text)
    }

    @EventListener
    fun onPasswordResetRequested(event: PasswordResetRequestedEvent) {
        logger.info("Handling PasswordResetRequestedEvent for user: {}", event.email)
        val subject = "Setze dein Passwort für Tasteney zurück"
        val html = templateService.buildPasswordResetHtml(event.email, event.resetUrl)
        val text = templateService.buildPasswordResetText(event.email, event.resetUrl)
        mailService.sendEmail(event.email, subject, html, text)
    }
}
