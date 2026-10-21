package biz.web4my.tasteney_be.backup

import biz.web4my.tasteney_be.backup.internal.BackupServiceImpl
import biz.web4my.tasteney_be.backup.internal.DiaryEntryRepository
import biz.web4my.tasteney_be.backup.internal.MockS3StorageService
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import java.time.Instant
import java.util.UUID

class BackupServiceTest {

    private lateinit var diaryEntryRepository: DiaryEntryRepository
    private lateinit var mockS3StorageService: MockS3StorageService
    private lateinit var backupService: BackupService

    private val userId = UUID.randomUUID()
    private val otherUserId = UUID.randomUUID()

    @Suppress("UNCHECKED_CAST")
    private fun <T> anyNonNull(): T {
        any<T>()
        return null as T
    }

    @BeforeEach
    fun setUp() {
        diaryEntryRepository = mock(DiaryEntryRepository::class.java)
        mockS3StorageService = MockS3StorageService()
        backupService = BackupServiceImpl(diaryEntryRepository, mockS3StorageService)
    }

    @Test
    fun `getDiaryEntries returns entries for specific user`() {
        val entry1 = createSampleEntry(UUID.randomUUID(), userId, "Barolo 2018")
        val entry2 = createSampleEntry(UUID.randomUUID(), userId, "Ethiopia Yirgacheffe")

        `when`(diaryEntryRepository.findByUserId(userId)).thenReturn(listOf(entry1, entry2))

        val result = backupService.getDiaryEntries(userId)
        assertEquals(2, result.size)
        assertEquals("Barolo 2018", result[0].name)
        assertEquals("Ethiopia Yirgacheffe", result[1].name)
    }

    @Test
    fun `getDiaryEntryById returns entry when found`() {
        val entryId = UUID.randomUUID()
        val entry = createSampleEntry(entryId, userId, "Islay Single Malt")

        `when`(diaryEntryRepository.findByIdAndUserId(entryId, userId)).thenReturn(entry)

        val result = backupService.getDiaryEntryById(userId, entryId)
        assertNotNull(result)
        assertEquals("Islay Single Malt", result?.name)
    }

    @Test
    fun `getDiaryEntryById returns null when not found`() {
        val entryId = UUID.randomUUID()
        `when`(diaryEntryRepository.findByIdAndUserId(entryId, userId)).thenReturn(null)

        val result = backupService.getDiaryEntryById(userId, entryId)
        assertNull(result)
    }

    @Test
    fun `upsertDiaryEntry creates or updates entry successfully`() {
        val entryId = UUID.randomUUID()
        val request = UpsertDiaryEntryRequest(
            id = entryId,
            name = "Riesling Spätlese",
            manufacturer = "Mosel Estate",
            country = "Germany",
            city = "Bernkastel",
            rating = 9.2,
            notes = "Crisp acidity, minerality",
            images = listOf("image1.jpg", "image2.jpg"),
            archetype = "Wine",
            subtype = "White Wine",
            sensoryDescriptors = listOf(
                SensoryDescriptorDto(name = "Green Apple", category = "Taste", intensity = 4),
                SensoryDescriptorDto(name = "Petrol / Slate", category = "Smell", intensity = 3)
            )
        )

        val savedEntry = DiaryEntryDto(
            id = entryId,
            userId = userId,
            name = "Riesling Spätlese",
            manufacturer = "Mosel Estate",
            country = "Germany",
            city = "Bernkastel",
            rating = 9.2,
            notes = "Crisp acidity, minerality",
            images = listOf("image1.jpg", "image2.jpg"),
            archetype = "Wine",
            subtype = "White Wine",
            sensoryDescriptors = request.sensoryDescriptors,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        `when`(diaryEntryRepository.upsert(anyNonNull())).thenReturn(savedEntry)

        val result = backupService.upsertDiaryEntry(userId, request)
        assertNotNull(result)
        assertEquals(entryId, result.id)
        assertEquals("Riesling Spätlese", result.name)
        assertEquals(9.2, result.rating)
        assertEquals(2, result.sensoryDescriptors.size)
    }

    @Test
    fun `upsertDiaryEntries batch creates entries`() {
        val req1 = UpsertDiaryEntryRequest(
            name = "Entry 1",
            manufacturer = "Brand A",
            rating = 8.0,
            archetype = "Beer"
        )
        val req2 = UpsertDiaryEntryRequest(
            name = "Entry 2",
            manufacturer = "Brand B",
            rating = 7.5,
            archetype = "Coffee"
        )

        val saved1 = createSampleEntry(UUID.randomUUID(), userId, "Entry 1")
        val saved2 = createSampleEntry(UUID.randomUUID(), userId, "Entry 2")

        `when`(diaryEntryRepository.upsert(anyNonNull()))
            .thenReturn(saved1)
            .thenReturn(saved2)

        val result = backupService.upsertDiaryEntries(userId, listOf(req1, req2))
        assertEquals(2, result.size)
    }

    @Test
    fun `deleteDiaryEntries deletes specific list of entries`() {
        val id1 = UUID.randomUUID()
        val id2 = UUID.randomUUID()
        val targetIds = listOf(id1, id2)

        `when`(diaryEntryRepository.deleteByIdsAndUserId(targetIds, userId)).thenReturn(listOf(id1, id2))

        val result = backupService.deleteDiaryEntries(userId, targetIds)
        assertEquals(2, result.deletedCount)
        assertEquals(listOf(id1, id2), result.deletedIds)
        verify(diaryEntryRepository).deleteByIdsAndUserId(targetIds, userId)
    }

    @Test
    fun `deleteDiaryEntry deletes single entry`() {
        val id = UUID.randomUUID()
        `when`(diaryEntryRepository.deleteByIdAndUserId(id, userId)).thenReturn(true)

        val result = backupService.deleteDiaryEntry(userId, id)
        assertTrue(result)
        verify(diaryEntryRepository).deleteByIdAndUserId(id, userId)
    }

    @Test
    fun `uploadDiaryImage stores image in S3 and returns image key and url`() {
        val testBytes = "mock-image-data-bytes".toByteArray()
        val fileName = "my bottle photo.png"
        val contentType = "image/png"

        val response = backupService.uploadDiaryImage(userId, fileName, contentType, testBytes)
        assertNotNull(response.imageKey)
        assertTrue(response.imageKey.startsWith("users/$userId/images/"))
        assertTrue(response.imageUrl.startsWith("/api/v1/backup/images/"))

        val downloaded = backupService.getDiaryImage(userId, response.imageKey)
        assertNotNull(downloaded)
        assertEquals(contentType, downloaded?.contentType)
        assertArrayEquals(testBytes, downloaded?.data)
    }

    @Test
    fun `getDiaryImage rejects access when key does not belong to user`() {
        val testBytes = "secret-image-bytes".toByteArray()
        val otherKey = "users/$otherUserId/images/photo.jpg"
        mockS3StorageService.uploadFile(otherKey, "image/jpeg", testBytes)

        val accessedByOriginalUser = backupService.getDiaryImage(otherUserId, otherKey)
        assertNotNull(accessedByOriginalUser)

        val accessedByAnotherUser = backupService.getDiaryImage(userId, otherKey)
        assertNull(accessedByAnotherUser)
    }

    @Test
    fun `deleteDiaryImage deletes image from S3 when key belongs to user`() {
        val testBytes = "image-bytes".toByteArray()
        val response = backupService.uploadDiaryImage(userId, "todelete.jpg", "image/jpeg", testBytes)

        val deleted = backupService.deleteDiaryImage(userId, response.imageKey)
        assertTrue(deleted)
        assertNull(backupService.getDiaryImage(userId, response.imageKey))
    }

    private fun createSampleEntry(id: UUID, userId: UUID, name: String): DiaryEntryDto {
        return DiaryEntryDto(
            id = id,
            userId = userId,
            name = name,
            manufacturer = "Producer X",
            country = "Italy",
            city = "Piedmont",
            rating = 8.5,
            notes = "Great tasting notes",
            images = emptyList(),
            archetype = "Wine",
            subtype = "Red Wine",
            sensoryDescriptors = emptyList(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
    }
}
