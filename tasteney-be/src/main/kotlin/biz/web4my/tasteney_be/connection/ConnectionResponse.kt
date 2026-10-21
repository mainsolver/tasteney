package biz.web4my.tasteney_be.connection

import java.time.Instant

data class ConnectionResponse(
    val status: String = "ok",
    val message: String = "Connected to Tasteney API",
    val timestamp: Instant = Instant.now()
)
