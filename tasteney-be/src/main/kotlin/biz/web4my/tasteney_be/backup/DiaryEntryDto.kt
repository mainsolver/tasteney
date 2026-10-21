package biz.web4my.tasteney_be.backup

import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.Instant
import java.util.UUID

data class SensoryDescriptorDto(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val category: String, // 'Smell' | 'Taste' | 'Aftertaste' | 'Finish'
    val intensity: Int // 1 to 5
)

data class DiaryEntryDto(
    val id: UUID,
    val userId: UUID,
    val name: String,
    val manufacturer: String,
    val country: String? = null,
    val city: String? = null,
    val rating: Double,
    val notes: String = "",
    val images: List<String> = emptyList(),
    val archetype: String,
    val subtype: String? = null,
    val sensoryDescriptors: List<SensoryDescriptorDto> = emptyList(),
    val createdAt: Instant,
    val updatedAt: Instant
)

data class UpsertDiaryEntryRequest(
    val id: UUID? = null,
    @field:NotBlank(message = "Name is required")
    val name: String,
    @field:NotBlank(message = "Manufacturer is required")
    val manufacturer: String,
    val country: String? = null,
    val city: String? = null,
    @field:NotNull(message = "Rating is required")
    @field:DecimalMin(value = "0.0", message = "Rating must be at least 0")
    @field:DecimalMax(value = "10.0", message = "Rating must be at most 10")
    val rating: Double,
    val notes: String = "",
    val images: List<String> = emptyList(),
    @field:NotBlank(message = "Archetype is required")
    val archetype: String,
    val subtype: String? = null,
    val sensoryDescriptors: List<SensoryDescriptorDto> = emptyList(),
    val createdAt: Instant? = null
)

data class BackupSyncRequest(
    val entries: List<UpsertDiaryEntryRequest> = emptyList()
)

data class BackupSyncResponse(
    val entries: List<DiaryEntryDto>
)

data class DeleteDiaryEntriesRequest(
    val entryIds: List<UUID> = emptyList()
)

data class DeleteDiaryEntriesResponse(
    val deletedCount: Int,
    val deletedIds: List<UUID>
)

data class ImageUploadResponse(
    val imageKey: String,
    val imageUrl: String
)

data class StoredImage(
    val key: String,
    val contentType: String,
    val data: ByteArray,
    val fileName: String
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as StoredImage

        if (key != other.key) return false
        if (contentType != other.contentType) return false
        if (!data.contentEquals(other.data)) return false
        if (fileName != other.fileName) return false

        return true
    }

    override fun hashCode(): Int {
        var result = key.hashCode()
        result = 31 * result + contentType.hashCode()
        result = 31 * result + data.contentHashCode()
        result = 31 * result + fileName.hashCode()
        return result
    }
}
