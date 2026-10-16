package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.user.UserService
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam

@Controller
@RequestMapping("/admin")
class AdminWebController(
    private val userService: UserService
) {

    @GetMapping("/login")
    fun login(
        @RequestParam(required = false) error: String?,
        @RequestParam(required = false) logout: String?,
        model: Model
    ): String {
        if (error != null) {
            model.addAttribute("loginError", "Invalid administrator credentials.")
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "You have been logged out successfully.")
        }
        return "admin/login"
    }

    @GetMapping("/dashboard")
    fun dashboard(model: Model): String {
        val totalUsers = userService.countUsers()
        val totalAdmins = userService.countAdmins()
        val users = userService.findAll()

        model.addAttribute("totalUsers", totalUsers)
        model.addAttribute("totalAdmins", totalAdmins)
        model.addAttribute("users", users)
        return "admin/dashboard"
    }
}
