package biz.web4my.tasteney_be.backup.internal

import biz.web4my.tasteney_be.backup.S3StorageService
import biz.web4my.tasteney_be.backup.StoredImage
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

@Service
@Profile("JUNIT", "test")
class MockS3StorageService : S3StorageService {
    private val logger = LoggerFactory.getLogger(MockS3StorageService::class.java)
    val storage = ConcurrentHashMap<String, StoredImage>()

    override fun uploadFile(key: String, contentType: String, data: ByteArray, fileName: String): String {
        val stored = StoredImage(
            key = key,
            contentType = contentType,
            data = data,
            fileName = fileName
        )
        storage[key] = stored
        logger.info("[MockS3StorageService] Uploaded file with key: {}, size: {} bytes", key, data.size)
        return key
    }

    override fun downloadFile(key: String): StoredImage? {
        val file = storage[key]
        if (file == null) {
            logger.warn("[MockS3StorageService] File not found with key: {}", key)
        }
        return file
    }

    override fun deleteFile(key: String): Boolean {
        val removed = storage.remove(key) != null
        logger.info("[MockS3StorageService] Deleted file with key: {}, success: {}", key, removed)
        return removed
    }

    override fun deleteFiles(keys: List<String>): Int {
        var count = 0
        keys.forEach { key ->
            if (storage.remove(key) != null) {
                count++
            }
        }
        logger.info("[MockS3StorageService] Deleted {} files out of {} requested", count, keys.size)
        return count
    }

    override fun fileExists(key: String): Boolean {
        return storage.containsKey(key)
    }

    fun clear() {
        storage.clear()
    }
}
