package biz.web4my.tasteney_be.mail

import java.time.Instant

data class SentEmail(
    val to: String,
    val subject: String,
    val htmlContent: String,
    val textContent: String,
    val timestamp: Instant = Instant.now()
)

interface MailService {
    fun sendEmail(to: String, subject: String, htmlContent: String, textContent: String)
}
