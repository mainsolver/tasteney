package biz.web4my.tasteney_be.admin

import biz.web4my.tasteney_be.encyclopedia.EncyclopediaService
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
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@AutoConfigureMockMvc
class AdminEncyclopediaControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var encyclopediaService: EncyclopediaService

    @Test
    fun `unauthenticated access to encyclopedia redirects to login`() {
        mockMvc.perform(get("/admin/encyclopedia"))
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/login"))
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = ["USER"])
    fun `regular user receives 403 Forbidden for encyclopedia`() {
        mockMvc.perform(get("/admin/encyclopedia"))
            .andExpect(status().isForbidden)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can access encyclopedia index page`() {
        mockMvc.perform(get("/admin/encyclopedia"))
            .andExpect(status().isOk)
            .andExpect(view().name("admin/encyclopedia/index"))
            .andExpect(content().string(containsString("Encyclopedia Articles")))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can filter articles via htmx endpoint`() {
        mockMvc.perform(
            get("/admin/htmx/encyclopedia/articles")
                .param("query", "wine")
                .param("category", "wine")
        )
            .andExpect(status().isOk)
            .andExpect(view().name("admin/fragments/article-table"))
            .andExpect(content().string(containsString("article-table-container")))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can access new article form`() {
        mockMvc.perform(get("/admin/encyclopedia/new"))
            .andExpect(status().isOk)
            .andExpect(view().name("admin/encyclopedia/edit"))
            .andExpect(content().string(containsString("Create Article")))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can create new article successfully`() {
        val uniqueTitle = "Test Syrah Variety ${System.currentTimeMillis()}"

        mockMvc.perform(
            post("/admin/encyclopedia/new")
                .with(csrf())
                .param("title", uniqueTitle)
                .param("category", "wine")
                .param("type", "grape")
                .param("summary", "A dark-skinned red grape variety")
                .param("content", "Syrah is widely grown across the world to produce medium to full-bodied red wines.")
                .param("tags", "red-wine, full-bodied, syrah")
                .param("locationRegion", "Rhone Valley")
                .param("locationCountry", "France")
                .param("deTitle", "Syrah Rebsorte")
                .param("deSummary", "Eine dunkle Rotweinsorte")
                .param("deContent", "Syrah ist eine weltweit verbreitete Rebsorte.")
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/encyclopedia"))
            .andExpect(flash().attribute("articleSuccess", containsString(uniqueTitle)))

        val articles = encyclopediaService.findArticles(search = uniqueTitle)
        val created = articles.firstOrNull { it.title == uniqueTitle }
        assertNotNull(created)
        assertEquals("wine", created.category)
        assertEquals("France", created.location?.country)
        assertEquals("Syrah Rebsorte", created.translations["de"]?.title)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can access and update existing article`() {
        val uniqueTitle = "Article To Edit ${System.currentTimeMillis()}"
        val created = encyclopediaService.createArticle(
            biz.web4my.tasteney_be.encyclopedia.CreateArticleRequest(
                category = "wine",
                title = uniqueTitle,
                summary = "Initial summary",
                content = "Initial content"
            )
        )

        mockMvc.perform(get("/admin/encyclopedia/${created.id}/edit"))
            .andExpect(status().isOk)
            .andExpect(view().name("admin/encyclopedia/edit"))
            .andExpect(content().string(containsString(uniqueTitle)))

        val updatedTitle = "$uniqueTitle (Updated)"
        mockMvc.perform(
            post("/admin/encyclopedia/${created.id}/edit")
                .with(csrf())
                .param("title", updatedTitle)
                .param("category", "wine")
                .param("type", "grape")
                .param("summary", "Updated summary text")
                .param("content", "Updated content body text.")
                .param("tags", "updated, test")
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/admin/encyclopedia"))
            .andExpect(flash().attribute("articleSuccess", containsString(updatedTitle)))

        val updated = encyclopediaService.findArticleById(created.id)
        assertNotNull(updated)
        assertEquals(updatedTitle, updated.title)
        assertEquals("Updated summary text", updated.summary)
        assertTrue(updated.updatedAt.isAfter(created.createdAt) || updated.updatedAt == created.createdAt)
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can filter articles by status via htmx endpoint`() {
        val uniqueActiveTitle = "Active Item ${System.currentTimeMillis()}"
        val uniqueInactiveTitle = "Inactive Item ${System.currentTimeMillis()}"

        val activeArticle = encyclopediaService.createArticle(
            biz.web4my.tasteney_be.encyclopedia.CreateArticleRequest(
                category = "wine",
                title = uniqueActiveTitle,
                summary = "Active summary",
                content = "Active content",
                active = true
            )
        )

        val inactiveArticle = encyclopediaService.createArticle(
            biz.web4my.tasteney_be.encyclopedia.CreateArticleRequest(
                category = "wine",
                title = uniqueInactiveTitle,
                summary = "Inactive summary",
                content = "Inactive content",
                active = false
            )
        )

        mockMvc.perform(
            get("/admin/htmx/encyclopedia/articles")
                .param("status", "ACTIVE")
                .param("query", uniqueActiveTitle)
        )
            .andExpect(status().isOk)
            .andExpect(content().string(containsString(uniqueActiveTitle)))
            .andExpect(content().string(containsString("Active")))

        mockMvc.perform(
            get("/admin/htmx/encyclopedia/articles")
                .param("status", "INACTIVE")
                .param("query", uniqueInactiveTitle)
        )
            .andExpect(status().isOk)
            .andExpect(content().string(containsString(uniqueInactiveTitle)))
            .andExpect(content().string(containsString("Inactive")))
    }

    @Test
    @WithMockUser(username = "admin-001@tasteney.com", roles = ["ADMIN"])
    fun `admin user can toggle article active status via htmx endpoint`() {
        val uniqueTitle = "Toggle Test Article ${System.currentTimeMillis()}"
        val created = encyclopediaService.createArticle(
            biz.web4my.tasteney_be.encyclopedia.CreateArticleRequest(
                category = "wine",
                title = uniqueTitle,
                summary = "Summary",
                content = "Content",
                active = true
            )
        )
        assertTrue(created.active)

        mockMvc.perform(
            post("/admin/htmx/encyclopedia/articles/${created.id}/toggle-active")
                .with(csrf())
                .param("query", uniqueTitle)
        )
            .andExpect(status().isOk)
            .andExpect(view().name("admin/fragments/article-table"))
            .andExpect(content().string(containsString("Inactive")))

        val deactivated = encyclopediaService.findArticleById(created.id)
        assertNotNull(deactivated)
        assertEquals(false, deactivated.active)

        mockMvc.perform(
            post("/admin/htmx/encyclopedia/articles/${created.id}/toggle-active")
                .with(csrf())
                .param("query", uniqueTitle)
        )
            .andExpect(status().isOk)
            .andExpect(view().name("admin/fragments/article-table"))
            .andExpect(content().string(containsString("Active")))

        val reactivated = encyclopediaService.findArticleById(created.id)
        assertNotNull(reactivated)
        assertEquals(true, reactivated.active)
    }
}
