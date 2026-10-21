package biz.web4my.tasteney_be.encyclopedia

import biz.web4my.tasteney_be.encyclopedia.internal.EncyclopediaRestController
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.http.HttpStatus
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNull

class EncyclopediaRestControllerTest {

    private val encyclopediaService: EncyclopediaService = mock(EncyclopediaService::class.java)
    private lateinit var controller: EncyclopediaRestController

    @BeforeEach
    fun setUp() {
        controller = EncyclopediaRestController(encyclopediaService)
    }

    @Test
    fun `getCategories returns list of category DTOs with 200 OK`() {
        val categories = listOf(
            CategoryDto(id = "wine", name = "Wine", icon = "🍷", archetype = "Wine"),
            CategoryDto(id = "beer", name = "Beer", icon = "🍺", archetype = "Beer")
        )
        `when`(encyclopediaService.findAllCategories()).thenReturn(categories)

        val response = controller.getCategories()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(categories, response.body)
    }

    @Test
    fun `getArticles without since parameter returns all articles`() {
        val articles = listOf(
            ArticleDto(
                id = "wine-cabernet-sauvignon",
                title = "Cabernet Sauvignon",
                category = "wine",
                type = "general",
                summary = "Red wine grape",
                content = "Full-bodied red wine",
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )
        )
        `when`(encyclopediaService.findArticles(null, null, null)).thenReturn(articles)

        val response = controller.getArticles(null, null, null, null)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(articles, response.body)
        verify(encyclopediaService).findArticles(null, null, null)
    }

    @Test
    fun `getArticles with since parameter passes timestamp to service and includes inactive articles`() {
        val since = Instant.parse("2026-10-01T00:00:00Z")
        val articles = listOf(
            ArticleDto(
                id = "wine-merlot",
                title = "Merlot",
                category = "wine",
                type = "general",
                summary = "Soft red wine",
                content = "Merlot grape",
                active = true,
                createdAt = since,
                updatedAt = since
            ),
            ArticleDto(
                id = "wine-old-grape",
                title = "Old Grape",
                category = "wine",
                type = "general",
                summary = "Discontinued wine",
                content = "Old content",
                active = false,
                createdAt = since.minusSeconds(3600),
                updatedAt = since
            )
        )
        `when`(encyclopediaService.findArticles(null, null, since, null)).thenReturn(articles)

        val response = controller.getArticles(since, null, null, null)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(articles, response.body)
        assertEquals(false, response.body!![1].active)
        verify(encyclopediaService).findArticles(null, null, since, null)
    }

    @Test
    fun `getArticleById returns article when found`() {
        val article = ArticleDto(
            id = "wine-pinot-noir",
            title = "Pinot Noir",
            category = "wine",
            type = "general",
            summary = "Red wine",
            content = "Pinot Noir details",
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        `when`(encyclopediaService.findArticleById("wine-pinot-noir")).thenReturn(article)

        val response = controller.getArticleById("wine-pinot-noir")

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(article, response.body)
    }

    @Test
    fun `getArticleById returns 404 when article not found`() {
        `when`(encyclopediaService.findArticleById("non-existent")).thenReturn(null)

        val response = controller.getArticleById("non-existent")

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertNull(response.body)
    }
}
