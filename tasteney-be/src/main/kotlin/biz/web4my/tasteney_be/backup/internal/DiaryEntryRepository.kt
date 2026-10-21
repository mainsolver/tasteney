package biz.web4my.tasteney_be.backup.internal

import biz.web4my.tasteney_be.backup.DiaryEntryDto
import biz.web4my.tasteney_be.backup.SensoryDescriptorDto
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import tools.jackson.core.type.TypeReference
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.sql.ResultSet
import java.time.Instant
import java.util.UUID

@Repository
class DiaryEntryRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate
) {
    private val objectMapper = jacksonObjectMapper()

    fun findByUserId(userId: UUID): List<DiaryEntryDto> {
        val sql = """
            SELECT id, user_id, name, manufacturer, country, city, rating, notes,
                   images, archetype, subtype, sensory_descriptors, created_at, updated_at
            FROM diary_entries
            WHERE user_id = :userId
            ORDER BY created_at DESC
        """.trimIndent()

        val params = MapSqlParameterSource("userId", userId)
        return jdbcTemplate.query(sql, params) { rs, _ -> mapRow(rs) }
    }

    fun findByIdAndUserId(id: UUID, userId: UUID): DiaryEntryDto? {
        val sql = """
            SELECT id, user_id, name, manufacturer, country, city, rating, notes,
                   images, archetype, subtype, sensory_descriptors, created_at, updated_at
            FROM diary_entries
            WHERE id = :id AND user_id = :userId
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("id", id)
            .addValue("userId", userId)

        return jdbcTemplate.query(sql, params) { rs, _ -> mapRow(rs) }.firstOrNull()
    }

    fun upsert(entry: DiaryEntryDto): DiaryEntryDto {
        val existing = findByIdAndUserId(entry.id, entry.userId)
        val now = Instant.now()

        val imagesJson = objectMapper.writeValueAsString(entry.images)
        val sensoryJson = objectMapper.writeValueAsString(entry.sensoryDescriptors)

        if (existing == null) {
            val sql = """
                INSERT INTO diary_entries (
                    id, user_id, name, manufacturer, country, city, rating, notes,
                    images, archetype, subtype, sensory_descriptors, created_at, updated_at
                ) VALUES (
                    :id, :userId, :name, :manufacturer, :country, :city, :rating, :notes,
                    :images, :archetype, :subtype, :sensoryDescriptors, :createdAt, :updatedAt
                )
            """.trimIndent()

            val params = MapSqlParameterSource()
                .addValue("id", entry.id)
                .addValue("userId", entry.userId)
                .addValue("name", entry.name)
                .addValue("manufacturer", entry.manufacturer)
                .addValue("country", entry.country)
                .addValue("city", entry.city)
                .addValue("rating", entry.rating)
                .addValue("notes", entry.notes)
                .addValue("images", imagesJson)
                .addValue("archetype", entry.archetype)
                .addValue("subtype", entry.subtype)
                .addValue("sensoryDescriptors", sensoryJson)
                .addValue("createdAt", java.sql.Timestamp.from(entry.createdAt))
                .addValue("updatedAt", java.sql.Timestamp.from(entry.updatedAt))

            jdbcTemplate.update(sql, params)
            return entry
        } else {
            val sql = """
                UPDATE diary_entries
                SET name = :name,
                    manufacturer = :manufacturer,
                    country = :country,
                    city = :city,
                    rating = :rating,
                    notes = :notes,
                    images = :images,
                    archetype = :archetype,
                    subtype = :subtype,
                    sensory_descriptors = :sensoryDescriptors,
                    updated_at = :updatedAt
                WHERE id = :id AND user_id = :userId
            """.trimIndent()

            val updatedEntry = entry.copy(
                createdAt = existing.createdAt,
                updatedAt = now
            )

            val params = MapSqlParameterSource()
                .addValue("id", updatedEntry.id)
                .addValue("userId", updatedEntry.userId)
                .addValue("name", updatedEntry.name)
                .addValue("manufacturer", updatedEntry.manufacturer)
                .addValue("country", updatedEntry.country)
                .addValue("city", updatedEntry.city)
                .addValue("rating", updatedEntry.rating)
                .addValue("notes", updatedEntry.notes)
                .addValue("images", imagesJson)
                .addValue("archetype", updatedEntry.archetype)
                .addValue("subtype", updatedEntry.subtype)
                .addValue("sensoryDescriptors", sensoryJson)
                .addValue("updatedAt", java.sql.Timestamp.from(updatedEntry.updatedAt))

            jdbcTemplate.update(sql, params)
            return updatedEntry
        }
    }

    fun deleteByIdAndUserId(id: UUID, userId: UUID): Boolean {
        val sql = "DELETE FROM diary_entries WHERE id = :id AND user_id = :userId"
        val params = MapSqlParameterSource()
            .addValue("id", id)
            .addValue("userId", userId)
        return jdbcTemplate.update(sql, params) > 0
    }

    fun deleteByIdsAndUserId(ids: List<UUID>, userId: UUID): List<UUID> {
        if (ids.isEmpty()) return emptyList()

        val selectSql = "SELECT id FROM diary_entries WHERE id IN (:ids) AND user_id = :userId"
        val selectParams = MapSqlParameterSource()
            .addValue("ids", ids)
            .addValue("userId", userId)

        val foundIds = jdbcTemplate.query(selectSql, selectParams) { rs, _ ->
            rs.getObject("id", UUID::class.java)
        }

        if (foundIds.isNotEmpty()) {
            val deleteSql = "DELETE FROM diary_entries WHERE id IN (:ids) AND user_id = :userId"
            val deleteParams = MapSqlParameterSource()
                .addValue("ids", foundIds)
                .addValue("userId", userId)
            jdbcTemplate.update(deleteSql, deleteParams)
        }

        return foundIds
    }

    private fun mapRow(rs: ResultSet): DiaryEntryDto {
        val imagesJson = rs.getString("images") ?: "[]"
        val sensoryJson = rs.getString("sensory_descriptors") ?: "[]"

        val images: List<String> = try {
            objectMapper.readValue(imagesJson, object : TypeReference<List<String>>() {})
        } catch (_: Exception) {
            emptyList()
        }

        val sensoryDescriptors: List<SensoryDescriptorDto> = try {
            objectMapper.readValue(sensoryJson, object : TypeReference<List<SensoryDescriptorDto>>() {})
        } catch (_: Exception) {
            emptyList()
        }

        return DiaryEntryDto(
            id = rs.getObject("id", UUID::class.java),
            userId = rs.getObject("user_id", UUID::class.java),
            name = rs.getString("name"),
            manufacturer = rs.getString("manufacturer"),
            country = rs.getString("country"),
            city = rs.getString("city"),
            rating = rs.getDouble("rating"),
            notes = rs.getString("notes") ?: "",
            images = images,
            archetype = rs.getString("archetype"),
            subtype = rs.getString("subtype"),
            sensoryDescriptors = sensoryDescriptors,
            createdAt = rs.getTimestamp("created_at").toInstant(),
            updatedAt = rs.getTimestamp("updated_at").toInstant()
        )
    }
}
