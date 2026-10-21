package biz.web4my.tasteney_be.backup.internal

import biz.web4my.tasteney_be.backup.BackupService
import biz.web4my.tasteney_be.backup.BackupSyncRequest
import biz.web4my.tasteney_be.backup.BackupSyncResponse
import biz.web4my.tasteney_be.backup.DeleteDiaryEntriesRequest
import biz.web4my.tasteney_be.backup.DeleteDiaryEntriesResponse
import biz.web4my.tasteney_be.backup.DiaryEntryDto
import biz.web4my.tasteney_be.backup.ImageUploadResponse
import biz.web4my.tasteney_be.backup.UpsertDiaryEntryRequest
import biz.web4my.tasteney_be.user.UserDto
import biz.web4my.tasteney_be.user.UserService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/v1/backup")
class BackupRestController(
    private val backupService: BackupService,
    private val userService: UserService
) {

    private fun getAuthenticatedUser(authentication: Authentication?): UserDto {
        if (authentication == null || !authentication.isAuthenticated || authentication.name == "anonymousUser") {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated")
        }
        return userService.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
    }

    @GetMapping("/entries")
    fun getDiaryEntries(authentication: Authentication?): ResponseEntity<List<DiaryEntryDto>> {
        val user = getAuthenticatedUser(authentication)
        val entries = backupService.getDiaryEntries(user.id)
        return ResponseEntity.ok(entries)
    }

    @GetMapping("/entries/{id}")
    fun getDiaryEntryById(
        @PathVariable id: UUID,
        authentication: Authentication?
    ): ResponseEntity<DiaryEntryDto> {
        val user = getAuthenticatedUser(authentication)
        val entry = backupService.getDiaryEntryById(user.id, id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Diary entry not found")
        return ResponseEntity.ok(entry)
    }

    @PostMapping("/entries")
    fun upsertDiaryEntry(
        @Valid @RequestBody request: UpsertDiaryEntryRequest,
        authentication: Authentication?
    ): ResponseEntity<DiaryEntryDto> {
        val user = getAuthenticatedUser(authentication)
        val saved = backupService.upsertDiaryEntry(user.id, request)
        return ResponseEntity.ok(saved)
    }

    @PutMapping("/entries/{id}")
    fun updateDiaryEntryWithId(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpsertDiaryEntryRequest,
        authentication: Authentication?
    ): ResponseEntity<DiaryEntryDto> {
        val user = getAuthenticatedUser(authentication)
        val requestWithId = request.copy(id = id)
        val saved = backupService.upsertDiaryEntry(user.id, requestWithId)
        return ResponseEntity.ok(saved)
    }

    @PostMapping("/entries/batch", "/sync")
    fun syncDiaryEntries(
        @Valid @RequestBody request: BackupSyncRequest,
        authentication: Authentication?
    ): ResponseEntity<BackupSyncResponse> {
        val user = getAuthenticatedUser(authentication)
        val saved = backupService.upsertDiaryEntries(user.id, request.entries)
        return ResponseEntity.ok(BackupSyncResponse(entries = saved))
    }

    @DeleteMapping("/entries")
    fun deleteDiaryEntries(
        @RequestBody(required = false) bodyRequest: DeleteDiaryEntriesRequest?,
        @RequestParam(required = false) ids: List<UUID>?,
        authentication: Authentication?
    ): ResponseEntity<DeleteDiaryEntriesResponse> {
        val user = getAuthenticatedUser(authentication)
        val targetIds = bodyRequest?.entryIds?.takeIf { it.isNotEmpty() }
            ?: ids?.takeIf { it.isNotEmpty() }
            ?: emptyList()

        if (targetIds.isEmpty()) {
            return ResponseEntity.ok(DeleteDiaryEntriesResponse(deletedCount = 0, deletedIds = emptyList()))
        }

        val result = backupService.deleteDiaryEntries(user.id, targetIds)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/entries/delete")
    fun deleteDiaryEntriesPost(
        @RequestBody request: DeleteDiaryEntriesRequest,
        authentication: Authentication?
    ): ResponseEntity<DeleteDiaryEntriesResponse> {
        val user = getAuthenticatedUser(authentication)
        val result = backupService.deleteDiaryEntries(user.id, request.entryIds)
        return ResponseEntity.ok(result)
    }

    @DeleteMapping("/entries/{id}")
    fun deleteDiaryEntryById(
        @PathVariable id: UUID,
        authentication: Authentication?
    ): ResponseEntity<Void> {
        val user = getAuthenticatedUser(authentication)
        val deleted = backupService.deleteDiaryEntry(user.id, id)
        if (!deleted) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Diary entry not found")
        }
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/images", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadDiaryImage(
        @RequestParam("file") file: MultipartFile,
        authentication: Authentication?
    ): ResponseEntity<ImageUploadResponse> {
        val user = getAuthenticatedUser(authentication)
        if (file.isEmpty) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty")
        }

        val contentType = file.contentType ?: "image/jpeg"
        val fileName = file.originalFilename ?: "image.jpg"
        val bytes = file.bytes

        val uploadResponse = backupService.uploadDiaryImage(user.id, fileName, contentType, bytes)
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadResponse)
    }

    @GetMapping("/images/**")
    fun getDiaryImage(
        request: HttpServletRequest,
        authentication: Authentication?
    ): ResponseEntity<ByteArray> {
        val user = getAuthenticatedUser(authentication)
        val prefix = "/api/v1/backup/images/"
        val requestUri = request.requestURI
        val imageKey = if (requestUri.startsWith(prefix)) {
            requestUri.substring(prefix.length)
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image key")
        }

        val storedImage = backupService.getDiaryImage(user.id, imageKey)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found")

        val mediaType = try {
            MediaType.parseMediaType(storedImage.contentType)
        } catch (_: Exception) {
            MediaType.APPLICATION_OCTET_STREAM
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .body(storedImage.data)
    }

    @DeleteMapping("/images/**")
    fun deleteDiaryImage(
        request: HttpServletRequest,
        authentication: Authentication?
    ): ResponseEntity<Void> {
        val user = getAuthenticatedUser(authentication)
        val prefix = "/api/v1/backup/images/"
        val requestUri = request.requestURI
        val imageKey = if (requestUri.startsWith(prefix)) {
            requestUri.substring(prefix.length)
        } else {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image key")
        }

        val deleted = backupService.deleteDiaryImage(user.id, imageKey)
        if (!deleted) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found")
        }

        return ResponseEntity.noContent().build()
    }
}
