---
sessionId: session-261016-091849-46wz
---

# Requirements

### Overview & Goals
The goal is to transform the unformatted plain text in `website/assets/datenschutz.html` into a valid, standard-compliant HTML5 document with clean semantic structure and minimal, elegant styling for optimal readability.

### Scope
- **In Scope:**
  - Structuring all raw text in `website/assets/datenschutz.html` into valid HTML5.
  - Adding semantic elements (`<header>`, `<main>`, `<section>`, `<h1>`-`<h3>`, `<p>`, `<ul>`, `<li>`, `<a>`).
  - Formatting contact details, email addresses, phone numbers, and websites into interactive links.
  - Adding self-contained minimal CSS in `<style>` for typography, container layout, and mobile responsiveness.
- **Out of Scope:**
  - Modifying or altering the legal content or wording of the privacy policy.
  - Adding external heavy CSS frameworks or JavaScript dependencies.

### User Stories
- **As a user or website visitor**, I want to read the privacy policy in a clean, legible, and properly structured format on any device (desktop or mobile) so that I can easily understand how my data is processed.
- **As a developer/maintainer**, I want `website/assets/datenschutz.html` to be valid HTML5 with self-contained minimal styling so that it renders consistently without external stylesheet dependencies.

### Functional Requirements
- **Valid HTML5 Document:** Include standard doctype, html tag with `lang="de"`, UTF-8 charset, responsive viewport meta tag, and page title.
- **Semantic Hierarchy:**
  - Main title: `<h1>Datenschutzerklärung</h1>`
  - Section headers: `<h2>` for major sections (e.g., "Verantwortlicher & Kontaktadressen", "Zwecke und Rechtsgrundlagen der Datenverarbeitung", "E-Mail-Direktwerbung", "Rechtsbehelfsbelehrung").
  - Subsection headers: `<h3>` for individual processing activities and categories (e.g., "Anfragen", "Technische Zugriffsdaten", "Welche Cookies kommen zum Einsatz?").
  - Unordered lists (`<ul>`/`<li>`) for cookie functionalities, retention periods, and bullet points.
- **Interactive Elements:**
  - Email addresses linked via `mailto:` (`info@tasteney.com`, `dsb@dsb.gv.at`).
  - Phone number linked via `tel:` (`+431521520`).
  - External website linked via `https://` (`https://www.dsb.at`).
- **Complete Text Preservation:** Every sentence, note, and legal basis from the input text must be preserved.

### Non-Functional Requirements
- **Minimal & Self-Contained:** Styles should be embedded in `<head><style>...</style></head>` so the file does not require external CSS files to render properly.
- **Responsiveness & Accessibility:** Clean typography with high contrast, legible font size (16px base), ~1.6 line height, and a centered content container with max-width ~800px.

# Technical Design

### Current Implementation
`website/assets/datenschutz.html` currently contains unformatted plain text in German describing the privacy policy (Datenschutzerklärung) of Tasteney, covering responsible parties, Austrian supervisory authority contact info, request handling, technical access logs, cookies, third-party processors (`bunny.net`, `Lettermint`), retention times, and user rights.

### Key Decisions
1. **Self-Contained Embedded CSS vs External Stylesheet:**
   - *Decision:* Embed minimal CSS directly inside a `<style>` block in `<head>`.
   - *Rationale:* Ensures `datenschutz.html` displays cleanly both as a standalone page and when opened or linked directly, without depending on external asset paths.
2. **Typography and Palette:**
   - *Decision:* Use a clean system font stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) with a neutral body color (`#1c1c19`), readable light background (`#fcf9f4` or `#ffffff`), and brand burgundy accent (`#4d0011`) for headings and links.
   - *Rationale:* Lightweight, fast-loading, zero external font requests, while maintaining aesthetic harmony with the main Tasteney website.

### Proposed Changes

#### Document Outline & Semantic Structure
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Datenschutzerklärung – Tasteney</title>
  <style>
    /* Minimal responsive CSS */
  </style>
</head>
<body>
  <main class="legal-container">
    <header class="legal-header">
      <h1>Datenschutzerklärung</h1>
      <p class="lead">Im Rahmen unserer unternehmerischen Tätigkeit...</p>
    </header>

    <section class="legal-section">
      <h2>Verantwortlicher & Kontakt</h2>
      ...
    </section>

    <section class="legal-section">
      <h2>Aufsichtsbehörde</h2>
      ...
    </section>

    <section class="legal-section">
      <h2>Zwecke und Rechtsgrundlagen der Datenverarbeitung</h2>
      <h3>Anfragen</h3>
      ...
      <h3>Technische Zugriffsdaten beim Aufruf der Website</h3>
      ...
      <h3>Welche Cookies kommen zum Einsatz?</h3>
      ...
      <h3>Empfänger der personenbezogenen Daten</h3>
      ...
      <h3>Speicherdauer</h3>
      ...
    </section>

    <section class="legal-section">
      <h2>E-Mail-Direktwerbung</h2>
      ...
    </section>

    <section class="legal-section">
      <h2>Automatisierte Entscheidungsfindung</h2>
      ...
    </section>

    <section class="legal-section">
      <h2>Rechtsbehelfsbelehrung & Betroffenenrechte</h2>
      ...
    </section>
  </main>
</body>
</html>
```

### File Structure
- `website/assets/datenschutz.html` — Updated in-place with structured semantic HTML and embedded minimal styling.

# Testing

### Validation Approach
Verify the resulting HTML document for structural validity, completeness, and visual presentation.

### Key Scenarios
1. **HTML5 Conformance:**
   - Verify that all tags are properly opened and closed.
   - Verify presence of required doctype, charset, viewport, and title.
2. **Content Completeness:**
   - Verify that all sections from the raw text (Verarbeitungstätigkeit, Kontakt, Aufsichtsbehörde, Anfragen, Technische Zugriffsdaten, Cookies, bunny.net, Speicherdauer, E-Mail-Direktwerbung, Lettermint, Profiling, Rechtsbehelfsbelehrung) are present.
3. **Links & Interactions:**
   - Verify `mailto:info@tasteney.com`, `mailto:dsb@dsb.gv.at`, `tel:+431521520`, and `https://www.dsb.at` links are correctly formatted.
4. **Layout & Styling:**
   - Verify container width constraint (max-width 800px), readable line-height, proper heading sizes, and mobile viewport responsiveness.

# Delivery Steps

### ✓ Step 1: Structure privacy policy content into semantic HTML5
The privacy policy text is converted into a well-structured, valid HTML5 document with complete semantic markup.

- Wrap the document in valid HTML5 boilerplate (`<!DOCTYPE html>`, `<html lang="de">`, `<head>`, `<body>`).
- Include standard `<meta>` tags (`charset="UTF-8"`, `viewport`) and `<title>Datenschutzerklärung – Tasteney</title>`.
- Structure the content semantically using `<main>`, `<article>`, `<header>`, `<h1>`, `<h2>`, `<h3>`, `<p>`, `<ul>`, `<li>`, and `<address>` or definition blocks where appropriate.
- Convert contact info and external references into clickable links (`mailto:`, `tel:`, and `https://` URLs).
- Ensure all original text, legal clauses, and lists from the raw text are preserved accurately without omission.

### ✓ Step 2: Apply minimal responsive styling and validate markup
The HTML document is styled with clean, embedded minimal CSS and validated for layout, responsiveness, and HTML validity.

- Add self-contained minimal CSS in a `<style>` block within `<head>`.
- Define clean typography, readable line spacing, a responsive max-width container, proper list indentation, and subtle visual separation for legal sections.
- Apply a minimal, accessible color scheme aligned with the Tasteney brand (e.g., deep burgundy accent `#4d0011` for links/headings and neutral body text).
- Verify document validity, responsive layout on mobile/desktop viewports, and proper rendering of all lists and links.