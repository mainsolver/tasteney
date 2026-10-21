package biz.web4my.tasteney_be.user.internal

import biz.web4my.tasteney_be.user.ForgotPasswordRequest
import biz.web4my.tasteney_be.user.LoginRequest
import biz.web4my.tasteney_be.user.MessageResponse
import biz.web4my.tasteney_be.user.RegisterRequest
import biz.web4my.tasteney_be.user.ResendVerificationRequest
import biz.web4my.tasteney_be.user.ResetPasswordRequest
import biz.web4my.tasteney_be.user.UserDto
import biz.web4my.tasteney_be.user.UserService
import biz.web4my.tasteney_be.user.VerifyEmailRequest
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
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
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
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

    @PostMapping("/verify-email")
    fun verifyEmail(
        @RequestBody(required = false) request: VerifyEmailRequest?,
        @RequestParam(required = false) token: String?
    ): ResponseEntity<MessageResponse> {
        val targetToken = request?.token ?: token
        if (targetToken.isNullOrBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Token is required")
        }
        userService.verifyEmail(targetToken)
        return ResponseEntity.ok(MessageResponse("Email verified successfully"))
    }

    @GetMapping("/verify-email")
    fun verifyEmailGet(
        @RequestParam token: String,
        @RequestHeader(value = "Accept", required = false) acceptHeader: String?
    ): ResponseEntity<Any> {
        val isHtml = acceptHeader?.contains("text/html") == true
        return try {
            userService.verifyEmail(token)
            if (isHtml) {
                ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(renderHtmlResult(
                        title = "E-Mail bestätigt",
                        badge = "E-Mail Verifizierung",
                        heading = "E-Mail-Adresse erfolgreich bestätigt!",
                        message = "Dein Tasteney-Konto ist jetzt verifiziert. Du kannst die App nun in vollem Umfang für dein persönliches Verkostungstagebuch nutzen.",
                        isSuccess = true
                    ))
            } else {
                ResponseEntity.ok(MessageResponse("Email verified successfully"))
            }
        } catch (ex: ResponseStatusException) {
            if (isHtml) {
                ResponseEntity.status(ex.statusCode)
                    .contentType(MediaType.TEXT_HTML)
                    .body(renderHtmlResult(
                        title = "Verifizierung fehlgeschlagen",
                        badge = "Hinweis",
                        heading = "Ungültiger oder abgelaufener Link",
                        message = "Der Bestätigungslink ist leider ungültig oder abgelaufen. Bitte fordere in der Tasteney-App einen neuen Link an.",
                        isSuccess = false
                    ))
            } else {
                throw ex
            }
        }
    }

    @PostMapping("/resend-verification")
    fun resendVerification(@Valid @RequestBody request: ResendVerificationRequest): ResponseEntity<MessageResponse> {
        userService.resendVerificationEmail(request.email)
        return ResponseEntity.ok(MessageResponse("Verification email sent if account exists and is not yet verified."))
    }

    @PostMapping("/forgot-password")
    fun forgotPassword(@Valid @RequestBody request: ForgotPasswordRequest): ResponseEntity<MessageResponse> {
        userService.requestPasswordReset(request.email)
        return ResponseEntity.ok(MessageResponse("If that email is registered, a password reset link has been sent."))
    }

    @PostMapping("/reset-password")
    fun resetPassword(@Valid @RequestBody request: ResetPasswordRequest): ResponseEntity<MessageResponse> {
        userService.resetPassword(request)
        return ResponseEntity.ok(MessageResponse("Password has been reset successfully."))
    }

    @GetMapping("/reset-password")
    fun resetPasswordGet(
        @RequestParam token: String,
        @RequestHeader(value = "Accept", required = false) acceptHeader: String?
    ): ResponseEntity<Any> {
        val isValid = userService.validatePasswordResetToken(token)
        val isHtml = acceptHeader?.contains("text/html") == true

        if (!isValid) {
            if (isHtml) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_HTML)
                    .body(renderHtmlResult(
                        title = "Passwort zurücksetzen",
                        badge = "Sicherheit",
                        heading = "Ungültiger oder abgelaufener Link",
                        message = "Der Link zum Zurücksetzen deines Passworts ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.",
                        isSuccess = false
                    ))
            }
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token")
        }

        if (isHtml) {
            return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(renderPasswordResetFormHtml(token))
        }

        return ResponseEntity.ok(mapOf("valid" to true, "token" to token))
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

    private fun renderHtmlResult(
        title: String,
        badge: String,
        heading: String,
        message: String,
        isSuccess: Boolean
    ): String {
        val icon = if (isSuccess) "✓" else "✕"
        val iconBg = if (isSuccess) "#fef8eb" else "#fdedec"
        val iconBorder = if (isSuccess) "#c49a45" else "#e74c3c"
        val iconColor = if (isSuccess) "#8c6a1b" else "#c0392b"

        return """
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>$title — Tasteney</title>
                <style>
                    :root {
                        --bg-canvas: #fcf9f4;
                        --bg-surface: #ffffff;
                        --primary-burgundy: #4d0011;
                        --gold-accent: #c49a45;
                        --text-main: #1c1c19;
                        --text-muted: #584446;
                        --border-subtle: #ebdcd5;
                    }
                    body {
                        margin: 0;
                        padding: 40px 20px;
                        background: radial-gradient(circle at 15% 15%, rgba(196, 154, 69, 0.05) 0%, transparent 40%),
                                    radial-gradient(circle at 85% 65%, rgba(77, 0, 17, 0.04) 0%, transparent 45%),
                                    var(--bg-canvas);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        color: var(--text-main);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                    }
                    .card {
                        background: var(--bg-surface);
                        border: 1px solid var(--border-subtle);
                        border-radius: 20px;
                        padding: 44px 36px;
                        max-width: 480px;
                        width: 100%;
                        text-align: center;
                        box-shadow: 0 12px 32px rgba(77, 0, 17, 0.06);
                    }
                    .brand {
                        font-family: Georgia, serif;
                        font-size: 26px;
                        font-weight: 700;
                        color: var(--primary-burgundy);
                        margin-bottom: 24px;
                    }
                    .icon-circle {
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        background: $iconBg;
                        border: 2px solid $iconBorder;
                        color: $iconColor;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        font-weight: bold;
                        margin: 0 auto 20px;
                    }
                    .badge {
                        display: inline-block;
                        background: #fef8eb;
                        border: 1px solid #c49a45;
                        color: #8c6a1b;
                        padding: 4px 14px;
                        border-radius: 9999px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        margin-bottom: 16px;
                    }
                    h1 {
                        font-family: Georgia, serif;
                        font-size: 22px;
                        color: #230209;
                        margin: 0 0 12px;
                    }
                    p {
                        color: var(--text-muted);
                        font-size: 15px;
                        line-height: 1.6;
                        margin: 0;
                    }
                    .footer {
                        margin-top: 32px;
                        padding-top: 20px;
                        border-top: 1px solid var(--border-subtle);
                        font-size: 13px;
                        color: #827273;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="brand">Tasteney</div>
                    <div class="icon-circle">$icon</div>
                    <div class="badge">$badge</div>
                    <h1>$heading</h1>
                    <p>$message</p>
                    <div class="footer">
                        Sensorisches Tagebuch &amp; Genuss-Begleiter
                    </div>
                </div>
            </body>
            </html>
        """.trimIndent()
    }

    private fun renderPasswordResetFormHtml(token: String): String {
        return """
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Passwort zurücksetzen — Tasteney</title>
                <style>
                    :root {
                        --bg-canvas: #fcf9f4;
                        --bg-surface: #ffffff;
                        --primary-burgundy: #4d0011;
                        --gold-accent: #c49a45;
                        --text-main: #1c1c19;
                        --text-muted: #584446;
                        --border-subtle: #ebdcd5;
                    }
                    body {
                        margin: 0;
                        padding: 40px 20px;
                        background: radial-gradient(circle at 15% 15%, rgba(196, 154, 69, 0.05) 0%, transparent 40%),
                                    radial-gradient(circle at 85% 65%, rgba(77, 0, 17, 0.04) 0%, transparent 45%),
                                    var(--bg-canvas);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        color: var(--text-main);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                    }
                    .card {
                        background: var(--bg-surface);
                        border: 1px solid var(--border-subtle);
                        border-radius: 20px;
                        padding: 40px 36px;
                        max-width: 440px;
                        width: 100%;
                        box-shadow: 0 12px 32px rgba(77, 0, 17, 0.06);
                    }
                    .brand {
                        font-family: Georgia, serif;
                        font-size: 26px;
                        font-weight: 700;
                        color: var(--primary-burgundy);
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .badge-container {
                        text-align: center;
                        margin-bottom: 12px;
                    }
                    .badge {
                        display: inline-block;
                        background: #fef8eb;
                        border: 1px solid #c49a45;
                        color: #8c6a1b;
                        padding: 4px 14px;
                        border-radius: 9999px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    h1 {
                        font-family: Georgia, serif;
                        font-size: 22px;
                        color: #230209;
                        text-align: center;
                        margin: 0 0 20px;
                    }
                    .form-group {
                        margin-bottom: 18px;
                    }
                    label {
                        display: block;
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-muted);
                        margin-bottom: 6px;
                    }
                    input[type="password"] {
                        width: 100%;
                        padding: 12px 14px;
                        border: 1px solid var(--border-subtle);
                        border-radius: 10px;
                        font-size: 14px;
                        box-sizing: border-box;
                        background: #fcf9f4;
                        transition: border-color 0.2s;
                    }
                    input[type="password"]:focus {
                        outline: none;
                        border-color: var(--primary-burgundy);
                        background: #fff;
                    }
                    button {
                        width: 100%;
                        background: var(--primary-burgundy);
                        color: #ffffff;
                        border: 1px solid #6b1724;
                        padding: 14px;
                        border-radius: 12px;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-top: 10px;
                        transition: background-color 0.2s;
                    }
                    button:hover {
                        background: #33000b;
                    }
                    .footer {
                        margin-top: 24px;
                        padding-top: 18px;
                        border-top: 1px solid var(--border-subtle);
                        font-size: 12px;
                        color: #827273;
                        text-align: center;
                    }
                    #status-msg {
                        margin-top: 14px;
                        padding: 10px;
                        border-radius: 8px;
                        font-size: 14px;
                        display: none;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="brand">Tasteney</div>
                    <div class="badge-container"><span class="badge">Sicherheit</span></div>
                    <h1>Neues Passwort vergeben</h1>
                    <form id="resetForm">
                        <input type="hidden" id="token" value="$token">
                        <div class="form-group">
                            <label for="newPassword">Neues Passwort (mind. 6 Zeichen)</label>
                            <input type="password" id="newPassword" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Passwort wiederholen</label>
                            <input type="password" id="confirmPassword" required minlength="6">
                        </div>
                        <button type="submit" id="submitBtn">Passwort speichern</button>
                    </form>
                    <div id="status-msg"></div>
                    <div class="footer">
                        Sensorisches Tagebuch &amp; Genuss-Begleiter
                    </div>
                </div>
                <script>
                    document.getElementById('resetForm').addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const token = document.getElementById('token').value;
                        const newPassword = document.getElementById('newPassword').value;
                        const confirmPassword = document.getElementById('confirmPassword').value;
                        const statusMsg = document.getElementById('status-msg');
                        const submitBtn = document.getElementById('submitBtn');

                        if (newPassword !== confirmPassword) {
                            statusMsg.style.display = 'block';
                            statusMsg.style.background = '#fdedec';
                            statusMsg.style.color = '#c0392b';
                            statusMsg.textContent = 'Passwörter stimmen nicht überein.';
                            return;
                        }

                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Wird gespeichert...';

                        try {
                            const res = await fetch('/api/v1/auth/reset-password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token, newPassword, confirmPassword })
                            });

                            if (res.ok) {
                                document.getElementById('resetForm').style.display = 'none';
                                statusMsg.style.display = 'block';
                                statusMsg.style.background = '#fef8eb';
                                statusMsg.style.color = '#8c6a1b';
                                statusMsg.textContent = 'Passwort erfolgreich geändert! Du kannst dich jetzt in der App einloggen.';
                            } else {
                                const data = await res.json().catch(() => ({}));
                                statusMsg.style.display = 'block';
                                statusMsg.style.background = '#fdedec';
                                statusMsg.style.color = '#c0392b';
                                statusMsg.textContent = data.message || 'Fehler beim Zurücksetzen des Passworts.';
                                submitBtn.disabled = false;
                                submitBtn.textContent = 'Passwort speichern';
                            }
                        } catch (err) {
                            statusMsg.style.display = 'block';
                            statusMsg.style.background = '#fdedec';
                            statusMsg.style.color = '#c0392b';
                            statusMsg.textContent = 'Verbindungsfehler. Bitte versuche es erneut.';
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Passwort speichern';
                        }
                    });
                </script>
            </body>
            </html>
        """.trimIndent()
    }
}
