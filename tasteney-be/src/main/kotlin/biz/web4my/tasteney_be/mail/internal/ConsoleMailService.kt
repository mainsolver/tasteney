package biz.web4my.tasteney_be.mail.internal

import biz.web4my.tasteney_be.mail.MailService
import biz.web4my.tasteney_be.mail.SentEmail
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.concurrent.CopyOnWriteArrayList

@Service
@Profile("JUNIT", "test")
class ConsoleMailService : MailService {
    private val logger = LoggerFactory.getLogger(ConsoleMailService::class.java)
    val sentEmails = CopyOnWriteArrayList<SentEmail>()

    override fun sendEmail(to: String, subject: String, htmlContent: String, textContent: String) {
        val email = SentEmail(to, subject, htmlContent, textContent, Instant.now())
        sentEmails.add(email)
        logger.info("[ConsoleMailService - JUNIT profile] Sending email to: {}", to)
        logger.info("[ConsoleMailService - JUNIT profile] Subject: {}", subject)
        logger.info("[ConsoleMailService - JUNIT profile] Text content:\n{}", textContent)
        println("=== [CONSOLE MAIL SERVICE - JUNIT PROFILE] ===")
        println("To: $to")
        println("Subject: $subject")
        println("Body:\n$textContent")
        println("==============================================")
    }

    fun clear() {
        sentEmails.clear()
    }
}
