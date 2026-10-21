package biz.web4my.tasteney_be.user

import java.util.UUID

interface UserService {
    fun register(request: RegisterRequest): UserDto
    fun verifyEmail(token: String): UserDto
    fun resendVerificationEmail(email: String)
    fun requestPasswordReset(email: String)
    fun resetPassword(request: ResetPasswordRequest)
    fun validatePasswordResetToken(token: String): Boolean
    fun findByEmail(email: String): UserDto?
    fun findById(id: UUID): UserDto?
    fun findAll(search: String? = null, role: UserRole? = null): List<UserDto>
    fun countUsers(): Long
    fun countAdmins(): Long
    fun changePassword(userId: UUID, request: ChangePasswordRequest)
    fun createAdmin(request: CreateAdminRequest): UserDto
}
