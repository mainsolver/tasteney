package biz.web4my.tasteney_be.user

import biz.web4my.tasteney_be.user.internal.AdminUserInitializer
import biz.web4my.tasteney_be.user.internal.User
import biz.web4my.tasteney_be.user.internal.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.springframework.boot.DefaultApplicationArguments
import org.springframework.security.crypto.password.PasswordEncoder

class AdminUserInitializerTest {

    private val userRepository: UserRepository = mock(UserRepository::class.java)
    private val passwordEncoder: PasswordEncoder = mock(PasswordEncoder::class.java)

    @Test
    fun `seeds admin user with configured password when user does not exist`() {
        val email = "admin-001@tasteney.com"
        val password = "secretPassword123"

        `when`(userRepository.existsByEmail(email)).thenReturn(false)
        `when`(passwordEncoder.encode(password)).thenReturn("hashed_secretPassword123")

        val initializer = AdminUserInitializer(
            userRepository = userRepository,
            passwordEncoder = passwordEncoder,
            adminEmail = email,
            configuredPassword = password
        )

        initializer.run(DefaultApplicationArguments())

        val captor = ArgumentCaptor.forClass(User::class.java)
        verify(userRepository).save(captor.capture())

        val savedUser = captor.value
        assertEquals(email, savedUser.email)
        assertEquals("hashed_secretPassword123", savedUser.passwordHash)
        assertEquals(UserRole.ADMIN, savedUser.role)
    }

    @Test
    fun `does not re-seed admin user when user already exists`() {
        val email = "admin-001@tasteney.com"

        `when`(userRepository.existsByEmail(email)).thenReturn(true)

        val initializer = AdminUserInitializer(
            userRepository = userRepository,
            passwordEncoder = passwordEncoder,
            adminEmail = email,
            configuredPassword = ""
        )

        initializer.run(DefaultApplicationArguments())

        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any())
    }
}
