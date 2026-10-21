package biz.web4my.tasteney_be.mail.internal

import biz.web4my.tasteney_be.mail.MailService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.core.env.Environment
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient

@Service
@Profile("!JUNIT & !test")
class LettermintMailService(
    private val environment: Environment,
    @Value("\${lettermint.api-url:https://api.lettermint.co/v1/send}") private val apiUrl: String,
    @Value("\${lettermint.from:Tasteney <noreply@tasteney.com>}") private val fromAddress: String,
    @Value("\${lettermint.api-key:#{null}}") private val configuredApiKey: String?,
    private val restClientBuilder: RestClient.Builder = RestClient.builder()
) : MailService {
    private val logger = LoggerFactory.getLogger(LettermintMailService::class.java)

    fun resolveApiKey(): String? {
        return System.getProperty("LETTERMINT_API_KEY")
            ?: System.getProperty("lettermint.api.key")
            ?: System.getProperty("lettermint.api-key")
            ?: System.getenv("LETTERMINT_API_KEY")
            ?: System.getenv("LETTERMINT_PROJECT_TOKEN")
            ?: System.getenv("LETTERMINT_TOKEN")
            ?: environment.getProperty("lettermint.api-key")
            ?: environment.getProperty("LETTERMINT_API_KEY")
            ?: environment.getProperty("LETTERMINT_PROJECT_TOKEN")
            ?: configuredApiKey
    }

    override fun sendEmail(to: String, subject: String, htmlContent: String, textContent: String) {
        val apiKey = resolveApiKey()
        if (apiKey.isNullOrBlank()) {
            logger.warn("Lettermint API key is not configured in system variables (LETTERMINT_API_KEY / lettermint.api.key). Email to {} will not be sent.", to)
            return
        }

        try {
            val restClient = restClientBuilder.build()
            val payload = mapOf(
                "from" to fromAddress,
                "to" to listOf(to),
                "subject" to subject,
                "html" to htmlContent,
                "text" to textContent
            )

            val response = restClient.post()
                .uri(apiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-lettermint-token", apiKey)
                .body(payload)
                .retrieve()
                .toBodilessEntity()

            logger.info("Email successfully sent via Lettermint to: {}, status: {}", to, response.statusCode)
        } catch (ex: Exception) {
            logger.error("Failed to send email via Lettermint to $to: ${ex.message}", ex)
            throw ex
        }
    }
}
