# Portfolio Application Deployment Strategy

This document outlines the step-by-step process for deploying the PersonalPortfolio application to production following the SOP for Single-Repo CI/CD to Secure Production.

## Overview

- **Application**: PersonalPortfolio (Node.js/Express with SQLite backend)
- **Production Path**: `/srv/prod/sites/portfolio`
- **Service Name**: `portfolio`
- **Public Hostname**: `portfolio.organictechs.com`
- **Image Repository**: `ghcr.io/joon628/personalportfolio`

## Prerequisites Verification

### 1. Production Server Requirements
- [x] Cloudflare Tunnel container (`cloudflared`) configured
- [x] Traefik reverse proxy with Docker provider
- [x] Compose path exists: `/srv/prod/docker-compose.yml`
- [x] UFW configured with default-deny, SSH only on `tailscale0`
- [x] Docker logged into GHCR with read-only PAT

### 2. Development Server Requirements
- [ ] Self-hosted GitHub Actions runner registered
- [ ] Docker context configured for prod: `ssh://prod`
- [ ] Tailscale SSH access to production

## Step-by-Step Deployment Process

### Phase 1: Repository Configuration

#### Step 1.1: Verify Dockerfile Configuration
**Status**: ✅ Completed

The existing Dockerfile is properly configured with:
- Node.js 18 Alpine base image
- Non-root user setup (portfolio:nodejs)
- Health check endpoint configured
- Proper permission handling with entrypoint script
- Port 3002 exposed

**Security Considerations**:
- Uses Alpine Linux for minimal attack surface
- Runs as non-root user
- Includes health check for monitoring

#### Step 1.2: Set GitHub Repository Variables
**Action Required**: Configure the following variables in GitHub repository settings:

```
APP_NAME: portfolio
IMAGE_REPO: ghcr.io/joon628/personalportfolio
SERVICE_NAME: portfolio
PUBLIC_HOSTNAME: portfolio.organictechs.com
PROD_COMPOSE_PATH: /srv/prod/docker-compose.yml
PROD_DOCKER_CONTEXT: prod
HEALTHCHECK_URL: https://portfolio.organictechs.com/api/portfolio/public
```

**Location**: Repository → Settings → Secrets and variables → Actions → Variables

### Phase 2: CI/CD Pipeline Setup

#### Step 2.1: Create GitHub Actions Workflow
**Action Required**: Create `.github/workflows/deploy.yml`

This workflow will:
1. Build Docker image on GitHub-hosted runners
2. Push to GitHub Container Registry (GHCR)
3. Deploy via self-hosted runner on Dev server
4. Use manual approval for production deployment

#### Step 2.2: Configure Environment Protection
**Action Required**: Set up production environment in GitHub:
1. Go to Repository → Settings → Environments
2. Create "production" environment
3. Enable required reviewers
4. Add protection rules as needed

### Phase 3: Production Configuration

#### Step 3.1: Verify Production Compose Entry
**Action Required**: Confirm the following exists in `/srv/prod/docker-compose.yml`:

```yaml
services:
  portfolio:
    image: ghcr.io/joon628/personalportfolio:main
    container_name: prod-portfolio
    volumes:
      - /srv/prod/sites/portfolio/data:/app/data
      - /srv/prod/sites/portfolio/portfolio.db:/app/portfolio.db
    environment:
      - NODE_ENV=production
      - PORT=3002
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portfolio.rule=Host(`portfolio.organictechs.com`)"
      - "traefik.http.routers.portfolio.entrypoints=web"
      - "traefik.http.routers.portfolio.middlewares=chain-secure@file"
      - "traefik.http.services.portfolio.loadbalancer.server.port=3002"
    networks:
      - proxy
    restart: unless-stopped
```

#### Step 3.2: Prepare Production Data Directory
**Action Required**: On production server:

```bash
# Create data directory structure
sudo mkdir -p /srv/prod/sites/portfolio/data
sudo chown 1001:1001 /srv/prod/sites/portfolio/data

# If migrating existing data
sudo cp /path/to/existing/portfolio.db /srv/prod/sites/portfolio/
sudo chown 1001:1001 /srv/prod/sites/portfolio/portfolio.db
```

### Phase 4: Deployment Execution

#### Step 4.1: Initial Manual Deployment (Optional)
For initial setup or troubleshooting:

```bash
# From Dev server with prod context
docker --context prod compose -f /srv/prod/docker-compose.yml pull portfolio
docker --context prod compose -f /srv/prod/docker-compose.yml up -d portfolio
```

#### Step 4.2: Trigger CI/CD Pipeline
1. Push to main branch or manually trigger workflow
2. Monitor build phase completion
3. Approve production deployment when prompted
4. Verify health check passes

### Phase 5: Post-Deployment Validation

#### Step 5.1: Verify Service Health
```bash
# Check container status
docker --context prod compose -f /srv/prod/docker-compose.yml ps portfolio

# Check logs
docker --context prod compose -f /srv/prod/docker-compose.yml logs -f portfolio

# Verify Traefik routing
docker --context prod logs prod-traefik-1 | grep portfolio
```

#### Step 5.2: Application Validation
1. Access https://portfolio.organictechs.com
2. Verify all sections load properly
3. Test admin panel at /admin
4. Confirm data persistence

## Security Checklist

- [x] No SSH from GitHub-hosted runners to production
- [x] No inbound ports opened on production
- [x] GHCR credentials stay on production (read-only)
- [x] Build uses GITHUB_TOKEN with minimal permissions
- [x] Deploy runs on self-hosted runner via Docker context
- [x] Manual approval required for production deployment
- [x] Application runs as non-root user
- [x] Database files have proper permissions

## Rollback Procedure

### Quick Rollback to Previous Version
```bash
# From Dev server or any tailnet shell
# 1. Find previous working image SHA
docker --context prod images | grep personalportfolio

# 2. Update service to use previous image
docker --context prod compose -f /srv/prod/docker-compose.yml exec portfolio sh -c "sed -i 's/:main/:OLD_SHA/' docker-compose.yml"

# 3. Redeploy
docker --context prod compose -f /srv/prod/docker-compose.yml pull portfolio
docker --context prod compose -f /srv/prod/docker-compose.yml up -d portfolio
```

## Troubleshooting Guide

### Issue: 404 Error on Public URL
**Solution**: Check Traefik routing
```bash
docker --context prod logs prod-traefik-1 | grep -i "portfolio\|router"
```

### Issue: Container Won't Start
**Solution**: Check logs and permissions
```bash
docker --context prod compose -f /srv/prod/docker-compose.yml logs portfolio
ls -la /srv/prod/sites/portfolio/
```

### Issue: Database Access Errors
**Solution**: Verify file permissions
```bash
sudo chown 1001:1001 /srv/prod/sites/portfolio/portfolio.db
sudo chmod 644 /srv/prod/sites/portfolio/portfolio.db
```

### Issue: Health Check Failing
**Solution**: Test endpoint directly
```bash
docker --context prod compose -f /srv/prod/docker-compose.yml exec portfolio wget -O- http://localhost:3002/api/portfolio/public
```

## Success Criteria

1. ✅ Application accessible at https://portfolio.organictechs.com
2. ✅ Admin panel functional with authentication
3. ✅ Data persists across container restarts
4. ✅ Health checks passing
5. ✅ No security vulnerabilities exposed
6. ✅ CI/CD pipeline triggers on push to main
7. ✅ Manual approval gates working
8. ✅ Rollback procedure tested

## Additional Security Validations

### Pre-Deployment Security Checklist
1. **Dockerfile Security**
   - ✅ Uses Alpine Linux (minimal attack surface)
   - ✅ Non-root user configured (portfolio:nodejs, UID 1001)
   - ✅ Entrypoint script drops privileges with su-exec
   - ✅ No sensitive data or secrets in image layers
   - ✅ Health check endpoint configured

2. **Application Security**
   - ✅ Database file permissions handled by entrypoint
   - ✅ Session secrets loaded from environment
   - ✅ Admin authentication with bcrypt hashing
   - ✅ No hardcoded credentials in source

3. **Network Security**
   - ✅ Application binds to 0.0.0.0:3002 (container-only)
   - ✅ Traefik handles TLS termination
   - ✅ Security middleware chain applied
   - ✅ No direct host port exposure in production

### Runtime Security Monitoring
```bash
# Check for exposed secrets
docker --context prod compose -f /srv/prod/docker-compose.yml exec portfolio env | grep -i secret

# Verify non-root execution
docker --context prod compose -f /srv/prod/docker-compose.yml exec portfolio ps aux | grep node

# Check file permissions
docker --context prod compose -f /srv/prod/docker-compose.yml exec portfolio ls -la /app/portfolio.db
```

## Notes for Future Deployments

1. This strategy can be adapted for other single-repo applications
2. Key variables to change: APP_NAME, SERVICE_NAME, PUBLIC_HOSTNAME
3. Ensure production compose entry matches the service requirements
4. Always test rollback procedure after first successful deployment
5. Monitor Traefik and container logs during initial deployments
6. Review security checklist before each major update
7. Keep read-only GHCR token on production server updated