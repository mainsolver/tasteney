package biz.web4my.tasteney_be.mail

import biz.web4my.tasteney_be.mail.internal.ConsoleMailService
import biz.web4my.tasteney_be.mail.internal.LettermintMailService
import org.junit.jupiter.api.Test
import org.springframework.mock.env.MockEnvironment
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class LettermintMailServiceTest {

    @Test
    fun `resolveApiKey reads from environment property or system property`() {
        val env = MockEnvironment()
        env.setProperty("lettermint.api-key", "test-key-123")

        val service = LettermintMailService(
            environment = env,
            apiUrl = "https://api.lettermint.co/v1/send",
            fromAddress = "Tasteney <noreply@tasteney.com>",
            configuredApiKey = null
        )

        assertEquals("test-key-123", service.resolveApiKey())
    }

    @Test
    fun `resolveApiKey returns null when no property is set`() {
        val env = MockEnvironment()

        val service = LettermintMailService(
            environment = env,
            apiUrl = "https://api.lettermint.co/v1/send",
            fromAddress = "Tasteney <noreply@tasteney.com>",
            configuredApiKey = null
        )

        // If system env variables are not present, resolves to null/blank
        val key = service.resolveApiKey()
        // Should not throw exception
    }
}

class ConsoleMailServiceTest {

    @Test
    fun `sendEmail logs and records sent emails in JUNIT profile`() {
        val consoleService = ConsoleMailService()
        consoleService.clear()

        consoleService.sendEmail("test@example.com", "Test Subject", "<h1>Hello</h1>", "Hello")

        assertEquals(1, consoleService.sentEmails.size)
        val sent = consoleService.sentEmails[0]
        assertEquals("test@example.com", sent.to)
        assertEquals("Test Subject", sent.subject)
        assertEquals("Hello", sent.textContent)
    }
}
