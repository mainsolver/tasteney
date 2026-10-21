package biz.web4my.tasteney_be.backup

import biz.web4my.tasteney_be.backup.internal.MockS3StorageService
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class MockS3StorageServiceTest {

    private lateinit var s3Service: MockS3StorageService

    @BeforeEach
    fun setUp() {
        s3Service = MockS3StorageService()
    }

    @Test
    fun `upload and download file successfully`() {
        val testData = "image-bytes-content".toByteArray()
        val key = "users/123/images/photo.jpg"
        val contentType = "image/jpeg"

        val uploadedKey = s3Service.uploadFile(key, contentType, testData, "photo.jpg")
        assertEquals(key, uploadedKey)
        assertTrue(s3Service.fileExists(key))

        val downloaded = s3Service.downloadFile(key)
        assertNotNull(downloaded)
        assertEquals(key, downloaded?.key)
        assertEquals(contentType, downloaded?.contentType)
        assertEquals("photo.jpg", downloaded?.fileName)
        assertArrayEquals(testData, downloaded?.data)
    }

    @Test
    fun `download non-existent file returns null`() {
        val downloaded = s3Service.downloadFile("non-existent-key")
        assertNull(downloaded)
        assertFalse(s3Service.fileExists("non-existent-key"))
    }

    @Test
    fun `delete file successfully`() {
        val testData = "sample".toByteArray()
        val key = "users/123/images/img.png"
        s3Service.uploadFile(key, "image/png", testData, "img.png")
        assertTrue(s3Service.fileExists(key))

        val deleted = s3Service.deleteFile(key)
        assertTrue(deleted)
        assertFalse(s3Service.fileExists(key))
        assertNull(s3Service.downloadFile(key))

        val deleteAgain = s3Service.deleteFile(key)
        assertFalse(deleteAgain)
    }

    @Test
    fun `delete multiple files successfully`() {
        s3Service.uploadFile("key1", "image/jpeg", "data1".toByteArray())
        s3Service.uploadFile("key2", "image/jpeg", "data2".toByteArray())
        s3Service.uploadFile("key3", "image/jpeg", "data3".toByteArray())

        val deletedCount = s3Service.deleteFiles(listOf("key1", "key2", "non-existent"))
        assertEquals(2, deletedCount)
        assertFalse(s3Service.fileExists("key1"))
        assertFalse(s3Service.fileExists("key2"))
        assertTrue(s3Service.fileExists("key3"))
    }
}
