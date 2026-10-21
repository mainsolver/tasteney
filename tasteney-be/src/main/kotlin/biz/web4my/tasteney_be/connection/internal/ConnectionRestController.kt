package biz.web4my.tasteney_be.connection.internal

import biz.web4my.tasteney_be.connection.ConnectionResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/connection")
class ConnectionRestController {

    @GetMapping
    fun checkConnection(): ResponseEntity<ConnectionResponse> {
        return ResponseEntity.ok(ConnectionResponse())
    }
}
