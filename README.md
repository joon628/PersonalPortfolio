# Portfolio Website

A modern portfolio website built with Strapi CMS and static frontend.

## Architecture

- **Frontend**: Static HTML/CSS/JS served by Nginx
- **Backend**: Strapi v5 CMS with SQLite database
- **Deployment**: Docker containers with docker-compose

## Project Structure

```
.
├── index.html              # Main portfolio page
├── styles.css              # Styling
├── script.js               # UI interactions
├── api-client-strapi.js    # Strapi API client
├── data-loader.js          # Data loading and DOM manipulation
├── strapi/                 # Strapi CMS directory
│   ├── src/               # Strapi source code
│   │   └── api/          # Content types definitions
│   ├── config/           # Strapi configuration
│   └── package.json      # Strapi dependencies
├── Dockerfile.frontend     # Frontend Docker image
├── Dockerfile.strapi       # Strapi Docker image
└── docker-compose.yml      # Multi-container orchestration
```

## Content Types

The portfolio uses the following Strapi content types:
- About (Single Type)
- Contact (Single Type)
- Experience (Collection)
- Research (Collection)
- Skills (Collection)
- Certifications (Collection)
- Projects (Collection)
- Education (Collection)
- Publications (Collection)
- Patents (Collection)
- Honors & Awards (Collection)
- Service & Leadership (Collection)
- Professional Affiliations (Collection)
- Languages (Collection)

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

1. **Install Strapi dependencies**:
   ```bash
   cd strapi
   npm install
   ```

2. **Start Strapi in development mode**:
   ```bash
   cd strapi
   npm run develop
   ```

   Strapi admin panel will be available at http://localhost:1337/admin

3. **Serve frontend** (in a separate terminal):
   ```bash
   # Simple Python server
   python3 -m http.server 8000

   # Or use any static file server
   npx serve .
   ```

   Frontend will be available at http://localhost:8000

### First Time Setup

1. Access Strapi admin at http://localhost:1337/admin
2. Create your admin account
3. Add content to the various content types
4. The frontend will automatically fetch and display the data

## Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Setup

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and generate secure random values for all secrets:
   ```bash
   # Generate secure random strings
   openssl rand -base64 32
   ```

2. **Build and start containers**:
   ```bash
   docker-compose up -d
   ```

3. **Access the services**:
   - Frontend: http://localhost:3000
   - Strapi Admin: http://localhost:1337/admin
   - Strapi API: http://localhost:1337/api

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Remove everything including volumes (data)
docker-compose down -v
```

## Data Persistence

- **Strapi Database**: Stored in Docker volume `strapi-data` (SQLite in `.tmp/data.db`)
- **Uploads**: Stored in Docker volume `strapi-uploads`

To backup your data:
```bash
# Backup database
docker cp portfolio-strapi:/app/.tmp/data.db ./backup-data.db

# Backup uploads
docker cp portfolio-strapi:/app/public/uploads ./backup-uploads
```

## API Client

The frontend uses `api-client-strapi.js` to fetch data from Strapi. It includes:
- Automatic date-based sorting for content
- Smart date parsing for various formats
- Error handling and fallbacks

## Sorting

Content is automatically sorted by date in descending order (newest first):
- **Experiences**: By `startDate`
- **Research**: By `period`
- **Projects**: By `date`
- **Publications**: By `year`
- **Patents**: By `filingDate`
- **Honors**: By `date`
- **Service**: By `period`
- **Affiliations**: By `period`
- **Certifications**: By `date`

The sorting is done client-side to handle various date formats correctly.

## Troubleshooting

### Strapi won't start
- Check if port 1337 is available
- Verify environment variables in `.env`
- Check logs: `docker-compose logs strapi`

### Frontend can't connect to Strapi
- Ensure Strapi container is healthy: `docker-compose ps`
- Check network connectivity between containers
- Verify CORS settings in Strapi

### Data not displaying
- Check browser console for errors
- Verify content is published in Strapi admin
- Check API responses in Network tab

## Production Deployment

For production deployment:

1. Use proper environment variables (not defaults)
2. Set up reverse proxy (nginx/traefik) for SSL
3. Use external database instead of SQLite for better performance
4. Configure proper backup strategy
5. Set up monitoring and logging

See `SOP_Single_Repo_CICD_to_Prod.md` for detailed deployment procedures.

## License

Private - All Rights Reserved
