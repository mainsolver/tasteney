package biz.web4my.tasteney_be.encyclopedia.internal

import biz.web4my.tasteney_be.encyclopedia.ArticleDto
import biz.web4my.tasteney_be.encyclopedia.ArticleTranslationDto
import biz.web4my.tasteney_be.encyclopedia.IngredientMetadataDto
import biz.web4my.tasteney_be.encyclopedia.LocationMetadataDto
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.sql.ResultSet
import java.time.Instant

@Repository
class EncyclopediaArticleRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate
) {
    fun findArticles(
        search: String? = null,
        category: String? = null,
        updatedSince: Instant? = null,
        active: Boolean? = null
    ): List<ArticleDto> {
        val conditions = mutableListOf<String>()
        val params = MapSqlParameterSource()

        if (!search.isNullOrBlank()) {
            conditions.add("(LOWER(title) LIKE :searchPattern OR LOWER(summary) LIKE :searchPattern OR LOWER(content) LIKE :searchPattern)")
            params.addValue("searchPattern", "%${search.trim().lowercase()}%")
        }

        if (!category.isNullOrBlank()) {
            conditions.add("category_id = :category")
            params.addValue("category", category.trim())
        }

        if (updatedSince != null) {
            conditions.add("updated_at >= :updatedSince")
            params.addValue("updatedSince", java.sql.Timestamp.from(updatedSince))
        }

        if (active != null) {
            conditions.add("is_active = :active")
            params.addValue("active", active)
        }

        val whereClause = if (conditions.isNotEmpty()) "WHERE " + conditions.joinToString(" AND ") else ""
        val sql = """
            SELECT id, category_id, article_type, title, summary, content, is_active, wikipedia_url,
                   location_region, location_country, location_latitude, location_longitude,
                   ingredient_kind, created_at, updated_at
            FROM encyclopedia_articles
            $whereClause
            ORDER BY updated_at DESC, title ASC
        """.trimIndent()

        val articles = jdbcTemplate.query(sql, params) { rs, _ -> mapArticleRow(rs) }
        if (articles.isEmpty()) {
            return emptyList()
        }

        return hydrateArticles(articles)
    }

    fun findById(id: String): ArticleDto? {
        val sql = """
            SELECT id, category_id, article_type, title, summary, content, is_active, wikipedia_url,
                   location_region, location_country, location_latitude, location_longitude,
                   ingredient_kind, created_at, updated_at
            FROM encyclopedia_articles
            WHERE id = :id
        """.trimIndent()

        val params = MapSqlParameterSource("id", id)
        val articles = jdbcTemplate.query(sql, params) { rs, _ -> mapArticleRow(rs) }
        if (articles.isEmpty()) {
            return null
        }

        return hydrateArticles(articles).firstOrNull()
    }

    fun existsById(id: String): Boolean {
        val sql = "SELECT COUNT(1) FROM encyclopedia_articles WHERE id = :id"
        val params = MapSqlParameterSource("id", id)
        val count = jdbcTemplate.queryForObject(sql, params, Long::class.java) ?: 0L
        return count > 0
    }

    fun insert(article: ArticleDto) {
        val insertArticleSql = """
            INSERT INTO encyclopedia_articles (
                id, category_id, article_type, title, summary, content, is_active, wikipedia_url,
                location_region, location_country, location_latitude, location_longitude,
                ingredient_kind, created_at, updated_at
            ) VALUES (
                :id, :categoryId, :articleType, :title, :summary, :content, :isActive, :wikipediaUrl,
                :locationRegion, :locationCountry, :locationLatitude, :locationLongitude,
                :ingredientKind, :createdAt, :updatedAt
            )
        """.trimIndent()

        val articleParams = MapSqlParameterSource()
            .addValue("id", article.id)
            .addValue("categoryId", article.category)
            .addValue("articleType", article.type)
            .addValue("title", article.title)
            .addValue("summary", article.summary)
            .addValue("content", article.content)
            .addValue("isActive", article.active)
            .addValue("wikipediaUrl", article.wikipediaUrl)
            .addValue("locationRegion", article.location?.region)
            .addValue("locationCountry", article.location?.country)
            .addValue("locationLatitude", article.location?.latitude)
            .addValue("locationLongitude", article.location?.longitude)
            .addValue("ingredientKind", article.ingredient?.kind)
            .addValue("createdAt", java.sql.Timestamp.from(article.createdAt))
            .addValue("updatedAt", java.sql.Timestamp.from(article.updatedAt))

        jdbcTemplate.update(insertArticleSql, articleParams)
        insertChildren(article)
    }

    fun update(article: ArticleDto) {
        val updateArticleSql = """
            UPDATE encyclopedia_articles SET
                category_id = :categoryId,
                article_type = :articleType,
                title = :title,
                summary = :summary,
                content = :content,
                is_active = :isActive,
                wikipedia_url = :wikipediaUrl,
                location_region = :locationRegion,
                location_country = :locationCountry,
                location_latitude = :locationLatitude,
                location_longitude = :locationLongitude,
                ingredient_kind = :ingredientKind,
                updated_at = :updatedAt
            WHERE id = :id
        """.trimIndent()

        val articleParams = MapSqlParameterSource()
            .addValue("id", article.id)
            .addValue("categoryId", article.category)
            .addValue("articleType", article.type)
            .addValue("title", article.title)
            .addValue("summary", article.summary)
            .addValue("content", article.content)
            .addValue("isActive", article.active)
            .addValue("wikipediaUrl", article.wikipediaUrl)
            .addValue("locationRegion", article.location?.region)
            .addValue("locationCountry", article.location?.country)
            .addValue("locationLatitude", article.location?.latitude)
            .addValue("locationLongitude", article.location?.longitude)
            .addValue("ingredientKind", article.ingredient?.kind)
            .addValue("updatedAt", java.sql.Timestamp.from(article.updatedAt))

        jdbcTemplate.update(updateArticleSql, articleParams)

        val deleteParams = MapSqlParameterSource("id", article.id)
        jdbcTemplate.update("DELETE FROM encyclopedia_article_translations WHERE article_id = :id", deleteParams)
        jdbcTemplate.update("DELETE FROM encyclopedia_article_tags WHERE article_id = :id", deleteParams)
        jdbcTemplate.update("DELETE FROM encyclopedia_article_related WHERE article_id = :id", deleteParams)
        jdbcTemplate.update("DELETE FROM encyclopedia_article_ingredient_aliases WHERE article_id = :id", deleteParams)

        insertChildren(article)
    }

    fun setActive(id: String, active: Boolean, updatedAt: Instant): Int {
        val sql = "UPDATE encyclopedia_articles SET is_active = :active, updated_at = :updatedAt WHERE id = :id"
        val params = MapSqlParameterSource()
            .addValue("id", id)
            .addValue("active", active)
            .addValue("updatedAt", java.sql.Timestamp.from(updatedAt))
        return jdbcTemplate.update(sql, params)
    }

    fun count(active: Boolean? = null): Long {
        return if (active == null) {
            val sql = "SELECT COUNT(1) FROM encyclopedia_articles"
            jdbcTemplate.queryForObject(sql, MapSqlParameterSource(), Long::class.java) ?: 0L
        } else {
            val sql = "SELECT COUNT(1) FROM encyclopedia_articles WHERE is_active = :active"
            jdbcTemplate.queryForObject(sql, MapSqlParameterSource("active", active), Long::class.java) ?: 0L
        }
    }

    private fun insertChildren(article: ArticleDto) {
        val insertTransSql = """
            INSERT INTO encyclopedia_article_translations (
                article_id, language_code, title, summary, content, wikipedia_url
            ) VALUES (
                :articleId, :languageCode, :title, :summary, :content, :wikipediaUrl
            )
        """.trimIndent()

        for ((lang, trans) in article.translations) {
            val transParams = MapSqlParameterSource()
                .addValue("articleId", article.id)
                .addValue("languageCode", lang)
                .addValue("title", trans.title)
                .addValue("summary", trans.summary)
                .addValue("content", trans.content)
                .addValue("wikipediaUrl", trans.wikipediaUrl)
            jdbcTemplate.update(insertTransSql, transParams)
        }

        val insertTagSql = "INSERT INTO encyclopedia_article_tags (article_id, tag) VALUES (:articleId, :tag)"
        for (tag in article.tags.distinct()) {
            if (tag.isNotBlank()) {
                val tagParams = MapSqlParameterSource()
                    .addValue("articleId", article.id)
                    .addValue("tag", tag.trim())
                jdbcTemplate.update(insertTagSql, tagParams)
            }
        }

        val insertRelatedSql = "INSERT INTO encyclopedia_article_related (article_id, related_article_id) VALUES (:articleId, :relatedArticleId)"
        for (rel in article.relatedArticleIds.distinct()) {
            if (rel.isNotBlank()) {
                val relParams = MapSqlParameterSource()
                    .addValue("articleId", article.id)
                    .addValue("relatedArticleId", rel.trim())
                jdbcTemplate.update(insertRelatedSql, relParams)
            }
        }

        val insertAliasSql = "INSERT INTO encyclopedia_article_ingredient_aliases (article_id, alias) VALUES (:articleId, :alias)"
        if (article.ingredient != null) {
            for (alias in article.ingredient.alsoKnownAs.distinct()) {
                if (alias.isNotBlank()) {
                    val aliasParams = MapSqlParameterSource()
                        .addValue("articleId", article.id)
                        .addValue("alias", alias.trim())
                    jdbcTemplate.update(insertAliasSql, aliasParams)
                }
            }
        }
    }

    private fun hydrateArticles(articles: List<EncyclopediaArticle>): List<ArticleDto> {
        val ids = articles.map { it.id }
        val idParams = MapSqlParameterSource("ids", ids)

        val translationsMap = mutableMapOf<String, MutableMap<String, ArticleTranslationDto>>()
        jdbcTemplate.query(
            "SELECT article_id, language_code, title, summary, content, wikipedia_url FROM encyclopedia_article_translations WHERE article_id IN (:ids)",
            idParams
        ) { rs ->
            val articleId = rs.getString("article_id")
            val lang = rs.getString("language_code")
            val trans = ArticleTranslationDto(
                title = rs.getString("title"),
                summary = rs.getString("summary"),
                content = rs.getString("content"),
                wikipediaUrl = rs.getString("wikipedia_url")
            )
            translationsMap.computeIfAbsent(articleId) { mutableMapOf() }[lang] = trans
        }

        val tagsMap = mutableMapOf<String, MutableList<String>>()
        jdbcTemplate.query(
            "SELECT article_id, tag FROM encyclopedia_article_tags WHERE article_id IN (:ids)",
            idParams
        ) { rs ->
            val articleId = rs.getString("article_id")
            val tag = rs.getString("tag")
            tagsMap.computeIfAbsent(articleId) { mutableListOf() }.add(tag)
        }

        val relatedMap = mutableMapOf<String, MutableList<String>>()
        jdbcTemplate.query(
            "SELECT article_id, related_article_id FROM encyclopedia_article_related WHERE article_id IN (:ids)",
            idParams
        ) { rs ->
            val articleId = rs.getString("article_id")
            val rel = rs.getString("related_article_id")
            relatedMap.computeIfAbsent(articleId) { mutableListOf() }.add(rel)
        }

        val aliasesMap = mutableMapOf<String, MutableList<String>>()
        jdbcTemplate.query(
            "SELECT article_id, alias FROM encyclopedia_article_ingredient_aliases WHERE article_id IN (:ids)",
            idParams
        ) { rs ->
            val articleId = rs.getString("article_id")
            val alias = rs.getString("alias")
            aliasesMap.computeIfAbsent(articleId) { mutableListOf() }.add(alias)
        }

        return articles.map { row ->
            val location = if (row.locationRegion != null || row.locationCountry != null || row.locationLatitude != null || row.locationLongitude != null) {
                LocationMetadataDto(
                    region = row.locationRegion ?: "",
                    country = row.locationCountry ?: "",
                    latitude = row.locationLatitude,
                    longitude = row.locationLongitude
                )
            } else null

            val ingredient = if (row.ingredientKind != null || !aliasesMap[row.id].isNullOrEmpty()) {
                IngredientMetadataDto(
                    kind = row.ingredientKind ?: "",
                    alsoKnownAs = aliasesMap[row.id] ?: emptyList()
                )
            } else null

            ArticleDto(
                id = row.id,
                title = row.title,
                category = row.categoryId,
                type = row.articleType,
                summary = row.summary,
                content = row.content,
                active = row.isActive,
                wikipediaUrl = row.wikipediaUrl,
                translations = translationsMap[row.id] ?: emptyMap(),
                tags = tagsMap[row.id] ?: emptyList(),
                relatedArticleIds = relatedMap[row.id] ?: emptyList(),
                location = location,
                ingredient = ingredient,
                createdAt = row.createdAt,
                updatedAt = row.updatedAt
            )
        }
    }

    private fun mapArticleRow(rs: ResultSet): EncyclopediaArticle {
        val latObj = rs.getObject("location_latitude")
        val lonObj = rs.getObject("location_longitude")
        return EncyclopediaArticle(
            id = rs.getString("id"),
            categoryId = rs.getString("category_id"),
            articleType = rs.getString("article_type"),
            title = rs.getString("title"),
            summary = rs.getString("summary"),
            content = rs.getString("content"),
            isActive = rs.getBoolean("is_active"),
            wikipediaUrl = rs.getString("wikipedia_url"),
            locationRegion = rs.getString("location_region"),
            locationCountry = rs.getString("location_country"),
            locationLatitude = (latObj as? Number)?.toDouble(),
            locationLongitude = (lonObj as? Number)?.toDouble(),
            ingredientKind = rs.getString("ingredient_kind"),
            createdAt = rs.getTimestamp("created_at").toInstant(),
            updatedAt = rs.getTimestamp("updated_at").toInstant()
        )
    }
}
