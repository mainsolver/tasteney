package biz.web4my.tasteney_be.news

import biz.web4my.tasteney_be.news.internal.NewsRestController
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.http.HttpStatus
import java.time.Instant
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNull

class NewsRestControllerTest {

    private val newsService: NewsService = mock(NewsService::class.java)
    private lateinit var controller: NewsRestController

    @BeforeEach
    fun setUp() {
        controller = NewsRestController(newsService)
    }

    @Test
    fun `getLatestNews returns latest active news articles`() {
        val newsList = listOf(
            NewsArticleDto(
                id = UUID.randomUUID(),
                headline = "Headline 1",
                text = "Text 1",
                active = true,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            ),
            NewsArticleDto(
                id = UUID.randomUUID(),
                headline = "Headline 2",
                text = "Text 2",
                active = true,
                createdAt = Instant.now().minusSeconds(100),
                updatedAt = Instant.now().minusSeconds(100)
            )
        )
        `when`(newsService.getLatestNews(5)).thenReturn(newsList)

        val response = controller.getLatestNews(5)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(newsList, response.body)
        verify(newsService).getLatestNews(5)
    }

    @Test
    fun `getNews endpoint returns news list`() {
        val newsList = listOf(
            NewsArticleDto(
                id = UUID.randomUUID(),
                headline = "Headline 1",
                text = "Text 1",
                active = true,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )
        )
        `when`(newsService.getLatestNews(3)).thenReturn(newsList)

        val response = controller.getNews(3)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(newsList, response.body)
        verify(newsService).getLatestNews(3)
    }

    @Test
    fun `getNewsById returns article when found and active`() {
        val newsId = UUID.randomUUID()
        val news = NewsArticleDto(
            id = newsId,
            headline = "Single News",
            text = "Details",
            active = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        `when`(newsService.findNewsById(newsId)).thenReturn(news)

        val response = controller.getNewsById(newsId)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(news, response.body)
    }

    @Test
    fun `getNewsById returns 404 when article is inactive`() {
        val newsId = UUID.randomUUID()
        val inactiveNews = NewsArticleDto(
            id = newsId,
            headline = "Inactive News",
            text = "Details",
            active = false,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        `when`(newsService.findNewsById(newsId)).thenReturn(inactiveNews)

        val response = controller.getNewsById(newsId)

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertNull(response.body)
    }

    @Test
    fun `getNewsById returns 404 when not found`() {
        val newsId = UUID.randomUUID()
        `when`(newsService.findNewsById(newsId)).thenReturn(null)

        val response = controller.getNewsById(newsId)

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertNull(response.body)
    }
}
