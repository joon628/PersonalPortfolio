# SOP — Single‑Repo CI/CD to Secure Production
**Stack:** Cloudflare Tunnel + Traefik + Docker/Compose + Tailscale SSH + GitHub Actions (GHCR or Local Registry)

This SOP describes how a **single repository** should build a Docker image, publish it to a registry (GHCR or local), and **safely deploy** one service to the Production server that is fronted by Cloudflare Tunnel and Traefik. It is written so an agent (e.g., Claude) or a teammate can implement CI/CD **without breaking security**.

---

## 1) Purpose (what this repo must do)
This repository contains **one deployable application** packaged as a Docker image. CI/CD must:

- Build an image and push to a registry (**GHCR** or **local Docker registry**).
- Deploy to **Production** by pulling the image and restarting **one Compose service** on the Prod host.
- **Never** open router ports. **Never** SSH from a GitHub‑hosted runner into Prod.
- Use a **self‑hosted runner on the Dev server** to run the deploy step over **Tailscale SSH**.

### Registry Options:
- **Option A: GHCR** - Use GitHub Container Registry (500MB free tier)
- **Option B: Local Registry** - Self-hosted registry on production (unlimited storage)

---

## 2) Production “contract” (what already exists)
CI/CD assumes the following are already present on the **Prod** host:

- **Ingress:** Cloudflare **Tunnel** container (`cloudflared`) forwards public hostnames → `http://traefik:80` on a Docker network.
- **Reverse proxy:** **Traefik** (Docker provider) routes based on Docker **labels**. A security middleware chain (`chain-secure@file`) applies HSTS, frame deny, nosniff, and a light global rate‑limit.
- **Compose path:** `/srv/prod/docker-compose.yml`.
- **Service name:** **`$SERVICE_NAME`** (e.g., `inproc`, `portfolio`, `wiki`) in the Prod compose.
- **Public hostname:** **`$PUBLIC_HOSTNAME`** routed to this service by Traefik labels.
- **UFW/SSH:** UFW default‑deny; **SSH allowed only on `tailscale0`**. No listeners on host 80/443. Host nginx is disabled/masked.
- **Registry access on Prod:** 
  - For GHCR: Docker is logged in with a **read‑only PAT** (`read:packages`)
  - For Local Registry: Registry runs on `localhost:5000` with htpasswd auth

> CI/CD will **not** alter Prod networking, UFW, Traefik labels, or Tunnel settings.

---

## 3) Repo‑level configuration

### For GHCR (Option A)
Define in **Repository → Settings → Variables**:
- `APP_NAME` — short slug for the app (e.g., `inprocessing`, `portfolio`)
- `IMAGE_REPO` — `ghcr.io/<OWNER>/<APP_NAME>`
- `SERVICE_NAME` — exact Compose service name on Prod (e.g., `inproc`, `portfolio`)
- `PUBLIC_HOSTNAME` — e.g., `inprocessing.organictechs.com`
- `PROD_COMPOSE_PATH` — `/srv/prod/docker-compose.yml`
- `PROD_DOCKER_CONTEXT` — `prod` (Docker context on Dev → `ssh://prod`)
- `HEALTHCHECK_URL` — e.g., `https://${PUBLIC_HOSTNAME}/health` (or `/`)

### For Local Registry (Option B)
Same as above, except:
- `IMAGE_REPO` — Not needed (hardcoded to `localhost:5000/<APP_NAME>`)

Add in **Repository → Settings → Secrets**:
- `REGISTRY_USER` — Username for local registry
- `REGISTRY_PASS` — Password for local registry

---

## 4) Security rules for CI/CD (non‑negotiable)
1. **Build** runs on **GitHub‑hosted** runners; pushes to GHCR using the workflow’s **`GITHUB_TOKEN`** with `packages:write` permission.
2. **Deploy** runs on a **self‑hosted runner** on the **Dev** server. It talks to Prod via Docker **context** `ssh://prod`.  
   The deploy job **does not** carry registry creds; Prod already has read‑only GHCR login.
3. **Environment protection:** the deploy job targets the `production` environment with **manual approval** required.
4. **No inbound ports** to Prod; **no** SSH from public runners; **no** secrets in Git. Prod `.env` files stay on Prod.

---

## 5) Repository structure (single app)
```
.
├─ Dockerfile
├─ .dockerignore
├─ (app source code)
└─ .github/
   └─ workflows/
      └─ deploy.yml
```

### Dockerfile templates
**Static build → Nginx (SPA or exported SSR):**
```dockerfile
# build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   # outputs to /app/dist (adjust if /build or /out)

# serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

**Node SSR (Next.js / Express):**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm","run","start"]    # ensure it listens on 0.0.0.0:3000
```

**Tagging convention:**
- Immutable: `:${{ github.sha }}`
- Mutable release pointer: `:main`

---

## 6) One‑time prerequisites (outside this repo)
**On Dev (self‑hosted runner):**
- Register a **self‑hosted Actions runner** (dedicated to this repo; label e.g. `dev-runner`).
- Install Docker.
- Create a Docker context to Prod (via Tailscale SSH):
  ```bash
  # Include explicit username if needed
  docker context create prod --docker "host=ssh://USERNAME@prod"
  docker --context prod info
  ```
  **Note**: Ensure SSH config has proper Host entry for 'prod' with Tailscale hostname

**On Prod:**
For GHCR (Option A):
- Log in to GHCR with **read‑only PAT** (`read:packages` only):
  ```bash
  echo 'READONLY_GHCR_PAT' | docker login ghcr.io -u YOUR_GH_USERNAME --password-stdin
  ```

For Local Registry (Option B):
- Set up Docker registry with authentication:
  ```bash
  # Create registry directories
  sudo mkdir -p /srv/registry/{data,auth}
  
  # Create registry user (replace 'reguser' with your username)
  sudo htpasswd -Bc /srv/registry/auth/htpasswd reguser
  
  # Add registry service to docker-compose.yml
  ```
- Add registry service to `/srv/prod/docker-compose.yml`:
  ```yaml
  registry:
    image: registry:2
    container_name: docker-registry
    restart: unless-stopped
    ports:
      - "127.0.0.1:5000:5000"  # Only localhost access
    environment:
      REGISTRY_AUTH: htpasswd
      REGISTRY_AUTH_HTPASSWD_PATH: /auth/htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: Registry Realm
      REGISTRY_STORAGE_DELETE_ENABLED: "true"
    volumes:
      - /srv/registry/data:/var/lib/registry
      - /srv/registry/auth:/auth
    networks:
      - proxy
  ```

For Both Options:
- Ensure your service `${SERVICE_NAME}` exists in `/srv/prod/docker-compose.yml` with correct **Traefik labels** for `${PUBLIC_HOSTNAME}` and middleware `chain-secure@file`.

---

## 7) GitHub Actions workflow (build → deploy)

### Option A: GHCR Workflow
Create `.github/workflows/deploy.yml` for GHCR:

```yaml
name: Build & Deploy (single repo)

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  APP_NAME:        ${{ vars.APP_NAME }}
  IMAGE_REPO:      ${{ vars.IMAGE_REPO }}
  SERVICE_NAME:    ${{ vars.SERVICE_NAME }}
  PROD_CONTEXT:    ${{ vars.PROD_DOCKER_CONTEXT || 'prod' }}
  PROD_COMPOSE:    ${{ vars.PROD_COMPOSE_PATH || '/srv/prod/docker-compose.yml' }}
  HEALTHCHECK_URL: ${{ vars.HEALTHCHECK_URL }}

concurrency:
  group: deploy-${{ github.ref_name }}-${{ env.SERVICE_NAME }}
  cancel-in-progress: false

jobs:
  build:
    name: Build & Push Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        run: echo "${{ github.token }}" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

      - name: Build & push
        env:
          IMAGE: ${{ env.IMAGE_REPO }}
          SHA:   ${{ github.sha }}
        run: |
          docker build -t $IMAGE:$SHA -t $IMAGE:main .
          docker push  $IMAGE:$SHA
          docker push  $IMAGE:main

  deploy:
    name: Deploy to Production
    needs: build
    runs-on: self-hosted          # Dev runner
    environment: production       # requires manual approval
    timeout-minutes: 20
    steps:
      - name: Ensure Docker context to Prod
        run: |
          # Remove existing context if it exists (ensures fresh connection)
          docker context rm ${{ env.PROD_CONTEXT }} 2>/dev/null || true
          
          # Create context with explicit username
          # Replace USERNAME with your actual SSH username
          docker context create ${{ env.PROD_CONTEXT }} --docker "host=ssh://USERNAME@prod"
          
          # Verify connection
          docker --context ${{ env.PROD_CONTEXT }} info

      - name: Pull new image on Prod
        run: |
          # Use direct SSH for compose commands to avoid file path issues
          ssh USERNAME@prod "cd /srv/prod && docker compose pull ${{ env.SERVICE_NAME }}"

      - name: Restart service on Prod
        run: |
          ssh USERNAME@prod "cd /srv/prod && docker compose up -d ${{ env.SERVICE_NAME }}"
          ssh USERNAME@prod "cd /srv/prod && docker compose ps ${{ env.SERVICE_NAME }}"

      - name: Health check
        if: ${{ env.HEALTHCHECK_URL != '' }}
        run: |
          URL="${{ env.HEALTHCHECK_URL }}"
          echo "Checking $URL"
          for i in {1..15}; do
            code=$(curl -fsS -o /dev/null -w "%{http_code}" "$URL" || true)
            if [ "$code" = "200" ] || [ "$code" = "204" ]; then
              echo "Healthy ($code)"
              exit 0
            fi
            echo "Attempt $i: got $code, retrying..."
            sleep 4
          done
          echo "Health check failed"
          exit 1
```

**What this does:**
- Builds the image with tags `:${sha}` and `:main` and pushes to GHCR.
- On approval, the Dev runner uses the **Prod Docker context** to pull and restart `${SERVICE_NAME}` only.
- Health‑checks `${HEALTHCHECK_URL}` (tweak path to your app endpoint).

### Option B: Local Registry Workflow
Create `.github/workflows/deploy.yml` for local registry:

```yaml
name: Build & Deploy to Local Registry

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  APP_NAME:        ${{ vars.APP_NAME }}
  SERVICE_NAME:    ${{ vars.SERVICE_NAME }}
  PROD_COMPOSE:    ${{ vars.PROD_COMPOSE_PATH || '/srv/prod/docker-compose.yml' }}
  HEALTHCHECK_URL: ${{ vars.HEALTHCHECK_URL }}

concurrency:
  group: deploy-${{ github.ref_name }}-${{ vars.SERVICE_NAME }}
  cancel-in-progress: false

jobs:
  build-and-deploy:
    name: Build & Deploy to Production
    runs-on: self-hosted          # Dev runner
    environment: production       # requires manual approval
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - name: Set up SSH tunnel to production registry
        run: |
          # Kill any existing tunnel
          pkill -f "ssh.*-L 5000:localhost:5000" || true
          
          # Create SSH tunnel to production registry
          ssh -f -N -L 5000:localhost:5000 USERNAME@prod
          
          # Wait for tunnel to be established
          sleep 2

      - name: Login to production registry
        run: |
          echo '${{ secrets.REGISTRY_PASS }}' | docker login localhost:5000 -u '${{ secrets.REGISTRY_USER }}' --password-stdin

      - name: Build and push image
        env:
          IMAGE: localhost:5000/${{ env.APP_NAME }}
          SHA:   ${{ github.sha }}
        run: |
          # Build the image
          docker build -t $IMAGE:$SHA -t $IMAGE:main .
          
          # Push to production registry through tunnel
          docker push $IMAGE:$SHA
          docker push $IMAGE:main

      - name: Deploy on production
        run: |
          # Update the service to use the new image
          ssh USERNAME@prod "cd /srv/prod && docker compose pull ${{ env.SERVICE_NAME }}"
          ssh USERNAME@prod "cd /srv/prod && docker compose up -d ${{ env.SERVICE_NAME }}"
          ssh USERNAME@prod "cd /srv/prod && docker compose ps ${{ env.SERVICE_NAME }}"

      - name: Clean up SSH tunnel
        if: always()
        run: |
          pkill -f "ssh.*-L 5000:localhost:5000" || true

      - name: Health check
        if: ${{ env.HEALTHCHECK_URL != '' }}
        run: |
          URL="${{ env.HEALTHCHECK_URL }}"
          echo "Checking $URL"
          for i in {1..15}; do
            code=$(curl -fsS -o /dev/null -w "%{http_code}" "$URL" || true)
            if [ "$code" = "200" ] || [ "$code" = "204" ]; then
              echo "Healthy ($code)"
              exit 0
            fi
            echo "Attempt $i: got $code, retrying..."
            sleep 4
          done
          echo "Health check failed"
          exit 1
```

**Benefits of Local Registry:**
- **No storage limits** (unlike GHCR's 500MB free tier)
- **Faster deployments** (no external registry dependencies)
- **Complete control** over your container images
- **No GitHub Actions minutes** used for builds

> Remember to replace `USERNAME` with your actual SSH username and ensure the service image in production compose points to `localhost:5000/APP_NAME:main`

---

## 8) Rollbacks
Manual rollback (from Dev runner or any tailnet shell):
1. Identify the previous image tag/sha in GHCR.
2. Temporarily pin the service image in Prod compose to that tag:
   ```yaml
   image: ghcr.io/<owner>/<app>:<OLD_SHA>
   ```
3. Redeploy:
   ```bash
   docker --context prod compose -f /srv/prod/docker-compose.yml pull ${SERVICE_NAME}
   docker --context prod compose -f /srv/prod/docker-compose.yml up -d ${SERVICE_NAME}
   ```

You can script rollbacks in CI by recording the last good SHA as an artifact or using GHCR API to select the previous tag.

---

## 9) Common Issues and Solutions (Lessons Learned)

### Docker Context Issues
- **Problem**: "context already exists" error
  - **Solution**: Remove and recreate context in workflow to ensure fresh connection
  
- **Problem**: Docker compose can't find remote files when using context
  - **Solution**: Use direct SSH commands instead of Docker context for compose operations
  - Example: `ssh user@prod "cd /srv/prod && docker compose up -d service"`

### SSH Connection Issues
- **Problem**: Docker context fails to connect via SSH
  - **Solution**: Include explicit username in SSH URL: `ssh://USERNAME@prod`
  - Ensure SSH config has proper Host entry with Tailscale hostname

### GitHub Actions Issues
- **Problem**: Can't push workflow files with OAuth authentication
  - **Solution**: Use SSH remote or PAT with workflow scope
  - Set remote: `git remote set-url origin git@github.com:owner/repo.git`

### Production Compose Configuration
- **Problem**: Service configured for static nginx instead of application
  - **Solution**: Update compose entry with proper port mapping and environment:
    ```yaml
    labels:
      - traefik.http.services.SERVICE.loadbalancer.server.port=PORT
    ```

### Registry and Storage Issues
- **Problem**: GHCR storage limits (500MB free tier)
  - **Solution**: Self-hosted Docker registry on production server
  - **Benefits**: Unlimited storage, faster deployments, complete control

- **Problem**: "Cannot perform an interactive login from a non TTY device"
  - **Solution**: Ensure GitHub secrets are properly set and not empty
  - Use single quotes: `echo '${{ secrets.PASSWORD }}'`

- **Problem**: No application files in `/srv/prod/sites/APP` directory
  - **Explanation**: Application code lives inside Docker images, not on filesystem
  - Only persistent data (databases, uploads) stored locally

## 10) Original Troubleshooting
- **404 via public URL** → Check Traefik for router presence:
  ```bash
  docker logs prod-traefik-1 | grep -i "${SERVICE_NAME}\|router"
  ```
  If missing/wrong, fix **labels on Prod** (not in CI).

- **Tunnel healthy but “Welcome to nginx”** → You’re running the placeholder nginx image or no content volume. Deploy the real image.

- **Image pull denied on Prod** → Re‑login GHCR read‑only PAT on Prod:
  ```bash
  echo 'READONLY_GHCR_PAT' | docker login ghcr.io -u YOUR_GH_USERNAME --password-stdin
  ```

- **Dev runner can’t reach Prod** → Verify Tailscale, MagicDNS, and Docker context:
  ```bash
  tailscale status   # on Dev
  docker --context prod info
  ```

---

## 11) Quick Start Checklist

### Pre-deployment Verification
- [ ] Self-hosted runner installed on Dev server with label `dev-runner`
- [ ] SSH config on Dev has entry for `prod` with Tailscale hostname
- [ ] Production server has Docker logged into GHCR with read-only PAT
- [ ] Production compose file exists at `/srv/prod/docker-compose.yml`
- [ ] Service entry in production compose has proper Traefik labels

### Repository Setup
1. [ ] Create GitHub repository variables (Settings → Actions → Variables)
2. [ ] Create production environment with manual approval
3. [ ] Add `.github/workflows/deploy.yml` (remember to replace USERNAME)
4. [ ] Ensure Dockerfile properly configured for your application
5. [ ] Test SSH connection from Dev to Prod: `ssh USERNAME@prod`

### First Deployment
1. [ ] Create production data directories with proper permissions
2. [ ] Copy any existing data files (e.g., databases) to production
3. [ ] Push to main branch to trigger workflow
4. [ ] Approve production deployment when prompted
5. [ ] Verify application accessible at public URL

## 12) Final checklist (for the agent/implementer)
- Use **GitHub‑hosted** runners to **build**; use **self‑hosted (Dev)** to **deploy** via Docker context `ssh://prod`.
- Do **not** add SSH keys or open ports.
- Build with `GITHUB_TOKEN` permissions (`packages:write`), push to **GHCR** only.
- Restart exactly one service: `${SERVICE_NAME}` in `${PROD_COMPOSE_PATH}`.
- Do **not** modify Traefik/Tunnel/UFW from CI; those are managed on Prod.
- Health check the public URL; fail the job if it’s not healthy after retries.
