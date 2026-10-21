package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.news.CreateNewsRequest
import biz.web4my.tasteney_be.news.NewsService
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
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@AutoConfigureMockMvc
class AdminNewsControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var newsService: NewsService

    @Test
    fun `unauthenticated access to news redirects to login`() {
        mockMvc.perform(get("/admin/news"))
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/login"))
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = ["USER"])
    fun `regular user receives 403 Forbidden for news`() {
        mockMvc.perform(get("/admin/news"))
            .andExpect(status().isForbidden)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can access news index page`() {
        mockMvc.perform(get("/admin/news"))
            .andExpect(status().isOk)
            .andExpect(view().name("admin/news/index"))
            .andExpect(content().string(containsString("News Articles")))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can access new news article form`() {
        mockMvc.perform(get("/admin/news/new"))
            .andExpect(status().isOk)
            .andExpect(view().name("admin/news/edit"))
            .andExpect(content().string(containsString("Create News Article")))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can create news article successfully`() {
        val uniqueHeadline = "Launch Announcement ${System.currentTimeMillis()}"

        mockMvc.perform(
            post("/admin/news/new")
                .with(csrf())
                .param("headline", uniqueHeadline)
                .param("text", "We are proud to introduce the new news feed feature in Tasteney.")
                .param("imagePath", "/images/news/launch.png")
                .param("link", "https://tasteney.com/news/launch")
                .param("active", "true")
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/news"))
            .andExpect(flash().attribute("newsSuccess", containsString(uniqueHeadline)))

        val newsList = newsService.findAllNews(search = uniqueHeadline)
        val created = newsList.firstOrNull { it.headline == uniqueHeadline }
        assertNotNull(created)
        assertEquals(uniqueHeadline, created.headline)
        assertEquals("We are proud to introduce the new news feed feature in Tasteney.", created.text)
        assertEquals("/images/news/launch.png", created.imagePath)
        assertEquals("https://tasteney.com/news/launch", created.link)
        assertTrue(created.active)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can edit existing news article`() {
        val initialHeadline = "Initial News ${System.currentTimeMillis()}"
        val created = newsService.createNews(
            CreateNewsRequest(
                headline = initialHeadline,
                text = "Initial content description."
            )
        )

        val updatedHeadline = "Updated News ${System.currentTimeMillis()}"

        mockMvc.perform(
            post("/admin/news/${created.id}/edit")
                .with(csrf())
                .param("headline", updatedHeadline)
                .param("text", "Updated content description text.")
                .param("imagePath", "/images/updated.jpg")
                .param("link", "https://example.com/updated")
                .param("active", "true")
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/news"))
            .andExpect(flash().attribute("newsSuccess", containsString(updatedHeadline)))

        val updated = newsService.findNewsById(created.id)
        assertNotNull(updated)
        assertEquals(updatedHeadline, updated.headline)
        assertEquals("Updated content description text.", updated.text)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can deactivate and reactivate news article`() {
        val headline = "Toggle News ${System.currentTimeMillis()}"
        val created = newsService.createNews(
            CreateNewsRequest(
                headline = headline,
                text = "Content for toggle test."
            )
        )
        assertTrue(created.active)

        // Deactivate
        mockMvc.perform(
            post("/admin/news/${created.id}/deactivate")
                .with(csrf())
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/news"))

        val deactivated = newsService.findNewsById(created.id)
        assertNotNull(deactivated)
        assertFalse(deactivated.active)

        // Reactivate
        mockMvc.perform(
            post("/admin/news/${created.id}/activate")
                .with(csrf())
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/news"))

        val reactivated = newsService.findNewsById(created.id)
        assertNotNull(reactivated)
        assertTrue(reactivated.active)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can filter news via htmx endpoint`() {
        val headline = "HTMX News ${System.currentTimeMillis()}"
        newsService.createNews(
            CreateNewsRequest(
                headline = headline,
                text = "HTMX news content."
            )
        )

        mockMvc.perform(
            get("/admin/htmx/news")
                .param("query", headline)
                .param("status", "ACTIVE")
        )
            .andExpect(status().isOk)
            .andExpect(view().name("admin/fragments/news-table"))
            .andExpect(content().string(containsString(headline)))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can toggle active status via htmx endpoint`() {
        val headline = "HTMX Toggle News ${System.currentTimeMillis()}"
        val created = newsService.createNews(
            CreateNewsRequest(
                headline = headline,
                text = "HTMX toggle content.",
                active = true
            )
        )

        mockMvc.perform(
            post("/admin/htmx/news/${created.id}/toggle-active")
                .with(csrf())
        )
            .andExpect(status().isOk)
            .andExpect(view().name("admin/fragments/news-table"))

        val afterToggle = newsService.findNewsById(created.id)
        assertNotNull(afterToggle)
        assertFalse(afterToggle.active)
    }
}
