package biz.web4my.tasteney_be.user.internal

import biz.web4my.tasteney_be.user.UserRole
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserRepository : CrudRepository<User, UUID> {
    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean
    fun countByRole(role: UserRole): Long
}
