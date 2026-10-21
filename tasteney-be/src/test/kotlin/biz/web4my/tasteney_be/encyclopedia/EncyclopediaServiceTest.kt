package biz.web4my.tasteney_be.encyclopedia

import biz.web4my.tasteney_be.encyclopedia.internal.EncyclopediaArticleRepository
import biz.web4my.tasteney_be.encyclopedia.internal.EncyclopediaCategory
import biz.web4my.tasteney_be.encyclopedia.internal.EncyclopediaCategoryRepository
import biz.web4my.tasteney_be.encyclopedia.internal.EncyclopediaServiceImpl
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class EncyclopediaServiceTest {

    private val categoryRepository: EncyclopediaCategoryRepository = mock(EncyclopediaCategoryRepository::class.java)
    private val articleRepository: EncyclopediaArticleRepository = mock(EncyclopediaArticleRepository::class.java)
    private lateinit var service: EncyclopediaServiceImpl

    private val dummyArticle = ArticleDto(
        id = "",
        category = "",
        type = "",
        title = "",
        summary = "",
        content = "",
        createdAt = Instant.EPOCH,
        updatedAt = Instant.EPOCH
    )

    private fun <T> capture(argumentCaptor: ArgumentCaptor<T>, dummy: T): T {
        argumentCaptor.capture()
        return dummy
    }

    private fun <T> eq(value: T): T {
        org.mockito.Mockito.eq(value)
        return value
    }

    @BeforeEach
    fun setUp() {
        service = EncyclopediaServiceImpl(categoryRepository, articleRepository)
    }

    @Test
    fun `findAllCategories returns mapped category DTOs`() {
        val categories = listOf(
            EncyclopediaCategory(id = "wine", name = "Wine", icon = "🍷", archetype = "Wine"),
            EncyclopediaCategory(id = "beer", name = "Beer", icon = "🍺", archetype = "Beer")
        )
        `when`(categoryRepository.findAll()).thenReturn(categories)

        val result = service.findAllCategories()

        assertEquals(2, result.size)
        assertEquals("wine", result[0].id)
        assertEquals("Wine", result[0].name)
        assertEquals("🍷", result[0].icon)
    }

    @Test
    fun `createArticle saves new article with generated id and timestamps`() {
        `when`(categoryRepository.existsById("wine")).thenReturn(true)
        `when`(articleRepository.existsById("wine-cabernet-sauvignon")).thenReturn(false)

        val request = CreateArticleRequest(
            category = "wine",
            title = "Cabernet Sauvignon",
            summary = "Full-bodied red wine grape",
            content = "Cabernet Sauvignon is one of the world's most widely recognized red wine grape varieties.",
            tags = listOf("red-wine", "tannic"),
            translations = mapOf(
                "de" to ArticleTranslationDto(
                    title = "Cabernet Sauvignon",
                    summary = "Voller Rotwein",
                    content = "Deutscher Inhalt"
                )
            )
        )

        val result = service.createArticle(request)

        val captor = ArgumentCaptor.forClass(ArticleDto::class.java)
        verify(articleRepository).insert(capture(captor, dummyArticle))

        val saved = captor.value
        assertEquals("wine-cabernet-sauvignon", saved.id)
        assertEquals("wine", saved.category)
        assertEquals("Cabernet Sauvignon", saved.title)
        assertEquals(listOf("red-wine", "tannic"), saved.tags)
        assertEquals("Deutscher Inhalt", saved.translations["de"]?.content)
        assertNotNull(saved.createdAt)
        assertEquals(saved.createdAt, saved.updatedAt)
        assertEquals(saved.id, result.id)
    }

    @Test
    fun `createArticle throws exception when category does not exist`() {
        `when`(categoryRepository.existsById("non-existent")).thenReturn(false)

        val request = CreateArticleRequest(
            category = "non-existent",
            title = "Test Drink",
            summary = "Summary",
            content = "Content"
        )

        val ex = assertFailsWith<IllegalArgumentException> {
            service.createArticle(request)
        }
        assertTrue(ex.message!!.contains("Category does not exist"))
    }

    @Test
    fun `updateArticle updates content and advances updatedAt timestamp`() {
        val existingCreated = Instant.now().minusSeconds(3600)
        val existingUpdated = Instant.now().minusSeconds(1800)
        val existingArticle = ArticleDto(
            id = "wine-pinot-noir",
            category = "wine",
            type = "general",
            title = "Pinot Noir",
            summary = "Old summary",
            content = "Old content",
            createdAt = existingCreated,
            updatedAt = existingUpdated
        )

        `when`(articleRepository.findById("wine-pinot-noir")).thenReturn(existingArticle)
        `when`(categoryRepository.existsById("wine")).thenReturn(true)

        val updateRequest = UpdateArticleRequest(
            category = "wine",
            title = "Pinot Noir Updated",
            summary = "Updated summary",
            content = "Updated content",
            tags = listOf("red", "burgundy")
        )

        val result = service.updateArticle("wine-pinot-noir", updateRequest)

        val captor = ArgumentCaptor.forClass(ArticleDto::class.java)
        verify(articleRepository).update(capture(captor, dummyArticle))

        val saved = captor.value
        assertEquals("wine-pinot-noir", saved.id)
        assertEquals("Pinot Noir Updated", saved.title)
        assertEquals("Updated summary", saved.summary)
        assertEquals(listOf("red", "burgundy"), saved.tags)
        assertEquals(existingCreated, saved.createdAt)
        assertTrue(saved.updatedAt.isAfter(existingUpdated))
        assertEquals(saved.updatedAt, result.updatedAt)
    }

    @Test
    fun `updateArticle throws exception when article not found`() {
        `when`(articleRepository.findById("non-existent")).thenReturn(null)

        val updateRequest = UpdateArticleRequest(
            category = "wine",
            title = "Pinot Noir",
            summary = "Summary",
            content = "Content"
        )

        val ex = assertFailsWith<IllegalArgumentException> {
            service.updateArticle("non-existent", updateRequest)
        }
        assertTrue(ex.message!!.contains("Article not found"))
    }

    @Test
    fun `deactivateArticle sets active to false and advances updatedAt`() {
        val existingCreated = Instant.now().minusSeconds(3600)
        val existingUpdated = Instant.now().minusSeconds(1800)
        val existingArticle = ArticleDto(
            id = "wine-pinot-noir",
            category = "wine",
            type = "general",
            title = "Pinot Noir",
            summary = "Old summary",
            content = "Old content",
            active = true,
            createdAt = existingCreated,
            updatedAt = existingUpdated
        )

        `when`(articleRepository.findById("wine-pinot-noir")).thenReturn(existingArticle)

        val result = service.deactivateArticle("wine-pinot-noir")

        val timeCaptor = ArgumentCaptor.forClass(Instant::class.java)
        verify(articleRepository).setActive(
            eq("wine-pinot-noir"),
            eq(false),
            capture(timeCaptor, Instant.EPOCH)
        )

        assertEquals(false, result.active)
        assertTrue(result.updatedAt.isAfter(existingUpdated))
        assertEquals(timeCaptor.value, result.updatedAt)
    }

    @Test
    fun `activateArticle sets active to true and advances updatedAt`() {
        val existingCreated = Instant.now().minusSeconds(3600)
        val existingUpdated = Instant.now().minusSeconds(1800)
        val existingArticle = ArticleDto(
            id = "wine-pinot-noir",
            category = "wine",
            type = "general",
            title = "Pinot Noir",
            summary = "Old summary",
            content = "Old content",
            active = false,
            createdAt = existingCreated,
            updatedAt = existingUpdated
        )

        `when`(articleRepository.findById("wine-pinot-noir")).thenReturn(existingArticle)

        val result = service.activateArticle("wine-pinot-noir")

        val timeCaptor = ArgumentCaptor.forClass(Instant::class.java)
        verify(articleRepository).setActive(
            eq("wine-pinot-noir"),
            eq(true),
            capture(timeCaptor, Instant.EPOCH)
        )

        assertEquals(true, result.active)
        assertTrue(result.updatedAt.isAfter(existingUpdated))
        assertEquals(timeCaptor.value, result.updatedAt)
    }

    @Test
    fun `findArticles delegates filter parameters including active status`() {
        val since = Instant.now().minusSeconds(60)
        val articles = listOf(
            dummyArticle.copy(id = "a1", active = true),
            dummyArticle.copy(id = "a2", active = false)
        )
        `when`(articleRepository.findArticles("cabernet", "wine", since, true)).thenReturn(listOf(articles[0]))

        val result = service.findArticles(search = "cabernet", category = "wine", updatedSince = since, active = true)

        assertEquals(1, result.size)
        assertEquals("a1", result[0].id)
        verify(articleRepository).findArticles("cabernet", "wine", since, true)
    }

    @Test
    fun `countArticles delegates active filter to repository`() {
        `when`(articleRepository.count(true)).thenReturn(42L)
        `when`(articleRepository.count(false)).thenReturn(5L)
        `when`(articleRepository.count(null)).thenReturn(47L)

        assertEquals(42L, service.countArticles(true))
        assertEquals(5L, service.countArticles(false))
        assertEquals(47L, service.countArticles(null))
    }
}
