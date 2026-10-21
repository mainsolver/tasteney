package biz.web4my.tasteney_be.user.internal

import org.springframework.data.jdbc.repository.query.Modifying
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EmailVerificationTokenRepository : CrudRepository<EmailVerificationToken, UUID> {
    fun findByToken(token: String): EmailVerificationToken?

    @Modifying
    @Query("DELETE FROM email_verification_tokens WHERE user_id = :userId")
    fun deleteByUserId(@Param("userId") userId: UUID)

    @Modifying
    @Query("DELETE FROM email_verification_tokens WHERE token = :token")
    fun deleteByToken(@Param("token") token: String)
}
