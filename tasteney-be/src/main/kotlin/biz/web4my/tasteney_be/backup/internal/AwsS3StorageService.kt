package biz.web4my.tasteney_be.backup.internal

import biz.web4my.tasteney_be.backup.S3StorageService
import biz.web4my.tasteney_be.backup.StoredImage
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.HeadObjectRequest
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.model.ObjectIdentifier
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.net.URI

@Service
@Profile("!JUNIT & !test")
class AwsS3StorageService(
    @Value("\${tasteney.s3.bucket-name:tasteney-diary-images}") private val bucketName: String,
    @Value("\${tasteney.s3.region:eu-central-1}") private val regionString: String,
    @Value("\${tasteney.s3.endpoint:#{null}}") private val customEndpoint: String?,
    @Value("\${tasteney.s3.access-key:#{null}}") private val accessKey: String?,
    @Value("\${tasteney.s3.secret-key:#{null}}") private val secretKey: String?
) : S3StorageService {

    private val logger = LoggerFactory.getLogger(AwsS3StorageService::class.java)

    private val s3Client: S3Client by lazy {
        val builder = S3Client.builder()
            .region(Region.of(regionString))

        if (!customEndpoint.isNullOrBlank()) {
            builder.endpointOverride(URI.create(customEndpoint))
        }

        if (!accessKey.isNullOrBlank() && !secretKey.isNullOrBlank()) {
            val credentials = AwsBasicCredentials.create(accessKey, secretKey)
            builder.credentialsProvider(StaticCredentialsProvider.create(credentials))
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create())
        }

        builder.build()
    }

    override fun uploadFile(key: String, contentType: String, data: ByteArray, fileName: String): String {
        try {
            val putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build()

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(data))
            logger.info("Successfully uploaded image to S3 bucket '{}' with key '{}'", bucketName, key)
            return key
        } catch (ex: Exception) {
            logger.error("Failed to upload image to S3 bucket '{}' with key '{}': {}", bucketName, key, ex.message, ex)
            throw ex
        }
    }

    override fun downloadFile(key: String): StoredImage? {
        return try {
            val getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build()

            val responseBytes = s3Client.getObjectAsBytes(getObjectRequest)
            val contentType = responseBytes.response().contentType() ?: "application/octet-stream"
            StoredImage(
                key = key,
                contentType = contentType,
                data = responseBytes.asByteArray(),
                fileName = key.substringAfterLast("/")
            )
        } catch (ex: NoSuchKeyException) {
            logger.warn("S3 object not found for key '{}'", key)
            null
        } catch (ex: Exception) {
            logger.error("Failed to download image from S3 bucket '{}' with key '{}': {}", bucketName, key, ex.message, ex)
            null
        }
    }

    override fun deleteFile(key: String): Boolean {
        return try {
            val deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build()

            s3Client.deleteObject(deleteObjectRequest)
            logger.info("Successfully deleted image from S3 bucket '{}' with key '{}'", bucketName, key)
            true
        } catch (ex: Exception) {
            logger.error("Failed to delete image from S3 bucket '{}' with key '{}': {}", bucketName, key, ex.message, ex)
            false
        }
    }

    override fun deleteFiles(keys: List<String>): Int {
        if (keys.isEmpty()) return 0
        return try {
            val objectIdentifiers = keys.map { ObjectIdentifier.builder().key(it).build() }
            val deleteObjectsRequest = DeleteObjectsRequest.builder()
                .bucket(bucketName)
                .delete { it.objects(objectIdentifiers) }
                .build()

            val response = s3Client.deleteObjects(deleteObjectsRequest)
            response.deleted().size
        } catch (ex: Exception) {
            logger.error("Failed to batch delete images from S3 bucket '{}': {}", bucketName, ex.message, ex)
            0
        }
    }

    override fun fileExists(key: String): Boolean {
        return try {
            val headObjectRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build()
            s3Client.headObject(headObjectRequest)
            true
        } catch (ex: NoSuchKeyException) {
            false
        } catch (ex: Exception) {
            false
        }
    }
}
