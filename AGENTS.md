# AGENTS.md — Agent & Developer Guide for Tasteney

Welcome to the **Tasteney** repository. This document serves as the single source of truth for AI agents and developers to understand the project architecture, operational workflows, conventions, and key patterns required to contribute effectively and safely.

---

## 1. Repository & Architecture Overview

Tasteney is a cross-platform beverage tasting log and sensory exploration application consisting of:
- **`tasteney/`** — Mobile & Web frontend application powered by Expo / React Native.
- **`tasteney-be/`** — Backend API service powered by Kotlin, Spring Boot 4.x, and Spring Modulith.
- **`mockups/`** — Feature visual specifications and HTML/CSS mockups.
- **`.junie/plans/`** — Architectural and feature implementation plans documenting past decisions.
- **`.agents/skills/`** — Integrated agent skill definitions (Expo, EAS, workflows).

```
tasteney/
├── tasteney/                 # Frontend: Expo / React Native (iOS, Android, Web)
│   ├── src/
│   │   ├── app/              # Expo Router file-based routes
│   │   ├── components/       # Reusable UI & domain components
│   │   ├── constants/        # Theme tokens, drink presets, images
│   │   ├── data/             # Static drink knowledge base & services
│   │   ├── hooks/            # Custom React hooks (theme, color scheme)
│   │   ├── i18n/             # Translations (en, de)
│   │   ├── services/         # Storage, image persistence, location, network
│   │   ├── types/            # TypeScript domain models and interfaces
│   │   └── utils/            # Wiki linking, helper utilities
│   ├── assets/               # Static icons, splash screens, branding
│   ├── app.json              # Expo configuration
│   ├── eas.json              # EAS Build / Submit / Update configuration
│   └── package.json          # Frontend dependencies & scripts
├── tasteney-be/              # Backend: Kotlin / Spring Boot
│   ├── src/main/kotlin/      # Kotlin application & modular services
│   ├── src/main/resources/   # Application properties, SQL migrations
│   ├── src/test/kotlin/      # Backend tests
│   ├── compose.yaml          # Local Docker Compose setup (PostgreSQL)
│   └── pom.xml               # Maven configuration
└── mockups/                  # UI mockups and design assets
```

---

## 2. Technology Stack & Key Dependencies

### Frontend (`tasteney`)
| Layer | Technologies |
|---|---|
| **Core Framework** | React Native 0.86, React 19, Expo SDK 57 |
| **Navigation & Routing** | Expo Router (`src/app/`), typed routes enabled |
| **Language & Tooling** | TypeScript 6.0, ESLint with `eslint-config-expo` |
| **State & Storage** | Local-first persistence via `@react-native-async-storage/async-storage` & `expo-file-system` |
| **Styling & Theming** | Theme hooks (`useTheme`, `useColorScheme`), custom themed primitives (`ThemedView`, `ThemedText`), `src/constants/theme.ts` |
| **Media & Device APIs** | `expo-image`, `expo-image-picker`, `expo-location`, `expo-glass-effect` |
| **Internationalization** | `i18next`, `react-i18next`, `expo-localization` (supports EN, DE) |

### Backend (`tasteney-be`)
| Layer | Technologies |
|---|---|
| **Language & Runtime** | Kotlin 2.3+, Java 21 |
| **Framework** | Spring Boot 4.1.x, Spring Modulith 2.1.x |
| **Data Access & DB** | Spring Data JDBC, Flyway, PostgreSQL |
| **Security & Ops** | Spring Security, Spring Boot Actuator, Spring Session JDBC |
| **Web & Templating** | Thymeleaf, HTMX, Spring WebMVC |
| **Build Tool** | Apache Maven via Maven Wrapper (`./mvnw`) |

---

## 3. Environment Setup & Common Commands

### Frontend (`tasteney`)
Execute all frontend commands inside the `tasteney/` directory:
```bash
cd tasteney

# Install dependencies
npm install

# Start development server
npm run start

# Launch on specific platform
npm run ios          # iOS Simulator
npm run android      # Android Emulator / Device
npm run web          # Web browser

# Linting & Code Verification
npm run lint         # Runs ESLint
npx tsc --noEmit     # TypeScript type-check
```

### Backend (`tasteney-be`)
Execute all backend commands inside the `tasteney-be/` directory:
```bash
cd tasteney-be

# Start local PostgreSQL database via Docker Compose
docker compose up -d

# Build and verify compilation
./mvnw clean compile

# Run backend test suite
./mvnw test

# Start Spring Boot application
./mvnw spring-boot:run
```

---

## 4. Domain Model & Key Frontend Patterns

### 4.1 Domain Entities (`tasteney/src/types/drink.ts`)
- **`BeverageArchetype`**: `'Wine' | 'Coffee' | 'Spirits' | 'Beer' | 'Tea' | 'Soda & Tonics' | 'Cocktail' | 'Other'`
- **`BEVERAGE_SUBTYPES`**: Dictionary mapping archetypes to available subtype strings.
- **`SensoryDescriptor`**: `{ id, name, category, intensity }` (intensity ranges 1–5).
- **`DrinkEntry`**: The primary log entity:
  - `id`: Unique identifier (string).
  - `name`: Name of the drink.
  - `manufacturer`: Winery, brewery, roastery, or producer.
  - `country`, `city`: Geographic location attributes.
  - `rating`: Rating between 1 and 10.
  - `notes`: Tasting memo / pairing notes.
  - `images`: Array of resolved or relative image URIs.
  - `archetype`: Category identifier.
  - `subtype`: Subcategory string.
  - `sensoryDescriptors`: Array of sensory attributes.
  - `createdAt`: ISO 8601 timestamp string.

### 4.2 Local-First Storage & Media Persistence
- **Storage Key**: `@tasteney/drink_entries_v1` in `AsyncStorage`.
- **Image Lifecycle (`src/services/image-storage.ts`)**:
  - Image picker/camera outputs temporary URIs (`file:///...` or `ph://...`).
  - Temporary URIs **must** be persisted to document storage via `persistImage(uri)` before saving entries.
  - File names are stored as relative paths or persistent document paths and resolved at runtime via `resolveImageUri(path)`.
  - On entry deletion or image replacement, obsolete images are cleaned up via `deleteImageFile(path)` to prevent storage leaks.

### 4.3 Theming & UI Components
- Always use the theme system defined in `src/constants/theme.ts` and `src/hooks/use-theme.ts`.
- Prefer existing UI primitives (`ThemedView`, `ThemedText`, `Button`, `Card`, `Badge`, `CategoryPill`, `SearchBar`) rather than raw unstyled elements.
- Support both light and dark modes gracefully without hardcoded color codes.

### 4.4 Internationalization (`i18n`)
- Translations reside in `src/i18n/locales/en.ts` and `src/i18n/locales/de.ts`.
- When adding new UI copy, add translation keys to both locale files and access them using `useTranslation()` from `react-i18next`.

---

## 5. Backend Architecture & Patterns (`tasteney-be`)

### 5.1 Spring Modulith Architecture & Modules
`tasteney-be` follows a strict modular monolith architecture enforced by Spring Modulith:
- **`user` module (`biz.web4my.tasteney_be.user`)**:
  - Exposes public API contracts (`UserService`, `UserDto`, `UserRole`, `RegisterRequest`, `LoginRequest`).
  - Encapsulates domain entity (`User`), Spring Data JDBC repository (`UserRepository`), implementation (`UserServiceImpl`), and REST authentication controllers (`AuthRestController`) inside `user.internal`.
  - Enforces password hashing using BCrypt.
  - Automatically provisions the initial admin account (`admin-001@tasteney.com`) on startup via `AdminUserInitializer`.
- **`admin` module (`biz.web4my.tasteney_be.admin`)**:
  - Contains server-rendered back-office controllers (`AdminWebController`) and HTMX live-filtering endpoints (`AdminHtmxController`).
  - Interacts with user data exclusively via the public `UserService` interface, respecting Spring Modulith module boundaries.
  - Thymeleaf templates reside in `src/main/resources/templates/admin/`.
- **`security` module (`biz.web4my.tasteney_be.security`)**:
  - Configures dual `SecurityFilterChain` architecture:
    1. `@Order(1)` **Admin Web Chain**: Matches `/admin/**`, enforces Form Login (`/admin/login`), redirects to `/admin/dashboard`, and strictly restricts dashboard access to `ROLE_ADMIN`.
    2. `@Order(2)` **REST API Chain**: Matches `/api/**`, disables CSRF for API clients, allows public registration and login (`/api/v1/auth/register`, `/api/v1/auth/login`), and requires authentication for protected endpoints (`/api/v1/auth/me`, `/api/v1/auth/logout`).
    3. `@Order(3)` **Default Chain**: Permits public access for non-matching resources.

### 5.2 Database Migrations & Spring Data JDBC
- Database migrations are managed via Flyway in `src/main/resources/db/migration/` (`V<version>__<description>.sql`).
- SQL migrations must adhere to standard SQL syntax compatible with both PostgreSQL and test databases (e.g., column default definitions placed before constraints).
- Entities use Spring Data JDBC with `@Table` and `@Id` annotations.

### 5.3 Initial Admin Seeding & Environment Overrides
- On initial startup, `AdminUserInitializer` verifies whether `admin-001@tasteney.com` exists.
- If missing, it seeds the administrator using `INITIAL_ADMIN_PASSWORD` (or `tasteney.admin.initial-password`), falling back to a cryptographically secure 20-character random password logged directly to the console.
- Seeding is idempotent and will not alter existing admin accounts on subsequent restarts.

### 5.4 Backend Testing & Architecture Verification
- Verify Spring Modulith boundaries using `ApplicationModules.of(TasteneyBeApplication::class.java).verify()`.
- Run complete test suite with `./mvnw test`.

---

## 6. Agent Guidelines & Best Practices

To maximize utility, speed, and accuracy when making changes:

1. **Targeted Edits**: Only modify files directly related to the user's objective. Do not reformat unaffected code or alter unrelated configurations.
2. **Type Safety**: Verify TypeScript types using `npx tsc --noEmit` within `tasteney/` after introducing or modifying components, types, or services.
3. **No Breaking Schema Changes**: Ensure backward compatibility for `DrinkEntry` serialization in `AsyncStorage`. Do not remove or rename stored fields without migration/fallback logic.
4. **Preserve Navigation Conventions**: Routes in `src/app/` adhere to Expo Router conventions (`_layout.tsx`, `(tabs)`, modal screens).
5. **Clean Up Resources**: Ensure temporary test files, debug logs, or scratch assets are removed prior to completing a task.
6. **Reference Historical Plans**: Check `.junie/plans/` for design decisions on topics like image storage, location extraction, and UI refinements.
