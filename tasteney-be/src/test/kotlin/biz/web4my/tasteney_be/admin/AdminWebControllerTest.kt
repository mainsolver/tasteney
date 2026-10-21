package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.user.CreateAdminRequest
import biz.web4my.tasteney_be.user.UserRole
import biz.web4my.tasteney_be.user.UserService
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.flash
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.view

@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@AutoConfigureMockMvc
class AdminWebControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userService: UserService

    @Test
    fun `unauthenticated access to admin dashboard redirects to login`() {
        mockMvc.perform(get("/admin/dashboard"))
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/login"))
    }

    @Test
    @WithMockUser(username = "regular@example.com", roles = ["USER"])
    fun `regular user receives 403 Forbidden for admin dashboard`() {
        mockMvc.perform(get("/admin/dashboard"))
            .andExpect(status().isForbidden)
    }

    @Test
    @WithMockUser(username = "admin.t.1@tasteney.com", roles = ["ADMIN"])
    fun `admin user can access dashboard successfully`() {
        mockMvc.perform(get("/admin/dashboard"))
            .andExpect(status().isOk)
            .andExpect(view().name("admin/dashboard"))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can search and filter users via htmx endpoint`() {
        mockMvc.perform(get("/admin/htmx/users").param("query", "admin"))
            .andExpect(status().isOk)
            .andExpect(view().name("admin/fragments/user-table"))
            .andExpect(content().string(containsString("admin-001@tasteney.com")))
    }

    @Test
    fun `unauthenticated access to admin profile redirects to login`() {
        mockMvc.perform(get("/admin/profile"))
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/login"))
    }

    @Test
    @WithMockUser(username = "regular@example.com", roles = ["USER"])
    fun `regular user receives 403 Forbidden for admin profile`() {
        mockMvc.perform(get("/admin/profile"))
            .andExpect(status().isForbidden)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can access profile page successfully`() {
        mockMvc.perform(get("/admin/profile"))
            .andExpect(status().isOk)
            .andExpect(view().name("admin/profile"))
            .andExpect(content().string(containsString("Admin Profile & Management")))
            .andExpect(content().string(containsString("admin-001@tasteney.com")))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `password change with mismatched confirmation returns error flash attribute`() {
        mockMvc.perform(
            post("/admin/profile/change-password")
                .with(csrf())
                .param("currentPassword", "anyPassword")
                .param("newPassword", "newPassword123")
                .param("confirmPassword", "differentPassword123")
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/profile"))
            .andExpect(flash().attribute("passwordError", "New password and confirmation do not match"))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `password change with incorrect current password returns error flash attribute`() {
        mockMvc.perform(
            post("/admin/profile/change-password")
                .with(csrf())
                .param("currentPassword", "wrongCurrentPassword")
                .param("newPassword", "validNewPassword123")
                .param("confirmPassword", "validNewPassword123")
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/profile"))
            .andExpect(flash().attribute("passwordError", "Current password is incorrect"))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can successfully create new administrator`() {
        val uniqueEmail = "new-admin-${System.currentTimeMillis()}@tasteney.com"

        mockMvc.perform(
            post("/admin/profile/add-admin")
                .with(csrf())
                .param("email", uniqueEmail)
                .param("password", "strongAdminPass123")
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/profile"))
            .andExpect(flash().attribute("adminSuccess", containsString(uniqueEmail)))

        val created = userService.findByEmail(uniqueEmail)
        org.junit.jupiter.api.Assertions.assertNotNull(created)
        org.junit.jupiter.api.Assertions.assertEquals(UserRole.ADMIN, created?.role)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `adding existing admin email returns conflict error flash attribute`() {
        mockMvc.perform(
            post("/admin/profile/add-admin")
                .with(csrf())
                .param("email", "admin-001@tasteney.com")
                .param("password", "strongAdminPass123")
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/profile"))
            .andExpect(flash().attribute("adminError", "User with email already exists"))
    }

    @Test
    fun `admin user can change password and then authenticate with new password`() {
        val testEmail = "pw-test-admin-${System.currentTimeMillis()}@tasteney.com"
        val initialPassword = "initialPassword123"
        val newPassword = "updatedPassword456"

        userService.createAdmin(CreateAdminRequest(email = testEmail, password = initialPassword))

        // Change password as this admin
        mockMvc.perform(
            post("/admin/profile/change-password")
                .with(csrf())
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(testEmail).roles("ADMIN"))
                .param("currentPassword", initialPassword)
                .param("newPassword", newPassword)
                .param("confirmPassword", newPassword)
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/profile"))
            .andExpect(flash().attribute("passwordSuccess", "Password changed successfully."))

        // Verify login with new password works
        mockMvc.perform(
            post("/admin/login")
                .with(csrf())
                .param("username", testEmail)
                .param("password", newPassword)
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/dashboard"))
    }
}
