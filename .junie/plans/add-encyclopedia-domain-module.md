---
sessionId: session-261016-152228-enw9
---

# Requirements

### Overview & Goals
Extend the `encyclopedia` domain module to support soft-deletion and deactivation of articles via an `active` status flag. Administrators in the backend admin console will be able to deactivate or reactivate articles. When an article's active state changes, its `updatedAt` timestamp is updated to the current time, allowing mobile and web clients using incremental sync to receive deactivated articles and update their local offline store.

### Scope
- **In Scope**:
  - Database schema evolution via Flyway migration `V4__add_article_active_status.sql` adding `is_active` boolean column (defaulting to `true`) with indexing.
  - Domain entity, repository, and DTO updates across `biz.web4my.tasteney_be.encyclopedia` to track and expose `active: Boolean`.
  - Service methods on `EncyclopediaService` to deactivate (`deactivateArticle(id)`), reactivate (`activateArticle(id)`), or update active status while advancing `updatedAt`.
  - Incremental sync REST API (`GET /api/v1/encyclopedia/articles`) returning the `active` flag for all queried articles.
  - Admin backoffice interface updates:
    - Status badges (Active / Inactive) on article list.
    - Status filter dropdown (All, Active, Inactive) with HTMX live filtering.
    - Quick deactivate/activate action triggers from the article table.
    - Active status checkbox/toggle in create and edit article forms.
  - Comprehensive unit and integration tests covering deactivation, timestamp refreshes, sync filtering, and admin workflows.
- **Out of Scope**:
  - Hard deletion (physical `DELETE` from database) of article records.
  - Modifying category active status (categories remain managed separately).

### User Stories
- **As an Administrator**, I want to deactivate an article without permanently deleting it, so that outdated or draft beverage information is hidden from mobile users while keeping historical data intact.
- **As an Administrator**, I want to reactivate previously deactivated articles and easily filter between active and inactive articles in the admin console.
- **As a Mobile Client / Frontend App**, I want to receive the `active` flag when querying the incremental sync endpoint (`GET /api/v1/encyclopedia/articles?since=...`), so that my local offline database can remove or hide deactivated articles without requiring a full cache rebuild.

### Functional Requirements
- **Active Flag Storage**: Store `is_active BOOLEAN NOT NULL DEFAULT TRUE` on `encyclopedia_articles`.
- **Soft Deletion & Reactivation**:
  - `EncyclopediaService.deactivateArticle(id)` sets `active = false` and updates `updatedAt = Instant.now()`.
  - `EncyclopediaService.activateArticle(id)` sets `active = true` and updates `updatedAt = Instant.now()`.
- **Timestamp Guarantees**: Deactivation and reactivation explicitly advance the `updated_at` column, ensuring any incremental sync query (`since <= change_time`) includes the modified record.
- **Incremental Sync Contract**:
  - `GET /api/v1/encyclopedia/articles` returns `ArticleDto` objects containing the `active: Boolean` field.
  - All articles matching search/category/timestamp criteria are returned regardless of active state, so frontend clients receive soft-deactivations and reactivations to update their local cache (no status filtering parameter on the sync endpoint).
- **Admin Management & HTMX Live Filtering**:
  - Article table displays an `Active` (green) or `Inactive` (amber/red) badge.
  - Table actions include a toggle button (e.g. "Deactivate" / "Activate") executing a POST request and refreshing the row/table via HTMX.
  - Filter bar contains a "Status" selector (`ALL`, `ACTIVE`, `INACTIVE`) working seamlessly with category and search filters.
  - Article edit form includes an "Active / Published" toggle checkbox.

### Non-Functional Requirements
- **Modulith Boundary Compliance**: All persistence and status operations remain encapsulated in `encyclopedia.internal`, exposed to `admin` solely through `EncyclopediaService`.
- **Performance**: Index on `is_active` and composite indexing considerations with `updated_at` to ensure fast filtering.
- **Backward Compatibility**: Existing database records default to `is_active = TRUE`. Existing sync consumers remain compatible.

# Technical Design

### Current Implementation
The `encyclopedia` module (`biz.web4my.tasteney_be.encyclopedia`) manages categories and articles in PostgreSQL via Spring Data JDBC / NamedParameterJdbcTemplate. Articles have `createdAt` and `updatedAt` timestamps. Currently, articles cannot be deactivated or soft-deleted, and all saved articles are treated as active.

### Key Decisions
1. **Column Name & Default (`is_active BOOLEAN NOT NULL DEFAULT TRUE`)**:
   - *Chosen Approach*: Add `is_active` with default `true` to `encyclopedia_articles`.
   - *Rationale*: Safe non-breaking migration for existing seeded data (~80 articles from `drink-knowledge.json`), ensuring existing records remain active by default.
2. **Timestamp Advancement on Status Change**:
   - *Chosen Approach*: Explicitly set `updated_at = Instant.now()` whenever `deactivateArticle` or `activateArticle` is invoked.
   - *Rationale*: Allows incremental sync (`GET /api/v1/encyclopedia/articles?since=...`) to detect state changes immediately, enabling mobile clients to synchronize soft deletes in real time.
3. **Sync Endpoint Behavior & Soft-Delete Propagation**:
   - *Chosen Approach*: `GET /api/v1/encyclopedia/articles` returns all modified records (both active and inactive) with `active: Boolean` included in `ArticleDto`. Status filtering is not exposed on the REST endpoint.
   - *Rationale*: Essential for offline-first clients: incremental sync requires receiving deactivated articles (with `active: false`) so clients can update local storage or mark entries as inactive.
4. **Admin UI Status Management**:
   - *Chosen Approach*: Provide both an inline HTMX toggle in the table (`/admin/htmx/encyclopedia/articles/{id}/toggle-active`) and a checkbox in the edit form (`/admin/encyclopedia/{id}/edit`).
   - *Rationale*: Offers maximum efficiency for admins managing multiple articles quickly while preserving full editing control in the detailed form.

### Data Models / Contracts

#### Database Migration (`V4__add_article_active_status.sql`)
```sql
ALTER TABLE encyclopedia_articles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_articles_active ON encyclopedia_articles(is_active);
```

#### DTOs & Service Contract Updates
```kotlin
package biz.web4my.tasteney_be.encyclopedia

data class ArticleDto(
    val id: String,
    val title: String,
    val category: String,
    val type: String,
    val summary: String,
    val content: String,
    val active: Boolean = true,
    val wikipediaUrl: String? = null,
    val translations: Map<String, ArticleTranslationDto> = emptyMap(),
    val tags: List<String> = emptyList(),
    val relatedArticleIds: List<String> = emptyList(),
    val location: LocationMetadataDto? = null,
    val ingredient: IngredientMetadataDto? = null,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class CreateArticleRequest(
    val id: String? = null,
    val category: String,
    val type: String = "general",
    val title: String,
    val summary: String,
    val content: String,
    val active: Boolean = true,
    val wikipediaUrl: String? = null,
    val translations: Map<String, ArticleTranslationDto> = emptyMap(),
    val tags: List<String> = emptyList(),
    val relatedArticleIds: List<String> = emptyList(),
    val location: LocationMetadataDto? = null,
    val ingredient: IngredientMetadataDto? = null
)

data class UpdateArticleRequest(
    val category: String,
    val type: String = "general",
    val title: String,
    val summary: String,
    val content: String,
    val active: Boolean = true,
    val wikipediaUrl: String? = null,
    val translations: Map<String, ArticleTranslationDto> = emptyMap(),
    val tags: List<String> = emptyList(),
    val relatedArticleIds: List<String> = emptyList(),
    val location: LocationMetadataDto? = null,
    val ingredient: IngredientMetadataDto? = null
)

interface EncyclopediaService {
    fun findAllCategories(): List<CategoryDto>
    fun findCategoryById(id: String): CategoryDto?
    fun findArticles(
        search: String? = null,
        category: String? = null,
        updatedSince: Instant? = null,
        active: Boolean? = null
    ): List<ArticleDto>
    fun findArticleById(id: String): ArticleDto?
    fun createArticle(request: CreateArticleRequest): ArticleDto
    fun updateArticle(id: String, request: UpdateArticleRequest): ArticleDto
    fun deactivateArticle(id: String): ArticleDto
    fun activateArticle(id: String): ArticleDto
    fun countArticles(active: Boolean? = null): Long
    fun countCategories(): Long
}
```

### Architecture Diagram
```mermaid
graph TD
    Client[Mobile / Web Client] -->|GET /api/v1/encyclopedia/articles?since=...| RestCtrl[EncyclopediaRestController]
    AdminBrowser[Admin Browser] -->|Toggle Active / Live Filter| AdminCtrl[AdminEncyclopediaController / HTMX]
    
    AdminCtrl -->|deactivateArticle / activateArticle| EncService[EncyclopediaService]
    RestCtrl -->|findArticles with updatedSince| EncService
    
    subgraph encyclopedia_module [biz.web4my.tasteney_be.encyclopedia]
        EncService --> EncServiceImpl[EncyclopediaServiceImpl]
        EncServiceImpl -->|Set is_active & updated_at = NOW()| ArticleRepo[EncyclopediaArticleRepository]
        EncServiceImpl --> CategoryRepo[EncyclopediaCategoryRepository]
    end
    
    ArticleRepo --> PostgreSQL[(PostgreSQL / Spring Data JDBC)]
```

### File Structure
```
tasteney-be/
├── src/main/resources/
│   ├── db/migration/
│   │   ├── V3__create_encyclopedia_tables.sql
│   │   └── V4__add_article_active_status.sql (new)
│   └── templates/admin/
│       ├── encyclopedia/
│       │   ├── index.html (add status filter dropdown)
│       │   └── edit.html (add active toggle checkbox)
│       └── fragments/
│           └── article-table.html (add status badge & quick toggle button)
├── src/main/kotlin/biz/web4my/tasteney_be/
│   ├── encyclopedia/
│   │   ├── ArticleDto.kt (add active field)
│   │   ├── EncyclopediaRequests.kt (add active field)
│   │   ├── EncyclopediaService.kt (add status methods and filter param)
│   │   └── internal/
│   │       ├── EncyclopediaArticle.kt (add isActive property)
│   │       ├── EncyclopediaArticleRepository.kt (update queries, insert, update)
│   │       ├── EncyclopediaServiceImpl.kt (implement deactivate/activate & timestamp refresh)
│   │       └── EncyclopediaRestController.kt (expose active field in ArticleDto)
│   └── admin/
│       ├── AdminEncyclopediaController.kt (handle status in form data and filter)
│       └── AdminEncyclopediaHtmxController.kt (handle status filter & quick toggle endpoint)
└── src/test/kotlin/biz/web4my/tasteney_be/
    ├── encyclopedia/
    │   ├── EncyclopediaServiceTest.kt (verify deactivation, activation, timestamps)
    │   └── EncyclopediaRestControllerTest.kt (verify active field in sync response)
    └── admin/
        └── AdminEncyclopediaControllerTest.kt (verify admin toggle and status filter)
```

### Risks & Mitigations
- **Client Sync Omission Risk**: If the REST sync endpoint filtered out deactivated articles, clients would miss deactivations.
  *Mitigation*: The endpoint always returns articles with their `active` boolean flag so clients can prune or update local state.
- **Timestamp Stale Risk**: Modifying status without updating `updatedAt` would cause incremental sync to miss status changes.
  *Mitigation*: `deactivateArticle` and `activateArticle` always set `updatedAt = Instant.now()`.

# Testing

### Validation Approach
Automated tests and admin UI verifications will test soft-delete mechanics, timestamp updates, sync endpoint behavior, and backoffice filtering.

### Key Scenarios
1. **Deactivation & Reactivation Timestamp Updates**:
   - Invoking `deactivateArticle(id)` sets `active = false` and advances `updatedAt` to `Instant.now()`.
   - Invoking `activateArticle(id)` sets `active = true` and advances `updatedAt` to `Instant.now()`.
2. **Incremental Sync with Soft Delete**:
   - Calling `GET /api/v1/encyclopedia/articles?since={before_deactivation}` returns the deactivated article with `active: false` and updated timestamp.
3. **Admin UI Filtering**:
   - Selecting "ACTIVE" shows only active articles.
   - Selecting "INACTIVE" shows only deactivated articles.
   - Selecting "ALL" shows all articles with their respective status badges.
4. **Admin Quick Toggle Action**:
   - Triggering the toggle endpoint changes the article's active state and returns the updated table fragment with updated badge and timestamp.
5. **Modulith Architecture Verification**:
   - `ModulithArchitectureTests.kt` continues to pass cleanly with all module boundaries intact.

### Test Changes
- `biz.web4my.tasteney_be.encyclopedia.EncyclopediaServiceTest`: Add tests for `deactivateArticle`, `activateArticle`, timestamp verification, and status-based query filtering.
- `biz.web4my.tasteney_be.encyclopedia.EncyclopediaRestControllerTest`: Add tests verifying `active` attribute serialization and `since` sync queries returning soft-deleted articles.
- `biz.web4my.tasteney_be.admin.AdminEncyclopediaControllerTest`: Add tests for status filtering in admin controller and HTMX toggle endpoint.

# Delivery Steps

### ✓ Step 1: Add database migration for article active/inactive flag
Database schema is updated with the `is_active` column and index for encyclopedia articles.

- Create Flyway migration script `V4__add_article_active_status.sql` adding `is_active BOOLEAN NOT NULL DEFAULT TRUE` to `encyclopedia_articles`.
- Add index on `is_active` column for fast status filtering.

### ✓ Step 2: Update encyclopedia domain models, repository, and service logic
The `encyclopedia` module is updated to support soft deletion, reactivation, and timestamp updates.

- Update `ArticleDto`, `CreateArticleRequest`, `UpdateArticleRequest`, and internal `EncyclopediaArticle` to include `active: Boolean` / `isActive: Boolean`.
- Update `EncyclopediaArticleRepository` to persist and load `is_active`, and support `active` status filtering in queries.
- Implement `deactivateArticle(id)` and `activateArticle(id)` in `EncyclopediaServiceImpl`, ensuring `updatedAt` is updated to `Instant.now()` on every state change.
- Add unit tests in `EncyclopediaServiceTest` verifying deactivation, reactivation, and timestamp advancement.

### ✓ Step 3: Update REST API sync endpoints for active status
The public sync REST API exposes the active flag in article responses for clients.

- Update `EncyclopediaRestController` to serialize the `active` flag in `ArticleDto` responses.
- Ensure all modified articles (both active and inactive) are returned on sync requests so clients can synchronize soft-deletions without endpoint status filtering.
- Add integration tests in `EncyclopediaRestControllerTest` verifying incremental sync returns soft-deleted items with updated timestamps and `active: false`.

### ✓ Step 4: Implement admin status badges, filters, and toggle controls
Admin backoffice users can view, filter, and toggle active/inactive status across articles.

- Add status filter dropdown (`ALL`, `ACTIVE`, `INACTIVE`) and inline toggle actions to `templates/admin/fragments/article-table.html` and `templates/admin/encyclopedia/index.html`.
- Add active toggle checkbox to create and edit forms in `templates/admin/encyclopedia/edit.html`.
- Add toggle endpoint in `AdminEncyclopediaHtmxController` and update `AdminEncyclopediaController` to handle status filtering and form binding.
- Add controller tests in `AdminEncyclopediaControllerTest` and verify Spring Modulith boundaries.