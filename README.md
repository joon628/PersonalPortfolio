# Portfolio Admin System with SQLite

A professional portfolio website with a comprehensive admin panel backed by SQLite database.

## Features

✅ **SQLite Database** - Persistent data storage across users and sessions  
✅ **Multi-user Support** - Session-based authentication  
✅ **Drag & Drop Ordering** - Reorder content in all major sections  
✅ **Custom Link Text** - Specify custom button text for project links  
✅ **Real-time Updates** - Changes immediately reflect on the main site  
✅ **RESTful API** - Clean separation between frontend and backend  

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize database:**
   ```bash
   npm run init-db
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

### Default Login
- **Username:** `admin`
- **Password:** `portfolio2024`

## Development

### Start development server with auto-reload:
```bash
npm run dev
```

### Database Management

The SQLite database (`portfolio.db`) stores:
- User accounts and authentication
- Portfolio content (sections and data)
- System settings

To reset the database:
```bash
rm portfolio.db
npm run init-db
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout  
- `GET /api/auth/status` - Check authentication status

### Portfolio Data
- `GET /api/portfolio/public` - Get portfolio data (public)
- `GET /api/portfolio` - Get portfolio data (authenticated)
- `POST /api/portfolio` - Save portfolio data (authenticated)

## File Structure

```
├── server.js              # Express server and API routes
├── api-client.js          # Frontend API client
├── admin.js               # Admin panel JavaScript
├── data-loader.js         # Main site data loader
├── index.html             # Main portfolio site
├── admin.html             # Admin panel interface
├── styles.css             # Main site styles
├── admin.css              # Admin panel styles
├── scripts/
│   └── init-db.js         # Database initialization
└── portfolio.db           # SQLite database (created on first run)
```

## Admin Panel Features

### Sections with Drag & Drop Ordering:
- **Experience** - Work history and positions
- **Research** - Research projects and publications
- **Projects** - Portfolio projects with custom links
- **Publications** - Academic papers and articles
- **Patents** - Patent applications and grants
- **Honors** - Awards and recognitions
- **Certifications** - Professional certifications
- **Education** - Degrees and educational background

### Content Management:
- **Add/Edit/Delete** - Full CRUD operations
- **Custom Link Text** - Specify button text for project links
- **Rich Data Fields** - Period, institution, technologies, etc.
- **Auto-save** - Changes persist immediately

## Security

- **Session-based authentication** using express-session
- **Password hashing** with bcrypt
- **Input validation** on all endpoints
- **CORS protection** configured for security

### Change Default Password

1. **Via Admin Panel:** Login and create a new user account
2. **Via Database:** Use SQLite tools to update the users table
3. **Via Code:** Modify the default user creation in `server.js`

## Deployment

### Production Setup

1. **Environment Variables:**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export SESSION_SECRET=your-secret-key
   ```

2. **SSL/HTTPS:** Configure reverse proxy (nginx) for HTTPS

3. **Database Backup:** Regular backups of `portfolio.db`

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details