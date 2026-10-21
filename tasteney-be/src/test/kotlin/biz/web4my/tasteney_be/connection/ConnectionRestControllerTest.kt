package biz.web4my.tasteney_be.connection

import biz.web4my.tasteney_be.connection.internal.ConnectionRestController
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ConnectionRestControllerTest {

    private val controller = ConnectionRestController()

    @Test
    fun `checkConnection returns OK status with connection payload`() {
        val response = controller.checkConnection()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals("ok", response.body?.status)
        assertEquals("Connected to Tasteney API", response.body?.message)
        assertNotNull(response.body?.timestamp)
    }
}
