package biz.web4my.tasteney_be.mail.internal

import org.springframework.stereotype.Service

@Service
class MailTemplateService {

    fun buildEmailVerificationHtml(email: String, verificationUrl: String): String {
        return buildEmailLayout(
            badge = "E-Mail Verifizierung",
            heading = "Willkommen bei Tasteney!",
            subheading = "Bestätige deine E-Mail-Adresse für dein persönliches Verkostungstagebuch.",
            content = """
                <p style="margin: 0 0 16px; color: #584446; font-size: 15px; line-height: 1.6;">
                    Hallo,
                </p>
                <p style="margin: 0 0 20px; color: #584446; font-size: 15px; line-height: 1.6;">
                    vielen Dank für deine Registrierung bei <strong>Tasteney</strong>. Um dein Konto zu aktivieren und deine sensorische Genussreise zu starten, bestätige bitte deine E-Mail-Adresse:
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="$verificationUrl" style="background-color: #4d0011; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block; border: 1px solid #6b1724;">
                        E-Mail-Adresse bestätigen
                    </a>
                </div>
                <div style="background-color: #f4efe8; border: 1px solid rgba(77, 0, 17, 0.08); border-radius: 10px; padding: 14px; margin: 24px 0; font-size: 13px; color: #584446;">
                    <p style="margin: 0 0 6px; font-weight: 600; color: #4d0011;">Funktioniert der Button nicht?</p>
                    <p style="margin: 0 0 6px; font-size: 12px; color: #827273;">Kopiere den folgenden Link in deinen Browser:</p>
                    <a href="$verificationUrl" style="color: #4d0011; word-break: break-all; font-size: 12px;">$verificationUrl</a>
                </div>
                <p style="margin: 0; font-size: 13px; color: #827273; line-height: 1.5;">
                    Dieser Link ist für <strong>24 Stunden</strong> gültig. Falls du dich nicht bei Tasteney registriert hast, kannst du diese E-Mail einfach ignorieren.
                </p>
            """.trimIndent()
        )
    }

    fun buildEmailVerificationText(email: String, verificationUrl: String): String {
        return """
            Willkommen bei Tasteney!
            ========================

            Vielen Dank für deine Registrierung bei Tasteney.
            Um deine E-Mail-Adresse zu bestätigen und dein Konto zu aktivieren, öffne bitte folgenden Link:

            $verificationUrl

            Dieser Link ist für 24 Stunden gültig.
            Falls du diese Registrierung nicht initiiert hast, kannst du diese Nachricht ignorieren.

            Dein Tasteney-Team
            Sensorisches Tagebuch & Genuss-Begleiter
        """.trimIndent()
    }

    fun buildPasswordResetHtml(email: String, resetUrl: String): String {
        return buildEmailLayout(
            badge = "Sicherheit & Konto",
            heading = "Passwort zurücksetzen",
            subheading = "Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.",
            content = """
                <p style="margin: 0 0 16px; color: #584446; font-size: 15px; line-height: 1.6;">
                    Hallo,
                </p>
                <p style="margin: 0 0 20px; color: #584446; font-size: 15px; line-height: 1.6;">
                    wir haben eine Anfrage erhalten, das Passwort für deinen Tasteney-Account (<strong>$email</strong>) zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu vergeben:
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="$resetUrl" style="background-color: #4d0011; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block; border: 1px solid #6b1724;">
                        Neues Passwort vergeben
                    </a>
                </div>
                <div style="background-color: #f4efe8; border: 1px solid rgba(77, 0, 17, 0.08); border-radius: 10px; padding: 14px; margin: 24px 0; font-size: 13px; color: #584446;">
                    <p style="margin: 0 0 6px; font-weight: 600; color: #4d0011;">Funktioniert der Button nicht?</p>
                    <p style="margin: 0 0 6px; font-size: 12px; color: #827273;">Kopiere den folgenden Link in deinen Browser:</p>
                    <a href="$resetUrl" style="color: #4d0011; word-break: break-all; font-size: 12px;">$resetUrl</a>
                </div>
                <p style="margin: 0; font-size: 13px; color: #827273; line-height: 1.5;">
                    Dieser Link ist für <strong>1 Stunde</strong> gültig. Falls du diese Anfrage nicht gestellt hast, kannst du diese Nachricht sicher ignorieren. Dein bisheriges Passwort bleibt unverändert.
                </p>
            """.trimIndent()
        )
    }

    fun buildPasswordResetText(email: String, resetUrl: String): String {
        return """
            Passwort zurücksetzen — Tasteney
            ================================

            Wir haben eine Anfrage zum Zurücksetzen deines Passworts erhalten ($email).
            Um ein neues Passwort zu vergeben, öffne bitte folgenden Link im Browser:

            $resetUrl

            Dieser Link ist für 1 Stunde gültig.
            Falls du diese Anfrage nicht gestellt hast, kannst du diese Nachricht ignorieren. Dein Passwort bleibt unverändert.

            Dein Tasteney-Team
            Sensorisches Tagebuch & Genuss-Begleiter
        """.trimIndent()
    }

    private fun buildEmailLayout(
        badge: String,
        heading: String,
        subheading: String,
        content: String
    ): String {
        return """
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>$heading — Tasteney</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #fcf9f4; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1c19; -webkit-font-smoothing: antialiased;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcf9f4; padding: 40px 16px;">
                    <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #ebdcd5; border-radius: 18px; box-shadow: 0 10px 30px rgba(77, 0, 17, 0.05); overflow: hidden;">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="padding: 36px 32px 24px; border-bottom: 1px solid #f4efe8;">
                                        <div style="font-family: 'Newsreader', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #4d0011; letter-spacing: -0.02em;">
                                            Tasteney
                                        </div>
                                        <div style="font-size: 13px; color: #827273; margin-top: 4px;">
                                            Sensorisches Tagebuch &amp; Genuss-Begleiter
                                        </div>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 32px 36px;">
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <span style="display: inline-block; background-color: #fef8eb; border: 1px solid #c49a45; color: #8c6a1b; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                                                $badge
                                            </span>
                                        </div>
                                        <h1 style="font-family: 'Newsreader', Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 600; color: #230209; text-align: center; margin: 0 0 8px; line-height: 1.3;">
                                            $heading
                                        </h1>
                                        <p style="font-size: 14px; color: #827273; text-align: center; margin: 0 0 28px; line-height: 1.5;">
                                            $subheading
                                        </p>
                                        $content
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="padding: 24px 32px; background-color: #fcf9f4; border-top: 1px solid #ebdcd5; font-size: 12px; color: #827273;">
                                        <p style="margin: 0 0 6px;">&copy; Tasteney &bull; Alle Rechte vorbehalten.</p>
                                        <p style="margin: 0;">Entdecke &amp; dokumentiere deine Lieblingsgetränke mit Leidenschaft.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        """.trimIndent()
    }
}
