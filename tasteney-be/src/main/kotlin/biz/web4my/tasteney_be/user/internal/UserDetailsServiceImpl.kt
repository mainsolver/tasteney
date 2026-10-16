package biz.web4my.tasteney_be.user.internal

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserDetailsServiceImpl(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByEmail(username.trim().lowercase())
            ?: throw UsernameNotFoundException("User not found with email: $username")

        return org.springframework.security.core.userdetails.User(
            user.email,
            user.passwordHash,
            listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))
        )
    }
}
