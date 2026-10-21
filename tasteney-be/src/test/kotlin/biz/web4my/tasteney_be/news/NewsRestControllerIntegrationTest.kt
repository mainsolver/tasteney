package biz.web4my.tasteney_be.news

import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@AutoConfigureMockMvc
class NewsRestControllerIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var newsService: NewsService

    @Test
    fun `latest news endpoint is publicly accessible without authentication`() {
        mockMvc.perform(get("/api/v1/news/latest"))
            .andExpect(status().isOk)
    }

    @Test
    fun `latest news endpoint returns the latest 5 active news ordered by creation timestamp`() {
        val uniquePrefix = "IntTest ${System.currentTimeMillis()}"

        // Create 7 active news articles with slight delays to ensure distinct creation timestamps
        val createdIds = (1..7).map { i ->
            Thread.sleep(10)
            newsService.createNews(
                CreateNewsRequest(
                    headline = "$uniquePrefix - News $i",
                    text = "Description for news number $i",
                    imagePath = "/images/news-$i.jpg",
                    link = "https://example.com/news/$i",
                    active = true
                )
            )
        }

        // Create 1 inactive news article
        Thread.sleep(10)
        val inactiveNews = newsService.createNews(
            CreateNewsRequest(
                headline = "$uniquePrefix - Inactive News",
                text = "Inactive news description",
                active = false
            )
        )

        // GET /api/v1/news/latest should return 5 most recent active news
        mockMvc.perform(
            get("/api/v1/news/latest")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$", hasSize<Any>(5)))
            .andExpect(jsonPath("$[0].headline", equalTo("$uniquePrefix - News 7")))
            .andExpect(jsonPath("$[1].headline", equalTo("$uniquePrefix - News 6")))
            .andExpect(jsonPath("$[2].headline", equalTo("$uniquePrefix - News 5")))
            .andExpect(jsonPath("$[3].headline", equalTo("$uniquePrefix - News 4")))
            .andExpect(jsonPath("$[4].headline", equalTo("$uniquePrefix - News 3")))

        // GET single news by ID
        val newestId = createdIds.last().id
        mockMvc.perform(get("/api/v1/news/$newestId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.headline", equalTo("$uniquePrefix - News 7")))
            .andExpect(jsonPath("$.imagePath", equalTo("/images/news-7.jpg")))
            .andExpect(jsonPath("$.link", equalTo("https://example.com/news/7")))

        // Inactive news by ID should return 404
        mockMvc.perform(get("/api/v1/news/${inactiveNews.id}"))
            .andExpect(status().isNotFound)
    }
}
