---
sessionId: session-261016-135357-13yj
---

# Requirements

### Overview & Goals
Maximize overall system reliability and user session continuity by resolving the `org.springframework.jdbc.BadSqlGrammarException` encountered during session writes. The goal is to provide persistent, database-backed HTTP session management via Spring Session JDBC using versioned Flyway migrations compatible with both PostgreSQL and H2 test environments.

### Scope
#### In Scope
- Creating Flyway migration `V2__create_spring_session_tables.sql` containing the standard Spring Session JDBC schema (`SPRING_SESSION` and `SPRING_SESSION_ATTRIBUTES`) and indexes.
- Configuring Spring Session JDBC properties in `application.properties` and `application-DEV.properties` (`spring.session.jdbc.initialize-schema=never`, `spring.session.store-type=jdbc`).
- Adding integration test coverage to validate session creation and persistence in the database upon authentication.
- Verifying complete compatibility across development Docker PostgreSQL instances and in-memory test suites.

#### Out of Scope
- Migrating to non-relational session stores (e.g. Redis).
- Changing Spring Security authentication flows or session invalidation policies.

### User Stories
- **As an Administrator**, I want my login session on `/admin/login` to be reliably persisted in the database so that I stay authenticated across server restarts and dashboard interactions without encountering 500 errors.
- **As an API Client**, I want authentication sessions created via `/api/v1/auth/login` to be correctly stored in the relational database so that subsequent authenticated requests (`/api/v1/auth/me`) succeed seamlessly.

### Functional Requirements
- **FR-1**: When the backend application starts up, Flyway must apply `V2__create_spring_session_tables.sql` after `V1__create_users_table.sql`.
- **FR-2**: When a user or administrator logs in, Spring Session JDBC must insert the session record into `SPRING_SESSION` and its attributes into `SPRING_SESSION_ATTRIBUTES` without SQL grammar exceptions.
- **FR-3**: Session expiration queries and lookups by `SESSION_ID` or `PRINCIPAL_NAME` must utilize database indexes for optimal throughput.
- **FR-4**: When a session is invalidated (e.g. on logout or expiration), associated session attributes must be automatically removed via foreign key cascade.

### Non-Functional Requirements
- **Reliability & Availability**: Eliminate 500 Internal Server Errors caused by missing session relations.
- **Portability**: Ensure DDL syntax executes cleanly on PostgreSQL 16+ and H2 (PostgreSQL compatibility mode).
- **Maintainability**: Ensure schema management is strictly centralized through Flyway migrations rather than implicit auto-initialization.

# Technical Design

### Current Implementation & Root Cause Analysis
In `tasteney-be/pom.xml`, `spring-boot-starter-session-jdbc` is included as a core dependency. Spring Boot auto-configures `JdbcIndexedSessionRepository` to store HTTP sessions in relational tables (`SPRING_SESSION` and `SPRING_SESSION_ATTRIBUTES`).

However, `src/main/resources/db/migration/` currently contains only `V1__create_users_table.sql`. Because `spring.flyway.enabled=true`, Spring Boot defaults `spring.session.jdbc.initialize-schema` to `never`. When an incoming authentication request triggers session creation (e.g., via `HttpSessionSecurityContextRepository.saveContext` in `AuthRestController` or Spring Security's form login in `AdminWebController`), Spring Session executes:
```sql
INSERT INTO SPRING_SESSION (PRIMARY_ID, SESSION_ID, CREATION_TIME, LAST_ACCESS_TIME, MAX_INACTIVE_INTERVAL, EXPIRY_TIME, PRINCIPAL_NAME)
VALUES (?, ?, ?, ?, ?, ?, ?)
```
Because the `SPRING_SESSION` table does not exist in the database, the query fails with `BadSqlGrammarException`.

### Key Decisions
1. **Flyway Migration for Session Tables**: Define the official Spring Session JDBC schema in `V2__create_spring_session_tables.sql`. This ensures consistent schema deployment across all environments and preserves Flyway's role as the single authority for database schema.
2. **Explicit Schema Initialization Policy**: Configure `spring.session.jdbc.initialize-schema=never` in `application.properties` to ensure Spring Boot does not attempt redundant or conflicting DDL operations at runtime.
3. **Database Portability**: Use standard SQL data types (`CHAR(36)`, `BIGINT`, `INT`, `VARCHAR`, `BYTEA`) that operate smoothly on PostgreSQL and H2 in PostgreSQL mode.

### Proposed Changes
- Add `tasteney-be/src/main/resources/db/migration/V2__create_spring_session_tables.sql`.
- Update `tasteney-be/src/main/resources/application.properties` and `application-DEV.properties` with explicit Spring Session JDBC properties.
- Add automated verification tests for session repository functionality.

### Data Models / Contracts
```sql
-- V2__create_spring_session_tables.sql

CREATE TABLE IF NOT EXISTS SPRING_SESSION (
    PRIMARY_ID CHAR(36) NOT NULL,
    SESSION_ID CHAR(36) NOT NULL,
    CREATION_TIME BIGINT NOT NULL,
    LAST_ACCESS_TIME BIGINT NOT NULL,
    MAX_INACTIVE_INTERVAL INT NOT NULL,
    EXPIRY_TIME BIGINT NOT NULL,
    PRINCIPAL_NAME VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);

CREATE UNIQUE INDEX IF NOT EXISTS SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX IF NOT EXISTS SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX IF NOT EXISTS SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

CREATE TABLE IF NOT EXISTS SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36) NOT NULL,
    ATTRIBUTE_NAME VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES BYTEA NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID) REFERENCES SPRING_SESSION(PRIMARY_ID) ON DELETE CASCADE
);
```

### File Structure
- `tasteney-be/src/main/resources/db/migration/V2__create_spring_session_tables.sql` (added)
- `tasteney-be/src/main/resources/application.properties` (modified)
- `tasteney-be/src/main/resources/application-DEV.properties` (modified)
- `tasteney-be/src/test/kotlin/biz/web4my/tasteney_be/security/SessionPersistenceIntegrationTest.kt` (added)

### Architecture Diagram
```mermaid
graph TD
    Client[HTTP Client / Browser] -->|Auth Request| Security[Spring Security Filter Chain]
    Security -->|Session Created| SessionFilter[Spring Session Repository Filter]
    SessionFilter -->|Persist Session| SessionRepo[JdbcIndexedSessionRepository]
    SessionRepo -->|Insert / Update| SpringSessionTable[(SPRING_SESSION)]
    SessionRepo -->|Attributes (BYTEA)| AttributesTable[(SPRING_SESSION_ATTRIBUTES)]
    Flyway[Flyway Migrations Engine] -->|Applies on Startup| V2[V2__create_spring_session_tables.sql]
    V2 -.->|Creates Schema| SpringSessionTable
    V2 -.->|Creates Schema| AttributesTable
```

### Risks & Mitigations
- **Risk**: Existing local development database might have baseline issues if modified out-of-band.
  - *Mitigation*: Ensure `spring.flyway.baseline-version=0` remains active so Flyway applies all pending migrations in order.
- **Risk**: Incompatible binary type between PostgreSQL (`BYTEA`) and H2.
  - *Mitigation*: H2 with `MODE=PostgreSQL` fully supports `BYTEA` as binary data; verified via unit and integration tests.

# Testing

### Validation Approach
Validate that Spring Session JDBC seamlessly saves and retrieves sessions against both PostgreSQL (via Docker Compose) and in-memory H2 (via automated tests), guaranteeing zero runtime SQL errors during login, authentication inspection, and logout.

### Key Scenarios
- **Scenario 1: REST API Login & Session Creation**
  - Execute `POST /api/v1/auth/login` with valid credentials.
  - Verify HTTP status `200 OK` and a valid session cookie (`SESSION`).
  - Verify that the session record exists in `SPRING_SESSION`.
- **Scenario 2: Authenticated Session Verification**
  - Execute `GET /api/v1/auth/me` with the session cookie.
  - Verify HTTP status `200 OK` and current user payload.
- **Scenario 3: Admin Web Form Login**
  - Execute `POST /admin/login` with admin credentials.
  - Verify redirect to `/admin/dashboard` with active session.
- **Scenario 4: Session Invalidation on Logout**
  - Execute `POST /api/v1/auth/logout`.
  - Verify HTTP status `204 No Content` and session removal from database.

### Test Changes
- Add `SessionPersistenceIntegrationTest.kt` to verify that `FindByIndexNameSessionRepository` or `MockMvc` login requests populate session records in the JDBC repository.
- Run complete test suite with `./mvnw test` to ensure Spring Modulith boundaries and existing tests remain green.

# Delivery Steps

### ✓ Step 1: Create Flyway migration for Spring Session JDBC schema
The database schema is upgraded with versioned Flyway scripts defining all necessary Spring Session tables and indexes.

- Create `tasteney-be/src/main/resources/db/migration/V2__create_spring_session_tables.sql`.
- Define table `SPRING_SESSION` with columns `PRIMARY_ID`, `SESSION_ID`, `CREATION_TIME`, `LAST_ACCESS_TIME`, `MAX_INACTIVE_INTERVAL`, `EXPIRY_TIME`, and `PRINCIPAL_NAME`.
- Define table `SPRING_SESSION_ATTRIBUTES` with columns `SESSION_PRIMARY_ID`, `ATTRIBUTE_NAME`, and `ATTRIBUTE_BYTES`, enforcing primary key and cascading foreign key constraints.
- Create performance indexes on `SESSION_ID` (unique), `EXPIRY_TIME`, and `PRINCIPAL_NAME`.
- Ensure column types and DDL syntax remain fully compatible with both production PostgreSQL and test H2 databases.

### ✓ Step 2: Configure Spring Session properties and validate session persistence
Application properties and integration tests validate that HTTP sessions are persisted to the database without runtime SQL errors.

- Update `tasteney-be/src/main/resources/application.properties` and `application-DEV.properties` with `spring.session.jdbc.initialize-schema=never` and `spring.session.store-type=jdbc` to delegate schema management strictly to Flyway.
- Add an integration test in `tasteney-be/src/test/kotlin/biz/web4my/tasteney_be/` verifying that authenticated sessions persist in the session repository across requests.
- Verify that `./mvnw test` and `./mvnw clean compile` pass without errors.