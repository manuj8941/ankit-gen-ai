# Copilot Instructions: Educational Documentation Website (No Frontend Framework)

## 1. Project Goal

Build an educational documentation-style website for learning Generative AI.

**The site must:**
- Support unlimited hierarchical depth of topics
- Allow admin to add/remove/move pages at any time
- Use server-side rendering only
- **NOT use React, Vue, Angular, or SPA frameworks**
- Use one generic route for content pages
- Support multiple page layouts
- Be data-driven, not hardcoded

This project is conceptually a CMS-driven documentation site (similar to MDN/GitBook/WordPress Pages).

## 2. Core Architectural Rules (DO NOT VIOLATE)

### ❌ Forbidden
- Fixed depth (level1/level2/level3)
- Separate tables for topics/subtopics
- One route per page
- Frontend frameworks (React, Vue, etc.)
- Encoding hierarchy in URL structure
- JSON blobs for navigation structure
- "Level" column in database

### ✅ Required
- Tree-based hierarchy using parent-child relationships
- Single `pages` table
- One generic route for rendering pages
- Server-side HTML rendering
- Recursive navigation generation
- Admin UI that edits structure visually

## 3. Data Model (Single Source of Truth)

```sql
Table: pages
id            INTEGER PRIMARY KEY
title         TEXT NOT NULL
slug          TEXT UNIQUE NOT NULL
parent_id     INTEGER NULL REFERENCES pages(id)
layout_type   TEXT NOT NULL
content       TEXT
order_index   INTEGER DEFAULT 0
status        TEXT DEFAULT 'published'
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

**Notes:**
- `parent_id = NULL` → top-level page (shown as top navigation tab)
- Unlimited nesting achieved via recursive parent-child links
- `layout_type` decides which HTML template is used
- `order_index` controls ordering among siblings
- URLs are based only on `slug`, not hierarchy

## 4. Routing Rules (CRITICAL)

**Only ONE content route must exist:**

```javascript
GET /docs/:slug  // or GET /:slug
```

**Routing Logic:**
1. Read slug from URL
2. Fetch page from database
3. If not found → 404
4. Fetch:
   - Ancestors (for breadcrumbs)
   - Root pages (for top nav)
   - Children (for sidebar)
5. Render template based on `layout_type`

⚠️ **Do NOT define routes per topic or hierarchy.**

## 5. Rendering Strategy (No Frontend Framework)

**Server-Side Rendering:**
- Use templating engine (EJS/Handlebars/Pug)
- Same route, different templates
- Navigation is built recursively on server

**Layout Selection:**
```javascript
res.render(`layouts/${page.layout_type}`, data);
```

## 6. Supported Layout Types (Extensible)

Initial layouts:
- `doc` → documentation page with sidebar
- `tutorial` → step-based learning
- `landing` → marketing/overview page
- `video` → embedded video + resources

Layouts must:
- Share common header/footer
- Differ only in content blocks
- Be selectable per page in admin UI

## 7. Navigation Rules

### Top Navigation
- Pages where `parent_id IS NULL`
- Ordered by `order_index`
- Displayed as top-level tabs

### Sidebar Navigation
- Shows children of the active root page
- Built recursively
- Unlimited depth
- Collapsible

### Breadcrumbs
- Built from parent chain
- Home → Root → … → Current page

## 8. Admin UI Requirements (VERY IMPORTANT)

**Admin UI must expose TREE, NOT LEVELS.**

### Admin Screens

**1️⃣ Content Tree Screen**
- Hierarchical tree view of all pages
- Expand/collapse nodes
- Actions per node:
  - Add child
  - Edit
  - Delete
  - Reorder (drag & drop)
  - Move to another parent

This screen controls site structure.

**2️⃣ Page Editor Screen**

Fields:
- Title
- Slug
- Parent Page (dropdown or auto-set)
- Layout Type (select)
- Order Index
- Status (draft/published)
- Content (Markdown editor)

Changing `parent_id` must immediately move the page in hierarchy.

## 9. Admin UX Rules

- Admin must **NEVER** select "level"
- Depth must be unlimited
- Moving a page must be possible at any time
- Deleting a page must handle children gracefully:
  - Delete recursively OR
  - Move children up OR
  - Convert to drafts (configurable)

## 10. Content Handling

**Preferred Content Format:**
- Markdown stored in `content` field

**Optional Advanced Mode:**
- Allow JSON content for structured layouts
- Layout templates must safely read only expected fields

## 11. Image Handling

- Images stored in `/public/uploads`
- Markdown references images via relative paths
- No frontend image processing required

## 12. Technology Constraints

### Backend
- Node.js
- Express
- SQLite (database)

### Frontend
- Server-rendered HTML
- Vanilla CSS
- Minimal vanilla JS (only for admin UI interactivity)
- **No SPA, no hydration, no client-side routing**

## 13. Scalability Rules

System must allow:
- Adding deeper nesting without schema change
- Adding new layout types without touching routing
- Reorganizing site without breaking URLs
- Later migration to React or headless CMS if desired

## 14. Mental Model (DO NOT BREAK)

**The website is a tree of pages**
- Admin edits the tree
- Server renders the tree
- URLs point to pages, not structure

## 15. Success Criteria

The implementation is correct if:
- ✅ Admin can add unlimited nested pages
- ✅ Pages render via a single route
- ✅ Layout varies per page
- ✅ No frontend framework is used
- ✅ No schema changes are needed for deeper nesting

🚫 **If Copilot suggests:**
- React
- Next.js
- Fixed hierarchy
- Multiple routes per topic

→ **That suggestion is wrong and must be rejected.**
