# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Junseok (Joon) Kang, built with vanilla HTML, CSS, and JavaScript. The project uses no frameworks or build tools - it's a pure static site that can be served directly by any web server.

## Development Commands

Since this is a static site with no build process:
- **Run locally**: Use any static file server (e.g., `python -m http.server 8000` or VS Code Live Server extension)
- **Deploy**: Simply upload the files to any web hosting service
- **No build/test/lint commands** are configured

## Architecture and Key Components

### Core Files
- `index.html` - Single page application containing all content sections
- `styles.css` - All styling using modern CSS features (Grid, Flexbox, custom properties)
- `script.js` - Handles animations, interactions, and dynamic behavior

### Key Features Implementation

1. **Intro Animation System** (`script.js:1-116`)
   - Split-screen animation with rotating text
   - Smooth transition to main content
   - Handles resize and visibility changes

2. **Navigation System** (`script.js:132-184`)
   - Fixed sidebar with expandable width on hover
   - Smooth scrolling to sections
   - Active section highlighting
   - Keyboard shortcuts (Alt + 1-9)

3. **Interactive Components**
   - **Timeline**: Expandable experience entries (`script.js:222-269`)
   - **Popup System**: Modal for additional details (`script.js:293-324`)
   - **Copy to Clipboard**: Email copy functionality (`script.js:325-349`)
   - **Lazy Loading**: Images load on scroll (`script.js:379-393`)

4. **Animation Framework**
   - Intersection Observer for scroll animations (`script.js:350-378`)
   - CSS-based fade and slide effects
   - Smooth transitions throughout

### CSS Architecture
- Uses CSS custom properties for consistent theming
- Responsive design with clamp() for fluid typography
- Modern layout techniques (Grid, Flexbox)
- Organized by component sections with clear comments

## Important Considerations

1. **No Dependencies**: This project intentionally avoids frameworks and libraries. Maintain this approach unless explicitly requested.

2. **Accessibility**: The site includes ARIA labels, skip links, and keyboard navigation. Preserve these features when making changes.

3. **Performance**: Features like lazy loading and Intersection Observer are used for optimization. Consider performance impact when adding features.

4. **Browser Compatibility**: The site uses modern CSS/JS features. Test in major browsers when making significant changes.

5. **Section Order**: The navigation and content sections are tightly coupled. If adding/removing sections, update both the nav menu and content areas.

## Admin System

The portfolio includes a comprehensive admin panel with SQLite backend for multi-user persistence:

### Architecture
- **Backend**: Node.js/Express server with SQLite database
- **Frontend**: Modern JavaScript with RESTful API integration
- **Authentication**: Session-based with bcrypt password hashing
- **Data Storage**: SQLite database with ACID transactions

### Files
- `server.js` - Express server and API routes
- `api-client.js` - Frontend API client for database communication
- `admin.html` - Admin interface with login and content editing
- `admin.css` - Admin panel styling
- `admin.js` - Admin functionality and data management
- `data-loader.js` - Loads content from API into the main site
- `scripts/init-db.js` - Database initialization script
- `portfolio.db` - SQLite database (auto-created)

### Setup & Usage
1. **Install**: `npm install`
2. **Initialize DB**: `npm run init-db`  
3. **Start Server**: `npm start`
4. **Access**: http://localhost:3000/admin
5. **Login**: Username `admin`, Password `portfolio2024`

### Features
- **SQLite Persistence**: Data survives browser clears and supports multiple users
- **Drag & Drop Ordering**: Reorder items in Experience, Research, Projects, Publications, Patents, Honors, Certifications, and Education sections
- **Custom Link Text**: Specify custom button text for project links
- **Full CRUD Operations**: Add, edit, delete, and reorder all content
- **Session Management**: Secure authentication with express-session
- **Real-time Updates**: Changes immediately reflect on the main site

### API Endpoints
- `POST /api/login` - Authentication
- `GET /api/portfolio/public` - Public portfolio data
- `GET /api/portfolio` - Admin portfolio data
- `POST /api/portfolio` - Save changes

### Security
- **Password Hashing**: bcrypt for secure password storage
- **Session-based Auth**: Server-side session management
- **Input Validation**: All API endpoints validate input
- **CORS Protection**: Configured for security

## Common Tasks

- **Edit content**: Use the admin panel at `/admin`
- **Add new section**: Update both `index.html` (nav and content) and adjust the keyboard shortcut handler in `script.js`
- **Modify animations**: Check the Intersection Observer setup and CSS animation classes
- **Update styling**: Follow the existing CSS organization pattern with section comments
- **Add interactive features**: Follow the existing event delegation patterns in `script.js`