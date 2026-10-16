package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.user.UserRole
import biz.web4my.tasteney_be.user.UserService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.view

@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@AutoConfigureMockMvc
class AdminWebControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

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
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
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
            .andExpect(content().string(org.hamcrest.Matchers.containsString("admin-001@tasteney.com")))
    }
}
