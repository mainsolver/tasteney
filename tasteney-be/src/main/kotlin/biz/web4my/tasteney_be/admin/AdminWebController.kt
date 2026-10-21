package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.user.ChangePasswordRequest
import biz.web4my.tasteney_be.user.CreateAdminRequest
import biz.web4my.tasteney_be.user.UserRole
import biz.web4my.tasteney_be.user.UserService
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.validation.BindingResult
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.mvc.support.RedirectAttributes

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

    @GetMapping("/profile")
    fun profile(authentication: Authentication?, model: Model): String {
        val currentAdmin = authentication?.name?.let { userService.findByEmail(it) }
        val admins = userService.findAll(role = UserRole.ADMIN)

        model.addAttribute("currentAdmin", currentAdmin)
        model.addAttribute("admins", admins)
        return "admin/profile"
    }

    @PostMapping("/profile/change-password")
    fun changePassword(
        @Valid @ModelAttribute request: ChangePasswordRequest,
        bindingResult: BindingResult,
        authentication: Authentication?,
        redirectAttributes: RedirectAttributes
    ): String {
        if (bindingResult.hasErrors()) {
            val errorMessage = bindingResult.allErrors.firstOrNull()?.defaultMessage ?: "Invalid input"
            redirectAttributes.addFlashAttribute("passwordError", errorMessage)
            return "redirect:/admin/profile"
        }

        val currentAdmin = authentication?.name?.let { userService.findByEmail(it) }
        if (currentAdmin == null) {
            redirectAttributes.addFlashAttribute("passwordError", "Authenticated user not found.")
            return "redirect:/admin/profile"
        }

        try {
            userService.changePassword(currentAdmin.id, request)
            redirectAttributes.addFlashAttribute("passwordSuccess", "Password changed successfully.")
        } catch (ex: ResponseStatusException) {
            redirectAttributes.addFlashAttribute("passwordError", ex.reason ?: "Failed to change password.")
        } catch (ex: Exception) {
            redirectAttributes.addFlashAttribute("passwordError", ex.message ?: "Failed to change password.")
        }

        return "redirect:/admin/profile"
    }

    @PostMapping("/profile/add-admin")
    fun addAdmin(
        @Valid @ModelAttribute request: CreateAdminRequest,
        bindingResult: BindingResult,
        redirectAttributes: RedirectAttributes
    ): String {
        if (bindingResult.hasErrors()) {
            val errorMessage = bindingResult.allErrors.firstOrNull()?.defaultMessage ?: "Invalid input"
            redirectAttributes.addFlashAttribute("adminError", errorMessage)
            return "redirect:/admin/profile"
        }

        try {
            val created = userService.createAdmin(request)
            redirectAttributes.addFlashAttribute("adminSuccess", "Administrator '${created.email}' created successfully.")
        } catch (ex: ResponseStatusException) {
            redirectAttributes.addFlashAttribute("adminError", ex.reason ?: "Failed to create administrator.")
        } catch (ex: Exception) {
            redirectAttributes.addFlashAttribute("adminError", ex.message ?: "Failed to create administrator.")
        }

        return "redirect:/admin/profile"
    }
}
