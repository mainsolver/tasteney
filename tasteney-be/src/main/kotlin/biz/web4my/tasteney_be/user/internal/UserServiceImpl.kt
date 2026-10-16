package biz.web4my.tasteney_be.user.internal

import biz.web4my.tasteney_be.user.RegisterRequest
import biz.web4my.tasteney_be.user.UserDto
import biz.web4my.tasteney_be.user.UserRole
import biz.web4my.tasteney_be.user.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : UserService {

    @Transactional
    override fun register(request: RegisterRequest): UserDto {
        val normalizedEmail = request.email.trim().lowercase()
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User with email already exists")
        }

        val user = User(
            email = normalizedEmail,
            passwordHash = passwordEncoder.encode(request.password) ?: "",
            role = UserRole.USER,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        val saved = userRepository.save(user)
        return saved.toDto()
    }

    override fun findByEmail(email: String): UserDto? {
        return userRepository.findByEmail(email.trim().lowercase())?.toDto()
    }

    override fun findById(id: UUID): UserDto? {
        return userRepository.findById(id).orElse(null)?.toDto()
    }

    override fun findAll(search: String?, role: UserRole?): List<UserDto> {
        val allUsers = userRepository.findAll().map { it.toDto() }
        return allUsers
            .filter { user ->
                val matchesSearch = search.isNullOrBlank() || user.email.contains(search.trim(), ignoreCase = true)
                val matchesRole = role == null || user.role == role
                matchesSearch && matchesRole
            }
            .sortedByDescending { it.createdAt }
    }

    override fun countUsers(): Long = userRepository.count()

    override fun countAdmins(): Long = userRepository.countByRole(UserRole.ADMIN)

    private fun User.toDto(): UserDto = UserDto(
        id = id ?: UUID.randomUUID(),
        email = email,
        role = role,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
