package biz.web4my.tasteney_be.user

import java.util.UUID

interface UserService {
    fun register(request: RegisterRequest): UserDto
    fun findByEmail(email: String): UserDto?
    fun findById(id: UUID): UserDto?
    fun findAll(search: String? = null, role: UserRole? = null): List<UserDto>
    fun countUsers(): Long
    fun countAdmins(): Long
}
