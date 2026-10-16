package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.user.UserRole
import biz.web4my.tasteney_be.user.UserService
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam

@Controller
@RequestMapping("/admin/htmx")
class AdminHtmxController(
    private val userService: UserService
) {

    @GetMapping("/users")
    fun usersTable(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) role: String?,
        model: Model
    ): String {
        val userRole = if (!role.isNullOrBlank() && role != "ALL") {
            try {
                UserRole.valueOf(role.trim().uppercase())
            } catch (_: IllegalArgumentException) {
                null
            }
        } else {
            null
        }

        val users = userService.findAll(search = query, role = userRole)
        model.addAttribute("users", users)
        return "admin/fragments/user-table"
    }
}
