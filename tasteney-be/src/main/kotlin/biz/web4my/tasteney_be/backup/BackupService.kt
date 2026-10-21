package biz.web4my.tasteney_be.backup

import java.util.UUID

interface BackupService {
    fun getDiaryEntries(userId: UUID): List<DiaryEntryDto>
    fun getDiaryEntryById(userId: UUID, entryId: UUID): DiaryEntryDto?
    fun upsertDiaryEntry(userId: UUID, request: UpsertDiaryEntryRequest): DiaryEntryDto
    fun upsertDiaryEntries(userId: UUID, requests: List<UpsertDiaryEntryRequest>): List<DiaryEntryDto>
    fun deleteDiaryEntries(userId: UUID, entryIds: List<UUID>): DeleteDiaryEntriesResponse
    fun deleteDiaryEntry(userId: UUID, entryId: UUID): Boolean
    fun uploadDiaryImage(userId: UUID, fileName: String, contentType: String, data: ByteArray): ImageUploadResponse
    fun getDiaryImage(userId: UUID, imageKey: String): StoredImage?
    fun deleteDiaryImage(userId: UUID, imageKey: String): Boolean
}
