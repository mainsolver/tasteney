package biz.web4my.tasteney_be.backup

interface S3StorageService {
    fun uploadFile(key: String, contentType: String, data: ByteArray, fileName: String = ""): String
    fun downloadFile(key: String): StoredImage?
    fun deleteFile(key: String): Boolean
    fun deleteFiles(keys: List<String>): Int
    fun fileExists(key: String): Boolean
}
