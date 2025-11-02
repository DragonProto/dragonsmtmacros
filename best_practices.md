### 📘 Project Best Practices

#### 1. Project Purpose
This project provides a lightweight web UI for browsing and potentially interacting with a collection of D&D-style macros. The macros are exported from a local SQLite database (dnd.db) into a static JSON file (macros.json) via a Node.js script. The site renders the macros onto index.html styled with Bootstrap and a custom stylesheet.

#### 2. Project Structure
- index.html: Main entry point for the web UI. Links to Bootstrap, style.css, and app.js. Contains the container where macros are rendered.
- style.css: Custom styles for the site. Keep UI-specific styling here instead of inline HTML styles.
- app.js: Frontend script. Fetches macros.json, renders lists/cards/filters into the DOM, and wires up any client-side behavior.
- macros.json: Static dataset exported from the SQLite DB. Treat as the source of truth for the web UI at runtime.
- exportToMacros.js: Node script to export data from dnd.db to macros.json using sqlite3. Run on demand to refresh data.
- dnd.db: SQLite database storing macros in table macros. Not used directly by the browser; only by the export script.
- package.json / package-lock.json: Node project metadata and dependencies (express, sqlite3). Scripts section includes start (expects server.js) and test placeholder.
- backgroundimage.jpg: Banner image displayed on the page.

Conventions:
- Keep all web assets (HTML/CSS/JS/JSON/images) in the project root as currently organized, or migrate to a simple public/ folder if a server is introduced.
- Avoid introducing server-only modules in client code. app.js should remain browser-friendly.

#### 3. Test Strategy
- No formal test framework configured. If adding tests:
  - Use a minimal setup appropriate to scope:
    - For frontend DOM logic: consider Jest + jsdom for unit tests of rendering utilities.
    - For data transforms: pure JS unit tests with Jest.
  - Place tests under a __tests__/ directory and mirror file names, e.g., app.render.test.js.
  - Prefer unit tests for rendering helpers and data mapping; use integration tests sparingly to load macros.json and verify end-to-end rendering.
  - Mock fetch for unit tests; include a small sample macros fixture.

#### 4. Code Style
- Language: Vanilla JS for the client, Node.js for scripts.
- Prefer modern JS features supported by evergreen browsers (const/let, arrow functions, template literals, async/await).
- Typing: Not using TypeScript; keep function signatures clear and validate inputs at boundaries.
- Naming:
  - Functions: lowerCamelCase (e.g., renderMacros, groupByCategory).
  - Variables: lowerCamelCase; constants in UPPER_SNAKE_CASE when truly constant.
  - Files: kebab-case or lowerCamelCase for JS; .json for data.
- DOM:
  - Avoid innerHTML with raw data when not necessary; use textContent for plain text and carefully sanitize if inserting HTML-rich macro fields.
  - Separate data fetching, transformation, and rendering concerns into small functions.
- Comments/Docs:
  - Use JSDoc-style docblocks for utilities that are reused (e.g., data grouping).
  - Document expected shape of macro items (id, name, description, category, subcategory, macrocode, macrocodecrit).
- Error Handling:
  - Handle fetch errors gracefully and show a user-friendly message in the UI.
  - Validate presence of expected fields; fall back when optional fields are empty.

#### 5. Common Patterns
- Data loading pattern: fetch('./macros.json') -> parse JSON -> render to DOM.
- Rendering pattern: map domain objects to semantic HTML elements (e.g., list-group items or Bootstrap cards) and append to a container (#list-container).
- Grouping/filtering: pre-group macros by category/subcategory to enable simple UI filters without re-fetching.
- Progressive enhancement: page should show a basic loading state, then enhance with JS-rendered content.

#### 6. Do's and Don'ts
- ✅ Do keep macros.json as a static file loadable by the browser (no server required).
- ✅ Do use Bootstrap utility classes to simplify layout and spacing.
- ✅ Do debounce expensive UI operations (search/filter) with large datasets.
- ✅ Do escape or sanitize any user-derived content before injecting into the DOM.
- ✅ Do keep exportToMacros.js independent of browser code; run it with Node to refresh macros.json.
- ❌ Don’t require Node-only modules in code that runs in the browser (e.g., sqlite3 in app.js).
- ❌ Don’t block rendering with long synchronous operations; use async/await and non-blocking patterns.
- ❌ Don’t mutate the original macros array in-place when filtering/sorting; work on copies.

#### 7. Tools & Dependencies
- express: Present but not required for static hosting; consider removing if unused, or add a small server.js to serve static files.
- sqlite3: Used by exportToMacros.js to read dnd.db.
- Development tips:
  - To refresh data: node exportToMacros.js
  - To serve locally without express, use a simple static server (e.g., npx serve .) or create a minimal express server if needed.

#### 8. Other Notes
- The macros contain HTML fragments in macrocode/macrocodecrit. When rendering these fields, either:
  - Render as trusted HTML only if the source is trusted and never user-supplied, or
  - Render textContent to avoid injecting HTML. If keeping the styled HTML, use a safe allowlist or sanitize first.
- Large macros.json can impact initial load; consider lazy rendering, virtualization, or server-side pagination if it grows significantly.
- If adding app.json as configuration, treat it as a client-side configuration file (e.g., feature flags, display preferences). Keep secrets out of any client-shipped JSON.