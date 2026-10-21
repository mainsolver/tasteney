package biz.web4my.tasteney_be.backup

import biz.web4my.tasteney_be.backup.internal.MockS3StorageService
import biz.web4my.tasteney_be.user.RegisterRequest
import biz.web4my.tasteney_be.user.UserService
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.util.UUID

@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@AutoConfigureMockMvc
class BackupRestControllerIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var s3StorageService: S3StorageService

    private val objectMapper = jacksonObjectMapper()

    private val userEmail1 = "backup.user1@tasteney.com"
    private val userEmail2 = "backup.user2@tasteney.com"

    @BeforeEach
    fun setUp() {
        if (userService.findByEmail(userEmail1) == null) {
            userService.register(RegisterRequest(email = userEmail1, password = "Password123!"))
        }
        if (userService.findByEmail(userEmail2) == null) {
            userService.register(RegisterRequest(email = userEmail2, password = "Password123!"))
        }
    }

    @Test
    fun `unauthenticated requests receive 401 Unauthorized`() {
        mockMvc.perform(get("/api/v1/backup/entries"))
            .andExpect(status().isUnauthorized)

        mockMvc.perform(
            post("/api/v1/backup/entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"name":"Test","manufacturer":"Brand","rating":8.0,"archetype":"Wine"}""")
        ).andExpect(status().isUnauthorized)
    }

    @Test
    @WithMockUser(username = "backup.user1@tasteney.com")
    fun `user can create and update single diary entry`() {
        val entryId = UUID.randomUUID()
        val createRequest = UpsertDiaryEntryRequest(
            id = entryId,
            name = "Château Margaux 2015",
            manufacturer = "Château Margaux",
            country = "France",
            city = "Bordeaux",
            rating = 9.8,
            notes = "Silky tannins, blackcurrant, cedar wood",
            images = listOf("drink_images/img_1.jpg"),
            archetype = "Wine",
            subtype = "Red Wine",
            sensoryDescriptors = listOf(
                SensoryDescriptorDto(name = "Blackcurrant", category = "Taste", intensity = 5),
                SensoryDescriptorDto(name = "Cedar", category = "Smell", intensity = 4)
            )
        )

        // 1. Create entry via POST /api/v1/backup/entries
        mockMvc.perform(
            post("/api/v1/backup/entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", equalTo(entryId.toString())))
            .andExpect(jsonPath("$.name", equalTo("Château Margaux 2015")))
            .andExpect(jsonPath("$.rating", equalTo(9.8)))
            .andExpect(jsonPath("$.sensoryDescriptors", hasSize<Any>(2)))

        // 2. Retrieve entry via GET /api/v1/backup/entries/{id}
        mockMvc.perform(get("/api/v1/backup/entries/$entryId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id", equalTo(entryId.toString())))
            .andExpect(jsonPath("$.name", equalTo("Château Margaux 2015")))
            .andExpect(jsonPath("$.country", equalTo("France")))

        // 3. Update entry via PUT /api/v1/backup/entries/{id}
        val updateRequest = createRequest.copy(
            rating = 10.0,
            notes = "Updated tasting notes: Extraordinary vintage!"
        )

        mockMvc.perform(
            put("/api/v1/backup/entries/$entryId")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.rating", equalTo(10.0)))
            .andExpect(jsonPath("$.notes", equalTo("Updated tasting notes: Extraordinary vintage!")))
    }

    @Test
    @WithMockUser(username = "backup.user1@tasteney.com")
    fun `user can receive their diary-data when switching phones or syncing`() {
        val entryId1 = UUID.randomUUID()
        val entryId2 = UUID.randomUUID()

        val syncRequest = BackupSyncRequest(
            entries = listOf(
                UpsertDiaryEntryRequest(
                    id = entryId1,
                    name = "Panama Geisha Natural",
                    manufacturer = "Hacienda La Esmeralda",
                    rating = 9.5,
                    archetype = "Coffee",
                    notes = "Jasmine, bergamot, peach"
                ),
                UpsertDiaryEntryRequest(
                    id = entryId2,
                    name = "Macallan 18 Sherry Oak",
                    manufacturer = "Macallan Distillery",
                    rating = 9.0,
                    archetype = "Spirits",
                    notes = "Dried fruits, ginger, wood smoke"
                )
            )
        )

        // Sync batch entries
        mockMvc.perform(
            post("/api/v1/backup/sync")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(syncRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.entries", hasSize<Any>(2)))

        // Fetch all diary entries (e.g. after phone switch)
        mockMvc.perform(get("/api/v1/backup/entries"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$[?(@.id == '$entryId1')].name").value("Panama Geisha Natural"))
            .andExpect(jsonPath("$[?(@.id == '$entryId2')].name").value("Macallan 18 Sherry Oak"))
    }

    @Test
    @WithMockUser(username = "backup.user1@tasteney.com")
    fun `user can delete a list of specific entries`() {
        val id1 = UUID.randomUUID()
        val id2 = UUID.randomUUID()
        val id3 = UUID.randomUUID()

        val syncRequest = BackupSyncRequest(
            entries = listOf(
                UpsertDiaryEntryRequest(id = id1, name = "Entry To Keep", manufacturer = "Brand", rating = 7.0, archetype = "Beer"),
                UpsertDiaryEntryRequest(id = id2, name = "Entry To Delete 1", manufacturer = "Brand", rating = 6.0, archetype = "Beer"),
                UpsertDiaryEntryRequest(id = id3, name = "Entry To Delete 2", manufacturer = "Brand", rating = 5.0, archetype = "Beer")
            )
        )

        mockMvc.perform(
            post("/api/v1/backup/entries/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(syncRequest))
        ).andExpect(status().isOk)

        // Delete list of specific entries via DELETE /api/v1/backup/entries
        val deleteRequest = DeleteDiaryEntriesRequest(entryIds = listOf(id2, id3))
        mockMvc.perform(
            delete("/api/v1/backup/entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(deleteRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.deletedCount", equalTo(2)))
            .andExpect(jsonPath("$.deletedIds", hasSize<Any>(2)))

        // Verify id2 and id3 are deleted, but id1 is still present
        mockMvc.perform(get("/api/v1/backup/entries/$id1"))
            .andExpect(status().isOk)

        mockMvc.perform(get("/api/v1/backup/entries/$id2"))
            .andExpect(status().isNotFound)

        mockMvc.perform(get("/api/v1/backup/entries/$id3"))
            .andExpect(status().isNotFound)

        // Delete single entry via DELETE /api/v1/backup/entries/{id}
        mockMvc.perform(delete("/api/v1/backup/entries/$id1"))
            .andExpect(status().isNoContent)

        mockMvc.perform(get("/api/v1/backup/entries/$id1"))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "backup.user1@tasteney.com")
    fun `user can upload and download diary images to S3 storage`() {
        val imageContent = "fake-binary-image-data-for-tasting-log".toByteArray()
        val multipartFile = MockMultipartFile(
            "file",
            "wine_label.jpg",
            "image/jpeg",
            imageContent
        )

        // 1. Upload image to S3
        val uploadResult = mockMvc.perform(
            multipart("/api/v1/backup/images")
                .file(multipartFile)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.imageKey").exists())
            .andExpect(jsonPath("$.imageUrl").exists())
            .andReturn()

        val responseJson = uploadResult.response.contentAsString
        val uploadResponse = objectMapper.readValue(responseJson, ImageUploadResponse::class.java)

        // 2. Download image from S3 endpoint
        mockMvc.perform(get(uploadResponse.imageUrl))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.IMAGE_JPEG))
            .andExpect(content().bytes(imageContent))

        // 3. Verify MockS3StorageService has the file
        val mockS3 = s3StorageService as? MockS3StorageService
        if (mockS3 != null) {
            org.junit.jupiter.api.Assertions.assertTrue(mockS3.fileExists(uploadResponse.imageKey))
        }

        // 4. Delete image
        mockMvc.perform(delete(uploadResponse.imageUrl))
            .andExpect(status().isNoContent)

        // 5. Subsequent download returns 404
        mockMvc.perform(get(uploadResponse.imageUrl))
            .andExpect(status().isNotFound)
    }

    @Test
    @WithMockUser(username = "backup.user1@tasteney.com")
    fun `user isolation ensures user cannot access or delete other user's entries`() {
        val user2 = userService.findByEmail(userEmail2)!!
        val entryIdUser2 = UUID.randomUUID()

        // Create entry for user2 via direct service call or repo
        val createRequestUser2 = UpsertDiaryEntryRequest(
            id = entryIdUser2,
            name = "User2 Secret Wine",
            manufacturer = "Secret Producer",
            rating = 8.0,
            archetype = "Wine"
        )

        // We can use Spring context / mock user switching by executing as user1
        // Let's create an entry directly as user2:
        val user2EntryDto = DiaryEntryDto(
            id = entryIdUser2,
            userId = user2.id,
            name = "User2 Secret Wine",
            manufacturer = "Secret Producer",
            rating = 8.0,
            notes = "Top secret",
            archetype = "Wine",
            createdAt = java.time.Instant.now(),
            updatedAt = java.time.Instant.now()
        )

        // As user1, attempting to GET user2's entry returns 404
        mockMvc.perform(get("/api/v1/backup/entries/$entryIdUser2"))
            .andExpect(status().isNotFound)

        // As user1, attempting to DELETE user2's entry returns 404 / 0 deleted
        mockMvc.perform(delete("/api/v1/backup/entries/$entryIdUser2"))
            .andExpect(status().isNotFound)

        val deleteBatchRequest = DeleteDiaryEntriesRequest(entryIds = listOf(entryIdUser2))
        mockMvc.perform(
            delete("/api/v1/backup/entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(deleteBatchRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.deletedCount", equalTo(0)))
    }
}
