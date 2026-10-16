package biz.web4my.tasteney_be.user.internal

import biz.web4my.tasteney_be.user.LoginRequest
import biz.web4my.tasteney_be.user.RegisterRequest
import biz.web4my.tasteney_be.user.UserDto
import biz.web4my.tasteney_be.user.UserService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.context.SecurityContextHolderStrategy
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/v1/auth")
class AuthRestController(
    private val userService: UserService,
    private val authenticationManager: AuthenticationManager
) {
    private val securityContextRepository: SecurityContextRepository = HttpSessionSecurityContextRepository()
    private val securityContextHolderStrategy: SecurityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy()

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<UserDto> {
        val user = userService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(user)
    }

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest,
        httpResponse: HttpServletResponse
    ): ResponseEntity<UserDto> {
        try {
            val authToken = UsernamePasswordAuthenticationToken.unauthenticated(request.email.trim().lowercase(), request.password)
            val auth = authenticationManager.authenticate(authToken)
            val context = securityContextHolderStrategy.createEmptyContext()
            context.authentication = auth
            securityContextHolderStrategy.context = context
            securityContextRepository.saveContext(context, httpRequest, httpResponse)

            val user = userService.findByEmail(auth.name)
                ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
            return ResponseEntity.ok(user)
        } catch (ex: BadCredentialsException) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password")
        }
    }

    @GetMapping("/me")
    fun me(authentication: Authentication?): ResponseEntity<UserDto> {
        if (authentication == null || !authentication.isAuthenticated || authentication.name == "anonymousUser") {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated")
        }
        val user = userService.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
        return ResponseEntity.ok(user)
    }

    @PostMapping("/logout")
    fun logout(httpRequest: HttpServletRequest): ResponseEntity<Void> {
        val session = httpRequest.getSession(false)
        session?.invalidate()
        securityContextHolderStrategy.clearContext()
        return ResponseEntity.noContent().build()
    }
}
