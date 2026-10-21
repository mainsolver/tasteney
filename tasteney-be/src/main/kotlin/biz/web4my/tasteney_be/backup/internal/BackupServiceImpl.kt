package biz.web4my.tasteney_be.backup.internal

import biz.web4my.tasteney_be.backup.BackupService
import biz.web4my.tasteney_be.backup.DeleteDiaryEntriesResponse
import biz.web4my.tasteney_be.backup.DiaryEntryDto
import biz.web4my.tasteney_be.backup.ImageUploadResponse
import biz.web4my.tasteney_be.backup.S3StorageService
import biz.web4my.tasteney_be.backup.StoredImage
import biz.web4my.tasteney_be.backup.UpsertDiaryEntryRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class BackupServiceImpl(
    private val diaryEntryRepository: DiaryEntryRepository,
    private val s3StorageService: S3StorageService
) : BackupService {

    private val logger = LoggerFactory.getLogger(BackupServiceImpl::class.java)

    override fun getDiaryEntries(userId: UUID): List<DiaryEntryDto> {
        return diaryEntryRepository.findByUserId(userId)
    }

    override fun getDiaryEntryById(userId: UUID, entryId: UUID): DiaryEntryDto? {
        return diaryEntryRepository.findByIdAndUserId(entryId, userId)
    }

    @Transactional
    override fun upsertDiaryEntry(userId: UUID, request: UpsertDiaryEntryRequest): DiaryEntryDto {
        val entryId = request.id ?: UUID.randomUUID()
        val now = Instant.now()
        val entry = DiaryEntryDto(
            id = entryId,
            userId = userId,
            name = request.name.trim(),
            manufacturer = request.manufacturer.trim(),
            country = request.country?.trim(),
            city = request.city?.trim(),
            rating = request.rating,
            notes = request.notes.trim(),
            images = request.images,
            archetype = request.archetype.trim(),
            subtype = request.subtype?.trim(),
            sensoryDescriptors = request.sensoryDescriptors,
            createdAt = request.createdAt ?: now,
            updatedAt = now
        )

        return diaryEntryRepository.upsert(entry)
    }

    @Transactional
    override fun upsertDiaryEntries(userId: UUID, requests: List<UpsertDiaryEntryRequest>): List<DiaryEntryDto> {
        return requests.map { upsertDiaryEntry(userId, it) }
    }

    @Transactional
    override fun deleteDiaryEntries(userId: UUID, entryIds: List<UUID>): DeleteDiaryEntriesResponse {
        val deletedIds = diaryEntryRepository.deleteByIdsAndUserId(entryIds, userId)
        logger.info("Deleted {} diary entries for user {}", deletedIds.size, userId)
        return DeleteDiaryEntriesResponse(
            deletedCount = deletedIds.size,
            deletedIds = deletedIds
        )
    }

    @Transactional
    override fun deleteDiaryEntry(userId: UUID, entryId: UUID): Boolean {
        val deleted = diaryEntryRepository.deleteByIdAndUserId(entryId, userId)
        logger.info("Deleted diary entry {} for user {}: {}", entryId, userId, deleted)
        return deleted
    }

    override fun uploadDiaryImage(
        userId: UUID,
        fileName: String,
        contentType: String,
        data: ByteArray
    ): ImageUploadResponse {
        val cleanName = fileName.replace("[^a-zA-Z0-9._-]".toRegex(), "_")
        val imageUuid = UUID.randomUUID().toString()
        val s3Key = "users/$userId/images/${imageUuid}_$cleanName"

        s3StorageService.uploadFile(s3Key, contentType, data, cleanName)

        val imageUrl = "/api/v1/backup/images/$s3Key"
        return ImageUploadResponse(
            imageKey = s3Key,
            imageUrl = imageUrl
        )
    }

    override fun getDiaryImage(userId: UUID, imageKey: String): StoredImage? {
        val stored = s3StorageService.downloadFile(imageKey) ?: return null
        if (!imageKey.startsWith("users/$userId/") && !imageKey.contains(userId.toString())) {
            logger.warn("Access denied for user {} to imageKey {}", userId, imageKey)
            return null
        }
        return stored
    }

    override fun deleteDiaryImage(userId: UUID, imageKey: String): Boolean {
        if (!imageKey.startsWith("users/$userId/") && !imageKey.contains(userId.toString())) {
            logger.warn("Delete denied for user {} to imageKey {}", userId, imageKey)
            return false
        }
        return s3StorageService.deleteFile(imageKey)
    }
}
