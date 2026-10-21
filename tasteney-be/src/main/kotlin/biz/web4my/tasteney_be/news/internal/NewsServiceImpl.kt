package biz.web4my.tasteney_be.news.internal

import biz.web4my.tasteney_be.news.CreateNewsRequest
import biz.web4my.tasteney_be.news.NewsArticleDto
import biz.web4my.tasteney_be.news.NewsService
import biz.web4my.tasteney_be.news.UpdateNewsRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class NewsServiceImpl(
    private val newsArticleRepository: NewsArticleRepository
) : NewsService {

    override fun getLatestNews(limit: Int): List<NewsArticleDto> {
        val effectiveLimit = if (limit <= 0) 5 else limit
        return newsArticleRepository.findLatest(limit = effectiveLimit, activeOnly = true)
    }

    override fun findAllNews(search: String?, active: Boolean?): List<NewsArticleDto> {
        return newsArticleRepository.findAll(search = search, active = active)
    }

    override fun findNewsById(id: UUID): NewsArticleDto? {
        return newsArticleRepository.findById(id)
    }

    @Transactional
    override fun createNews(request: CreateNewsRequest): NewsArticleDto {
        if (request.headline.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Headline cannot be blank")
        }
        if (request.text.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Text cannot be blank")
        }
        if (request.text.length > 1000) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Text cannot exceed 1000 characters")
        }

        val now = Instant.now()
        val dto = NewsArticleDto(
            id = UUID.randomUUID(),
            headline = request.headline.trim(),
            text = request.text.trim(),
            imagePath = request.imagePath?.trim()?.ifBlank { null },
            link = request.link?.trim()?.ifBlank { null },
            active = request.active,
            createdAt = now,
            updatedAt = now
        )

        newsArticleRepository.insert(dto)
        return dto
    }

    @Transactional
    override fun updateNews(id: UUID, request: UpdateNewsRequest): NewsArticleDto {
        val existing = newsArticleRepository.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "News article not found")

        if (request.headline.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Headline cannot be blank")
        }
        if (request.text.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Text cannot be blank")
        }
        if (request.text.length > 1000) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Text cannot exceed 1000 characters")
        }

        val updated = existing.copy(
            headline = request.headline.trim(),
            text = request.text.trim(),
            imagePath = request.imagePath?.trim()?.ifBlank { null },
            link = request.link?.trim()?.ifBlank { null },
            active = request.active ?: existing.active,
            updatedAt = Instant.now()
        )

        newsArticleRepository.update(updated)
        return updated
    }

    @Transactional
    override fun deactivateNews(id: UUID): NewsArticleDto {
        val existing = newsArticleRepository.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "News article not found")

        val updated = existing.copy(
            active = false,
            updatedAt = Instant.now()
        )
        newsArticleRepository.update(updated)
        return updated
    }

    @Transactional
    override fun activateNews(id: UUID): NewsArticleDto {
        val existing = newsArticleRepository.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "News article not found")

        val updated = existing.copy(
            active = true,
            updatedAt = Instant.now()
        )
        newsArticleRepository.update(updated)
        return updated
    }

    override fun countNews(active: Boolean?): Long {
        return newsArticleRepository.count(active = active)
    }
}
