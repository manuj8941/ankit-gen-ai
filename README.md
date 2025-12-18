# Gen AI Documentation Website

Educational documentation-style website for learning Generative AI.

## ✨ New Features

✅ **Password Protection** - Admin panel now requires login (default: `admin123`)  
✅ **Markdown Rendering** - Write content in Markdown, rendered as rich HTML  
✅ **Image Upload** - Upload images directly from admin editor  
✅ **Styled Admin UI** - Professional header, navigation, and layouts  

## Features
- Unlimited hierarchical depth of topics
- Server-side rendering (no frontend framework)
- Admin UI for managing content tree
- Multiple page layouts (doc, tutorial, landing, video)
- Markdown content with syntax highlighting
- Image upload and management
- Password-protected admin access
- SQLite database

## Setup

```bash
# Install dependencies
npm install

# Initialize database with seed data
npm run init-db

# Start server
npm start
```

## Access

- **Public Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
  - **Default Password**: `admin123`
  - Change via env: `ADMIN_PASSWORD=yourpass npm start`

## Admin Panel

### Login
Default password is `admin123`. You'll be asked to login when accessing `/admin` routes.

### Content Tree (`/admin/tree`)
- View entire content hierarchy
- Drag & drop to reorder pages
- Add, edit, delete pages
- Expand/collapse tree nodes

### Page Editor (`/admin/edit/:id`)
- Edit title, slug, parent page
- Choose layout type (doc/tutorial/landing/video)
- Write content in Markdown
- Upload images (max 5MB)
- Set publish status (draft/published)

## Writing Content

Content is written in **Markdown** and automatically converted to styled HTML:

```markdown
## My Heading

This is **bold** and *italic* text.

### Code Example
\`\`\`javascript
console.log('Hello World');
\`\`\`

> This is a blockquote

![Image](/uploads/my-image.jpg)
```

## Security

⚠️ **Development Setup** - For production:
1. Set `ADMIN_PASSWORD` environment variable
2. Set `SESSION_SECRET` environment variable  
3. Enable HTTPS and set `cookie.secure: true`
4. Add rate limiting on login

## Project Structure

```
├── server.js           # Express server
├── db/                 # Database files
├── routes/             # Route handlers
├── models/             # Database queries
├── views/              # EJS templates
│   ├── layouts/        # Page layout templates
│   └── admin/          # Admin UI templates
├── public/             # Static files
│   ├── css/
│   ├── js/
│   └── uploads/        # User-uploaded images
└── scripts/            # Database initialization
```

## Architecture

See `.github/copilot-instructions.md` for detailed architecture guidelines.
