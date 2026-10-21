package biz.web4my.tasteney_be.encyclopedia.internal

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.sql.ResultSet

@Repository
class EncyclopediaCategoryRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate
) {
    fun findAll(): List<EncyclopediaCategory> {
        val sql = "SELECT id, name, icon, archetype, created_at, updated_at FROM encyclopedia_categories ORDER BY name ASC"
        return jdbcTemplate.query(sql) { rs, _ -> mapRow(rs) }
    }

    fun findById(id: String): EncyclopediaCategory? {
        val sql = "SELECT id, name, icon, archetype, created_at, updated_at FROM encyclopedia_categories WHERE id = :id"
        val params = MapSqlParameterSource("id", id)
        return jdbcTemplate.query(sql, params) { rs, _ -> mapRow(rs) }.firstOrNull()
    }

    fun existsById(id: String): Boolean {
        val sql = "SELECT COUNT(1) FROM encyclopedia_categories WHERE id = :id"
        val params = MapSqlParameterSource("id", id)
        val count = jdbcTemplate.queryForObject(sql, params, Long::class.java) ?: 0L
        return count > 0
    }

    fun count(): Long {
        val sql = "SELECT COUNT(1) FROM encyclopedia_categories"
        return jdbcTemplate.queryForObject(sql, MapSqlParameterSource(), Long::class.java) ?: 0L
    }

    private fun mapRow(rs: ResultSet): EncyclopediaCategory {
        return EncyclopediaCategory(
            id = rs.getString("id"),
            name = rs.getString("name"),
            icon = rs.getString("icon"),
            archetype = rs.getString("archetype"),
            createdAt = rs.getTimestamp("created_at").toInstant(),
            updatedAt = rs.getTimestamp("updated_at").toInstant()
        )
    }
}
