package biz.web4my.tasteney_be.user.internal

import org.springframework.data.jdbc.repository.query.Modifying
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PasswordResetTokenRepository : CrudRepository<PasswordResetToken, UUID> {
    fun findByToken(token: String): PasswordResetToken?

    @Modifying
    @Query("DELETE FROM password_reset_tokens WHERE user_id = :userId")
    fun deleteByUserId(@Param("userId") userId: UUID)

    @Modifying
    @Query("DELETE FROM password_reset_tokens WHERE token = :token")
    fun deleteByToken(@Param("token") token: String)
}
