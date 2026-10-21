package biz.web4my.tasteney_be.news

import biz.web4my.tasteney_be.news.internal.NewsArticleRepository
import biz.web4my.tasteney_be.news.internal.NewsServiceImpl
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class NewsServiceTest {

    private val newsArticleRepository: NewsArticleRepository = mock(NewsArticleRepository::class.java)
    private lateinit var service: NewsServiceImpl

    private val dummyNews = NewsArticleDto(
        id = UUID.randomUUID(),
        headline = "",
        text = "",
        active = true,
        createdAt = Instant.EPOCH,
        updatedAt = Instant.EPOCH
    )

    private fun <T> capture(argumentCaptor: ArgumentCaptor<T>, dummy: T): T {
        argumentCaptor.capture()
        return dummy
    }

    @BeforeEach
    fun setUp() {
        service = NewsServiceImpl(newsArticleRepository)
    }

    @Test
    fun `getLatestNews delegates to repository with limit`() {
        val newsList = listOf(
            NewsArticleDto(
                id = UUID.randomUUID(),
                headline = "News 1",
                text = "Text 1",
                active = true,
                createdAt = Instant.now(),
                updatedAt = Instant.now()
            )
        )
        `when`(newsArticleRepository.findLatest(5, true)).thenReturn(newsList)

        val result = service.getLatestNews(5)

        assertEquals(1, result.size)
        assertEquals("News 1", result[0].headline)
        verify(newsArticleRepository).findLatest(5, true)
    }

    @Test
    fun `getLatestNews defaults limit to 5 when non-positive`() {
        `when`(newsArticleRepository.findLatest(5, true)).thenReturn(emptyList())

        val result = service.getLatestNews(0)

        assertEquals(0, result.size)
        verify(newsArticleRepository).findLatest(5, true)
    }

    @Test
    fun `createNews generates UUID, timestamps, and persists article`() {
        val request = CreateNewsRequest(
            headline = "New Version 2.0",
            text = "Exciting updates are coming to the Tasteney platform.",
            imagePath = "/images/v2.png",
            link = "https://tasteney.com/v2",
            active = true
        )

        val result = service.createNews(request)

        val captor = ArgumentCaptor.forClass(NewsArticleDto::class.java)
        verify(newsArticleRepository).insert(capture(captor, dummyNews))

        val saved = captor.value
        assertNotNull(saved.id)
        assertEquals("New Version 2.0", saved.headline)
        assertEquals("Exciting updates are coming to the Tasteney platform.", saved.text)
        assertEquals("/images/v2.png", saved.imagePath)
        assertEquals("https://tasteney.com/v2", saved.link)
        assertTrue(saved.active)
        assertNotNull(saved.createdAt)
        assertEquals(saved.createdAt, saved.updatedAt)
        assertEquals(saved.id, result.id)
    }

    @Test
    fun `createNews throws exception when headline is blank`() {
        val request = CreateNewsRequest(
            headline = "   ",
            text = "Valid text"
        )

        val exception = assertFailsWith<ResponseStatusException> {
            service.createNews(request)
        }
        assertTrue(exception.reason?.contains("Headline cannot be blank") == true)
    }

    @Test
    fun `createNews throws exception when text is blank`() {
        val request = CreateNewsRequest(
            headline = "Valid headline",
            text = "   "
        )

        val exception = assertFailsWith<ResponseStatusException> {
            service.createNews(request)
        }
        assertTrue(exception.reason?.contains("Text cannot be blank") == true)
    }

    @Test
    fun `createNews throws exception when text exceeds 1000 characters`() {
        val longText = "a".repeat(1001)
        val request = CreateNewsRequest(
            headline = "Valid headline",
            text = longText
        )

        val exception = assertFailsWith<ResponseStatusException> {
            service.createNews(request)
        }
        assertTrue(exception.reason?.contains("cannot exceed 1000 characters") == true)
    }

    @Test
    fun `updateNews updates existing news article and updatedAt timestamp`() {
        val newsId = UUID.randomUUID()
        val originalCreatedAt = Instant.now().minusSeconds(3600)
        val existing = NewsArticleDto(
            id = newsId,
            headline = "Old Headline",
            text = "Old Text",
            imagePath = null,
            link = null,
            active = true,
            createdAt = originalCreatedAt,
            updatedAt = originalCreatedAt
        )
        `when`(newsArticleRepository.findById(newsId)).thenReturn(existing)

        val request = UpdateNewsRequest(
            headline = "Updated Headline",
            text = "Updated news description text.",
            imagePath = "/images/updated.jpg",
            link = "https://example.com/updated",
            active = true
        )

        val result = service.updateNews(newsId, request)

        val captor = ArgumentCaptor.forClass(NewsArticleDto::class.java)
        verify(newsArticleRepository).update(capture(captor, dummyNews))

        val updated = captor.value
        assertEquals(newsId, updated.id)
        assertEquals("Updated Headline", updated.headline)
        assertEquals("Updated news description text.", updated.text)
        assertEquals("/images/updated.jpg", updated.imagePath)
        assertEquals("https://example.com/updated", updated.link)
        assertEquals(originalCreatedAt, updated.createdAt)
        assertTrue(updated.updatedAt.isAfter(originalCreatedAt))
        assertEquals(updated.headline, result.headline)
    }

    @Test
    fun `updateNews throws exception when news not found`() {
        val newsId = UUID.randomUUID()
        `when`(newsArticleRepository.findById(newsId)).thenReturn(null)

        val request = UpdateNewsRequest(
            headline = "Headline",
            text = "Text"
        )

        assertFailsWith<ResponseStatusException> {
            service.updateNews(newsId, request)
        }
    }

    @Test
    fun `deactivateNews sets active to false`() {
        val newsId = UUID.randomUUID()
        val existing = NewsArticleDto(
            id = newsId,
            headline = "Headline",
            text = "Text",
            active = true,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        `when`(newsArticleRepository.findById(newsId)).thenReturn(existing)

        val result = service.deactivateNews(newsId)

        val captor = ArgumentCaptor.forClass(NewsArticleDto::class.java)
        verify(newsArticleRepository).update(capture(captor, dummyNews))

        assertFalse(captor.value.active)
        assertFalse(result.active)
    }

    @Test
    fun `activateNews sets active to true`() {
        val newsId = UUID.randomUUID()
        val existing = NewsArticleDto(
            id = newsId,
            headline = "Headline",
            text = "Text",
            active = false,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        `when`(newsArticleRepository.findById(newsId)).thenReturn(existing)

        val result = service.activateNews(newsId)

        val captor = ArgumentCaptor.forClass(NewsArticleDto::class.java)
        verify(newsArticleRepository).update(capture(captor, dummyNews))

        assertTrue(captor.value.active)
        assertTrue(result.active)
    }

    @Test
    fun `countNews delegates to repository`() {
        `when`(newsArticleRepository.count(null)).thenReturn(10L)
        `when`(newsArticleRepository.count(true)).thenReturn(8L)

        assertEquals(10L, service.countNews())
        assertEquals(8L, service.countNews(active = true))
    }
}
