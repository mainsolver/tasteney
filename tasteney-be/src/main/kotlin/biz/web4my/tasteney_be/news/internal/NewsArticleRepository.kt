package biz.web4my.tasteney_be.news.internal

import biz.web4my.tasteney_be.news.NewsArticleDto
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.sql.ResultSet
import java.util.UUID

@Repository
class NewsArticleRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate
) {
    fun findLatest(limit: Int = 5, activeOnly: Boolean = true): List<NewsArticleDto> {
        val activeClause = if (activeOnly) "WHERE is_active = true" else ""
        val sql = """
            SELECT id, headline, text, image_path, link, is_active, created_at, updated_at
            FROM news_articles
            $activeClause
            ORDER BY created_at DESC
            LIMIT :limit
        """.trimIndent()

        val params = MapSqlParameterSource("limit", limit)
        return jdbcTemplate.query(sql, params) { rs, _ -> mapRow(rs) }
    }

    fun findAll(search: String? = null, active: Boolean? = null): List<NewsArticleDto> {
        val conditions = mutableListOf<String>()
        val params = MapSqlParameterSource()

        if (!search.isNullOrBlank()) {
            conditions.add("(LOWER(headline) LIKE :searchPattern OR LOWER(text) LIKE :searchPattern)")
            params.addValue("searchPattern", "%${search.trim().lowercase()}%")
        }

        if (active != null) {
            conditions.add("is_active = :active")
            params.addValue("active", active)
        }

        val whereClause = if (conditions.isNotEmpty()) "WHERE " + conditions.joinToString(" AND ") else ""
        val sql = """
            SELECT id, headline, text, image_path, link, is_active, created_at, updated_at
            FROM news_articles
            $whereClause
            ORDER BY created_at DESC
        """.trimIndent()

        return jdbcTemplate.query(sql, params) { rs, _ -> mapRow(rs) }
    }

    fun findById(id: UUID): NewsArticleDto? {
        val sql = """
            SELECT id, headline, text, image_path, link, is_active, created_at, updated_at
            FROM news_articles
            WHERE id = :id
        """.trimIndent()

        val params = MapSqlParameterSource("id", id)
        return jdbcTemplate.query(sql, params) { rs, _ -> mapRow(rs) }.firstOrNull()
    }

    fun insert(article: NewsArticleDto) {
        val sql = """
            INSERT INTO news_articles (
                id, headline, text, image_path, link, is_active, created_at, updated_at
            ) VALUES (
                :id, :headline, :text, :imagePath, :link, :isActive, :createdAt, :updatedAt
            )
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("id", article.id)
            .addValue("headline", article.headline)
            .addValue("text", article.text)
            .addValue("imagePath", article.imagePath)
            .addValue("link", article.link)
            .addValue("isActive", article.active)
            .addValue("createdAt", java.sql.Timestamp.from(article.createdAt))
            .addValue("updatedAt", java.sql.Timestamp.from(article.updatedAt))

        jdbcTemplate.update(sql, params)
    }

    fun update(article: NewsArticleDto) {
        val sql = """
            UPDATE news_articles
            SET headline = :headline,
                text = :text,
                image_path = :imagePath,
                link = :link,
                is_active = :isActive,
                updated_at = :updatedAt
            WHERE id = :id
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("id", article.id)
            .addValue("headline", article.headline)
            .addValue("text", article.text)
            .addValue("imagePath", article.imagePath)
            .addValue("link", article.link)
            .addValue("isActive", article.active)
            .addValue("updatedAt", java.sql.Timestamp.from(article.updatedAt))

        jdbcTemplate.update(sql, params)
    }

    fun count(active: Boolean? = null): Long {
        val whereClause = if (active != null) "WHERE is_active = :active" else ""
        val sql = "SELECT COUNT(1) FROM news_articles $whereClause"
        val params = MapSqlParameterSource()
        if (active != null) {
            params.addValue("active", active)
        }
        return jdbcTemplate.queryForObject(sql, params, Long::class.java) ?: 0L
    }

    private fun mapRow(rs: ResultSet): NewsArticleDto {
        return NewsArticleDto(
            id = rs.getObject("id", UUID::class.java),
            headline = rs.getString("headline"),
            text = rs.getString("text"),
            imagePath = rs.getString("image_path"),
            link = rs.getString("link"),
            active = rs.getBoolean("is_active"),
            createdAt = rs.getTimestamp("created_at").toInstant(),
            updatedAt = rs.getTimestamp("updated_at").toInstant()
        )
    }
}
