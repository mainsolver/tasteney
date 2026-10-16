package biz.web4my.tasteney_be

import org.junit.jupiter.api.Test
import org.springframework.modulith.core.ApplicationModules

class ModulithArchitectureTests {

    @Test
    fun `verify spring modulith module architecture`() {
        val modules = ApplicationModules.of(TasteneyBeApplication::class.java)
        modules.verify()
    }
}
