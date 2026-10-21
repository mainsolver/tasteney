package biz.web4my.tasteney_be.news

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateNewsRequest(
    @field:NotBlank(message = "Headline is required")
    @field:Size(max = 255, message = "Headline cannot exceed 255 characters")
    val headline: String,

    @field:NotBlank(message = "Text is required")
    @field:Size(max = 1000, message = "Text cannot exceed 1000 characters")
    val text: String,

    @field:Size(max = 512, message = "Image path cannot exceed 512 characters")
    val imagePath: String? = null,

    @field:Size(max = 512, message = "Link cannot exceed 512 characters")
    val link: String? = null,

    val active: Boolean = true
)

data class UpdateNewsRequest(
    @field:NotBlank(message = "Headline is required")
    @field:Size(max = 255, message = "Headline cannot exceed 255 characters")
    val headline: String,

    @field:NotBlank(message = "Text is required")
    @field:Size(max = 1000, message = "Text cannot exceed 1000 characters")
    val text: String,

    @field:Size(max = 512, message = "Image path cannot exceed 512 characters")
    val imagePath: String? = null,

    @field:Size(max = 512, message = "Link cannot exceed 512 characters")
    val link: String? = null,

    val active: Boolean? = null
)
