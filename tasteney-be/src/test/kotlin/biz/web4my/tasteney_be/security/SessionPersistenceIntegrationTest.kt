package biz.web4my.tasteney_be.security

import biz.web4my.tasteney_be.user.LoginRequest
import biz.web4my.tasteney_be.user.RegisterRequest
import jakarta.servlet.http.Cookie
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.view

@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@AutoConfigureMockMvc
class SessionPersistenceIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var sessionRepository: FindByIndexNameSessionRepository<out Session>

    @Test
    fun `rest api login creates session in database and allows subsequent authenticated requests`() {
        val email = "session-test-user@tasteney.com"
        val password = "StrongPassword123!"

        // Register user
        mockMvc.perform(
            post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"email":"$email","password":"$password"}""")
        ).andExpect(status().isCreated)

        // Login user
        val loginResult = mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"email":"$email","password":"$password"}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value(email))
            .andReturn()

        val sessionCookie = loginResult.response.getCookie("SESSION")
        assertNotNull(sessionCookie, "Expected SESSION cookie to be returned")

        // Verify session persists in database
        val sessionCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM SPRING_SESSION WHERE PRINCIPAL_NAME = ?",
            Int::class.java,
            email
        )
        assertNotNull(sessionCount)
        assertTrue(sessionCount!! >= 1, "Session record must exist in SPRING_SESSION table")

        // Access protected endpoint with session cookie
        mockMvc.perform(
            get("/api/v1/auth/me")
                .cookie(sessionCookie!!)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value(email))

        // Logout
        mockMvc.perform(
            post("/api/v1/auth/logout")
                .cookie(sessionCookie)
        ).andExpect(status().isNoContent)

        // Accessing protected endpoint again should fail
        mockMvc.perform(
            get("/api/v1/auth/me")
                .cookie(sessionCookie)
        ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `admin form login creates session in database and grants access to admin dashboard`() {
        val adminEmail = "admin-001@tasteney.com"
        val adminPassword = "testAdminPassword123!"

        val loginResult = mockMvc.perform(
            post("/admin/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", adminEmail)
                .param("password", adminPassword)
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/dashboard"))
            .andReturn()

        val sessionCookie = loginResult.response.getCookie("SESSION")
        assertNotNull(sessionCookie, "Expected SESSION cookie on form login")

        // Access admin dashboard with session cookie
        mockMvc.perform(
            get("/admin/dashboard")
                .cookie(sessionCookie!!)
        )
            .andExpect(status().isOk)
            .andExpect(view().name("admin/dashboard"))

        // Verify session in database
        val sessionsByPrincipal = sessionRepository.findByPrincipalName(adminEmail)
        assertTrue(sessionsByPrincipal.isNotEmpty(), "Principal sessions must be found in session repository")
    }
}
