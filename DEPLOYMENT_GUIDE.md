# Portfolio Deployment Guide

This guide covers deploying the portfolio website with Strapi CMS to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ User Browser                                                 │
│  ↓                                                           │
│ https://portfolio.organictechs.com                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Tunnel + Traefik (Reverse Proxy)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Frontend Container (Nginx)                                   │
│                                                              │
│  • Serves static HTML/CSS/JS                                │
│  • Proxies /api/* → http://portfolio-strapi:1337/api/*     │
│  • Proxies /uploads/* → http://portfolio-strapi:1337/uploads/* │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (Docker internal network)
┌─────────────────────────────────────────────────────────────┐
│ Strapi CMS Container (NOT publicly accessible)              │
│                                                              │
│  • Runs on port 1337 (internal only)                        │
│  • SQLite database + uploads                                │
│  • Admin panel: only via SSH tunnel or Tailscale            │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### 1. Production Server Setup (Already Done)
- ✅ Cloudflare Tunnel configured
- ✅ Traefik reverse proxy running
- ✅ Docker registry at localhost:5000
- ✅ Existing portfolio service in /srv/prod/docker-compose.yml

### 2. Development Server Setup (Already Done)
- ✅ Self-hosted GitHub Actions runner
- ✅ SSH access to production via Tailscale
- ✅ Docker context configured

### 3. Generate Strapi Secrets

On the production server, generate 5 secure random strings:

```bash
# SSH into production
ssh joon628@prod

# Generate secrets (run this 5 times)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Save the output and add to `/srv/prod/.env`:

```bash
# Add these to /srv/prod/.env
PORTFOLIO_STRAPI_APP_KEYS=key1,key2,key3,key4
PORTFOLIO_STRAPI_API_TOKEN_SALT=generated_salt
PORTFOLIO_STRAPI_ADMIN_JWT_SECRET=generated_secret
PORTFOLIO_STRAPI_TRANSFER_TOKEN_SALT=generated_salt
PORTFOLIO_STRAPI_JWT_SECRET=generated_secret
```

## Deployment Steps

### Step 1: Update Production Docker Compose

Edit `/srv/prod/docker-compose.yml` on production server:

```bash
ssh joon628@prod
cd /srv/prod
nano docker-compose.yml
```

**Update the existing `portfolio` service:**

```yaml
  portfolio:
      image: localhost:5000/portfolio-frontend:main  # CHANGED
      container_name: prod-portfolio
      networks: [proxy]
      labels:
        - traefik.enable=true
        - traefik.http.routers.portfolio.rule=Host(`portfolio.organictechs.com`)
        - traefik.http.routers.portfolio.entrypoints=web
        - traefik.http.routers.portfolio.middlewares=chain-secure@file
        - traefik.http.services.portfolio.loadbalancer.server.port=80  # CHANGED
      restart: unless-stopped
```

**Add the new `portfolio-strapi` service:**

```yaml
  portfolio-strapi:
    image: localhost:5000/portfolio-strapi:main
    container_name: portfolio-strapi
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=1337
      - APP_KEYS=${PORTFOLIO_STRAPI_APP_KEYS}
      - API_TOKEN_SALT=${PORTFOLIO_STRAPI_API_TOKEN_SALT}
      - ADMIN_JWT_SECRET=${PORTFOLIO_STRAPI_ADMIN_JWT_SECRET}
      - TRANSFER_TOKEN_SALT=${PORTFOLIO_STRAPI_TRANSFER_TOKEN_SALT}
      - JWT_SECRET=${PORTFOLIO_STRAPI_JWT_SECRET}
    volumes:
      - /srv/prod/sites/portfolio/strapi-data:/app/.tmp
      - /srv/prod/sites/portfolio/strapi-uploads:/app/public/uploads
    networks: [proxy]
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:1337/_health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

Save and exit.

### Step 2: Configure GitHub Repository

Go to your repository settings on GitHub:

**Variables** (Settings → Secrets and variables → Actions → Variables):
- `APP_NAME`: `portfolio`
- `FRONTEND_SERVICE`: `portfolio`
- `STRAPI_SERVICE`: `portfolio-strapi`
- `PROD_COMPOSE_PATH`: `/srv/prod/docker-compose.yml`
- `HEALTHCHECK_URL`: `https://portfolio.organictechs.com`

**Secrets** (should already exist):
- `REGISTRY_USER`: Your local registry username
- `REGISTRY_PASS`: Your local registry password

### Step 3: Deploy

Push to the main branch to trigger deployment:

```bash
git add .
git commit -m "Deploy portfolio with Strapi CMS"
git push origin main
```

The GitHub Actions workflow will:
1. ✅ Build frontend image → `localhost:5000/portfolio-frontend:main`
2. ✅ Build Strapi image → `localhost:5000/portfolio-strapi:main`
3. ✅ Check if data migration is needed
4. ✅ If first deploy: transfer SQLite database and uploads to production
5. ✅ Deploy frontend service
6. ✅ Deploy Strapi service
7. ✅ Run health checks

### Step 4: Verify Deployment

1. **Check frontend:** Visit https://portfolio.organictechs.com
2. **Check containers:**
   ```bash
   ssh joon628@prod "cd /srv/prod && docker compose ps portfolio portfolio-strapi"
   ```

## Accessing Strapi Admin Panel

Strapi is **NOT publicly accessible**. Use one of these methods:

### Option 1: SSH Tunnel (Recommended)

From your local machine:
```bash
ssh -L 1337:localhost:1337 joon628@prod
```

Then open: http://localhost:1337/admin

### Option 2: Tailscale

Find production server's Tailscale IP:
```bash
tailscale status | grep prod
```

Open: http://<prod-tailscale-ip>:1337/admin

### Option 3: Direct SSH + curl

```bash
ssh joon628@prod
curl http://localhost:1337/admin
```

## Data Migration

### Automatic Migration (First Deploy)

The workflow automatically migrates data on first deploy:
- **SQLite Database:** `strapi/.tmp/data.db` → `/srv/prod/sites/portfolio/strapi-data/data.db`
- **Uploads:** `strapi/public/uploads/` → `/srv/prod/sites/portfolio/strapi-uploads/`

### Manual Migration (Force Re-migration)

To force re-migration:

```bash
ssh joon628@prod
rm -rf /srv/prod/sites/portfolio/strapi-data
rm -rf /srv/prod/sites/portfolio/strapi-uploads
```

Then re-run the GitHub Actions workflow.

### Backup Strapi Data

To backup current production data:

```bash
ssh joon628@prod
cd /srv/prod/sites/portfolio
tar -czf strapi-backup-$(date +%Y%m%d).tar.gz strapi-data strapi-uploads
```

## Troubleshooting

### Frontend shows "Error loading data"

1. Check if Strapi is running:
   ```bash
   ssh joon628@prod "docker logs portfolio-strapi --tail 50"
   ```

2. Check if nginx can reach Strapi:
   ```bash
   ssh joon628@prod "docker exec prod-portfolio wget -O- http://portfolio-strapi:1337/_health"
   ```

3. Check browser console for API errors

### Can't access Strapi admin

1. Verify Strapi is running:
   ```bash
   ssh joon628@prod "docker compose ps portfolio-strapi"
   ```

2. Check logs:
   ```bash
   ssh joon628@prod "docker logs portfolio-strapi --tail 100"
   ```

3. Try direct curl:
   ```bash
   ssh joon628@prod "curl http://localhost:1337/_health"
   ```

### Database migration failed

Check permissions:
```bash
ssh joon628@prod "ls -la /srv/prod/sites/portfolio/strapi-data"
```

Should be owned by UID 1000 (Strapi container user).

## Rollback

To rollback to previous version:

```bash
ssh joon628@prod
cd /srv/prod

# Rollback frontend
docker tag localhost:5000/portfolio-frontend:main localhost:5000/portfolio-frontend:backup
docker pull localhost:5000/portfolio-frontend:<previous-sha>
docker tag localhost:5000/portfolio-frontend:<previous-sha> localhost:5000/portfolio-frontend:main
docker compose up -d portfolio

# Rollback Strapi (if needed)
docker tag localhost:5000/portfolio-strapi:main localhost:5000/portfolio-strapi:backup
docker pull localhost:5000/portfolio-strapi:<previous-sha>
docker tag localhost:5000/portfolio-strapi:<previous-sha> localhost:5000/portfolio-strapi:main
docker compose up -d portfolio-strapi
```

## Updating Content

1. Create SSH tunnel to Strapi admin: `ssh -L 1337:localhost:1337 joon628@prod`
2. Open http://localhost:1337/admin
3. Login and edit content
4. Changes are immediately reflected on the public website
5. No redeployment needed for content updates!

## Network Architecture

- **Frontend Container:** Listens on port 80 (internal), exposed via Traefik
- **Strapi Container:** Listens on port 1337 (internal only, not exposed)
- **Docker Network:** Both on `proxy` network for inter-container communication
- **API Proxy:** Nginx in frontend proxies `/api/*` to `http://portfolio-strapi:1337/api/*`

This keeps Strapi completely private while allowing the public website to access it.
