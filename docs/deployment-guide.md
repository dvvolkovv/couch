# Deployment Guide -- SoulMate

Version: 1.0
Last updated: 2026-03-03
Platform: AI-powered psychologist/coach matching platform

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Server Setup](#3-server-setup)
4. [Environment Variables](#4-environment-variables)
5. [Database Setup (PostgreSQL + pgvector)](#5-database-setup-postgresql--pgvector)
6. [Redis Setup](#6-redis-setup)
7. [Backend Deployment](#7-backend-deployment)
8. [Frontend Deployment](#8-frontend-deployment)
9. [Nginx Configuration](#9-nginx-configuration)
10. [PM2 Configuration](#10-pm2-configuration)
11. [SSL/TLS Setup with Let's Encrypt](#11-ssltls-setup-with-lets-encrypt)
12. [Monitoring and Logging](#12-monitoring-and-logging)
13. [Backup Strategy](#13-backup-strategy)
14. [Rollback Procedure](#14-rollback-procedure)
15. [Troubleshooting Guide](#15-troubleshooting-guide)
16. [Health Checks](#16-health-checks)
17. [Current Production State](#17-current-production-state)

---

## 1. Architecture Overview

```
                          +-------------------+
                          |   Client Browser  |
                          +--------+----------+
                                   |
                          port 8080 (HTTP)
                          port 443  (HTTPS, production)
                                   |
                          +--------v----------+
                          |      Nginx        |
                          |  (reverse proxy)  |
                          +---+----------+----+
                              |          |
                  /api/* + /docs    / (everything else)
                  /socket.io/*
                              |          |
                    +---------v--+  +----v---------+
                    |  Backend   |  |  Frontend    |
                    |  NestJS    |  |  Next.js     |
                    |  port 3200 |  |  port 3201   |
                    +--+-----+--+  +--------------+
                       |     |
              +--------v-+  +v-----------+
              |PostgreSQL |  |   Redis    |
              |+ pgvector |  | port 6379  |
              | port 5432 |  +------------+
              +-----------+
```

**Component summary:**

| Component   | Technology          | Port | PM2 Process Name |
|-------------|---------------------|------|-------------------|
| Backend     | NestJS 10.x         | 3200 | soulmate-api      |
| Frontend    | Next.js 14.2.20     | 3201 | soulmate-web      |
| Proxy       | Nginx               | 8080 | (system service)  |
| Database    | PostgreSQL 16 + pgvector | 5432 | (Docker container) |
| Cache       | Redis 7             | 6379 | (Docker container) |

---

## 2. Prerequisites

### Required Software

| Software    | Minimum Version | Purpose                          |
|-------------|-----------------|----------------------------------|
| Node.js     | 20.x LTS       | Runtime for backend and frontend |
| npm         | 10.x           | Package manager                  |
| PostgreSQL  | 16.x           | Primary database                 |
| pgvector    | 0.5+           | Vector similarity search         |
| Redis       | 7.x            | Caching, session data            |
| PM2         | 5.x            | Process manager                  |
| Nginx       | 1.24+          | Reverse proxy                    |
| Git         | 2.x            | Source code management            |
| Docker      | 24.x (optional)| For running PostgreSQL and Redis  |

### Install Node.js 20 LTS (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node --version   # should print v20.x.x
```

### Install PM2

```bash
npm install -g pm2
pm2 --version
```

### Install Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx

# Verify
nginx -v
```

### Install Docker and Docker Compose (if using containers for DB/Redis)

```bash
# Ubuntu/Debian
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

---

## 3. Server Setup

### Create deployment user

```bash
sudo adduser dvolkov
sudo usermod -aG sudo dvolkov
sudo usermod -aG docker dvolkov
su - dvolkov
```

### Create directory structure

```bash
mkdir -p ~/projects/soulmate
mkdir -p ~/backups/soulmate
mkdir -p ~/logs/soulmate
```

### Clone the repository

```bash
cd ~/projects
git clone git@github.com:dvvolkovv/couch.git soulmate
cd soulmate
```

### Configure SSH key for Git access

```bash
ssh-keygen -t ed25519 -C "deploy@soulmate"
cat ~/.ssh/id_ed25519.pub
# Add this key to GitHub repository deploy keys
```

### System tuning (recommended)

```bash
# /etc/sysctl.d/99-soulmate.conf
sudo tee /etc/sysctl.d/99-soulmate.conf <<EOF
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
vm.overcommit_memory = 1
EOF

sudo sysctl --system
```

### Configure firewall

```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 8080/tcp   # Nginx HTTP
sudo ufw allow 443/tcp    # Nginx HTTPS (production)
sudo ufw enable
```

---

## 4. Environment Variables

### Backend Environment (`backend/.env`)

Create the file at `backend/.env`. All variables are described below.

```dotenv
# =========================================
# APPLICATION
# =========================================
# Runtime environment: development | staging | production
NODE_ENV=production

# Port the NestJS application listens on
PORT=3200

# Global route prefix for all API endpoints (e.g., /v1/auth/login)
API_PREFIX=v1

# =========================================
# DATABASE
# =========================================
# PostgreSQL connection string used by Prisma ORM
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL=postgresql://taler:taler_secret_2026@localhost:5432/soulmate?schema=public

# =========================================
# REDIS
# =========================================
# Redis host address
REDIS_HOST=localhost

# Redis port number
REDIS_PORT=6379

# Redis password (leave empty if no authentication is required)
REDIS_PASSWORD=

# =========================================
# JWT AUTHENTICATION
# =========================================
# Secret key for signing JWT tokens (MUST be a strong random string in production)
# Generate with: openssl rand -base64 64
JWT_SECRET=CHANGE_ME_TO_A_STRONG_RANDOM_STRING

# Access token expiration duration
JWT_ACCESS_EXPIRATION=15m

# Refresh token expiration duration
JWT_REFRESH_EXPIRATION=7d

# =========================================
# CORS
# =========================================
# Comma-separated list of allowed origins for CORS
# Must include the frontend URL
CORS_ORIGINS=http://138.124.61.221:8080,https://soulmate.ru

# =========================================
# AI -- ANTHROPIC (Primary LLM for consultations)
# =========================================
# API key from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-XXXX

# Anthropic model identifier for AI conversations
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# =========================================
# AI -- OPENAI (Embeddings for vector matching)
# =========================================
# API key from https://platform.openai.com/
OPENAI_API_KEY=sk-XXXX

# OpenAI model used to generate embeddings for value profiles
# text-embedding-3-small produces 1536-dimensional vectors
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# =========================================
# PAYMENTS -- YOOKASSA
# =========================================
# YooKassa Shop ID from https://yookassa.ru/my/
YOOKASSA_SHOP_ID=your-shop-id

# YooKassa secret key for API authentication
YOOKASSA_SECRET_KEY=your-secret-key

# Webhook verification secret for payment notifications
YOOKASSA_WEBHOOK_SECRET=your-webhook-secret

# =========================================
# S3-COMPATIBLE STORAGE (Yandex Object Storage)
# =========================================
# S3 endpoint URL
S3_ENDPOINT=https://storage.yandexcloud.net

# S3 region
S3_REGION=ru-central1

# S3 bucket name for file uploads (avatars, documents)
S3_BUCKET=soulmate-uploads

# S3 access credentials
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# =========================================
# SMS PROVIDER
# =========================================
# SMS provider: "stub" for development, actual provider name for production
SMS_PROVIDER=stub

# SMS provider API key
SMS_API_KEY=your-sms-api-key

# =========================================
# EMAIL PROVIDER
# =========================================
# Email provider: "stub" for development, actual provider name for production
EMAIL_PROVIDER=stub

# Email provider API key
EMAIL_API_KEY=your-email-api-key

# Sender email address
EMAIL_FROM=noreply@soulmate.ru

# =========================================
# ENCRYPTION
# =========================================
# 32-byte hex key for encrypting sensitive data (AI message content)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=CHANGE_ME_64_HEX_CHARS

# =========================================
# RATE LIMITING
# =========================================
# Time window for rate limiting in seconds
THROTTLE_TTL=60

# Maximum number of requests per time window
THROTTLE_LIMIT=100
```

### Frontend Environment (`frontend/.env.local`)

Create the file at `frontend/.env.local`:

```dotenv
# Base URL of the backend API including the version prefix
# This is exposed to the browser (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_URL=http://138.124.61.221:8080/api/v1

# WebSocket URL for AI chat (Socket.IO namespace)
# Points to the backend through nginx
NEXT_PUBLIC_WS_URL=http://138.124.61.221:8080
```

For production with a domain:

```dotenv
NEXT_PUBLIC_API_URL=https://soulmate.ru/api/v1
NEXT_PUBLIC_WS_URL=https://soulmate.ru
```

---

## 5. Database Setup (PostgreSQL + pgvector)

### Option A: Docker Container (recommended for production)

The project provides a `docker-compose.yml` in the `backend/` directory. For the production server, the database runs inside a Docker container.

```bash
cd ~/projects/soulmate/backend

# Start PostgreSQL with pgvector support
docker compose up -d postgres

# Verify the container is running
docker ps --filter name=soulmate-postgres
```

The Docker Compose configuration uses the `pgvector/pgvector:pg16` image, which ships with the pgvector extension pre-installed.

**Production container details (current server):**

| Parameter   | Value                 |
|-------------|-----------------------|
| Container   | taler-id-postgres-1   |
| Port        | 5432                  |
| User        | taler                 |
| Password    | taler_secret_2026     |
| Database    | soulmate              |

### Option B: Bare-metal PostgreSQL

```bash
# Install PostgreSQL 16
sudo apt install -y postgresql-16 postgresql-server-dev-16

# Install pgvector from source
cd /tmp
git clone --branch v0.7.4 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Create database and user
sudo -u postgres psql <<SQL
CREATE USER soulmate WITH PASSWORD 'soulmate_pass';
CREATE DATABASE soulmate OWNER soulmate;
GRANT ALL PRIVILEGES ON DATABASE soulmate TO soulmate;
SQL
```

### Enable pgvector extension

Connect to the database and enable the extension:

```bash
# If using Docker:
docker exec -it soulmate-postgres psql -U taler -d soulmate

# Or bare-metal:
psql -U soulmate -d soulmate
```

Then run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify the extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Run Prisma migrations

The Prisma schema (`backend/prisma/schema.prisma`) defines all models and enables `postgresqlExtensions` as a preview feature with the `pgvector` extension mapped to `vector`.

```bash
cd ~/projects/soulmate/backend

# Generate the Prisma client
npx prisma generate

# Run migrations in production mode (uses prisma migrate deploy)
npx prisma migrate deploy

# If this is a fresh database with no migration history, create the initial migration:
npx prisma migrate dev --name init
```

**Important:** In production, always use `prisma migrate deploy` (not `prisma migrate dev`), which applies pending migrations without prompting or generating new ones.

### Seed the database (optional)

If a seed file exists at `backend/prisma/seed.ts`:

```bash
npx prisma db seed
```

### Verify database setup

```bash
# Connect and check tables
docker exec -it taler-id-postgres-1 psql -U taler -d soulmate -c "\dt"

# Check pgvector extension
docker exec -it taler-id-postgres-1 psql -U taler -d soulmate -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"

# Check value_profiles table has the vector column
docker exec -it taler-id-postgres-1 psql -U taler -d soulmate -c "\d value_profiles"
```

---

## 6. Redis Setup

### Option A: Docker Container (recommended)

```bash
cd ~/projects/soulmate/backend
docker compose up -d redis

# Verify
docker exec -it soulmate-redis redis-cli ping
# Expected output: PONG
```

### Option B: System Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify
redis-cli ping
```

### Redis configuration for production

If you need password authentication, edit `/etc/redis/redis.conf` or pass the password to the Docker container:

```bash
# Docker with password
docker run -d --name soulmate-redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --requirepass "your-redis-password"
```

Then set `REDIS_PASSWORD=your-redis-password` in `backend/.env`.

### Redis database selection

The backend Redis service connects to the default database (db 0) by default. On the current production server, database 2 is used. To configure a specific database, the `REDIS_HOST` connection can be augmented or the Redis service can be configured to select a database on init. If using db 2, add `REDIS_DB=2` to `.env` and update the Redis service constructor accordingly, or append the db to the Redis URL.

---

## 7. Backend Deployment

### Step-by-step deployment

```bash
# Navigate to the project root
cd ~/projects/soulmate

# Pull the latest code
git pull origin main

# Navigate to the backend directory
cd backend

# Install production dependencies
npm ci --production=false

# Generate Prisma client (must be done after npm install)
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the NestJS application
npm run build
# This runs "nest build" which compiles TypeScript to dist/

# Verify the build output exists
ls -la dist/main.js
```

### Start with PM2

```bash
# Start the backend process
pm2 start dist/main.js \
  --name soulmate-api \
  --cwd ~/projects/soulmate/backend \
  --max-memory-restart 512M \
  --time

# Save PM2 process list (survives reboot)
pm2 save

# Verify the process is running
pm2 status soulmate-api
pm2 logs soulmate-api --lines 20
```

### Verify backend health

```bash
# Check the process is listening on port 3200
curl -s http://localhost:3200/v1 | head -20

# Check Swagger docs are accessible
curl -s -o /dev/null -w "%{http_code}" http://localhost:3200/docs
```

---

## 8. Frontend Deployment

### Step-by-step deployment

```bash
cd ~/projects/soulmate/frontend

# Install dependencies
npm ci

# Create environment file
# (see Section 4 for NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL)
cat > .env.local <<'EOF'
NEXT_PUBLIC_API_URL=http://138.124.61.221:8080/api/v1
NEXT_PUBLIC_WS_URL=http://138.124.61.221:8080
EOF

# Build the Next.js application
npm run build
# This creates the .next/ directory with the production build

# Verify the build succeeded
ls -la .next/
```

### Start with PM2

```bash
# Start the frontend process
pm2 start npm \
  --name soulmate-web \
  --cwd ~/projects/soulmate/frontend \
  -- start -- -p 3201

# Save PM2 process list
pm2 save

# Verify
pm2 status soulmate-web
curl -s -o /dev/null -w "%{http_code}" http://localhost:3201
```

### Alternative: Start with next start directly

```bash
pm2 start "npx next start -p 3201" \
  --name soulmate-web \
  --cwd ~/projects/soulmate/frontend \
  --max-memory-restart 512M \
  --time
```

---

## 9. Nginx Configuration

### Create the Nginx configuration

```bash
sudo tee /etc/nginx/sites-available/soulmate.conf <<'NGINX'
upstream soulmate_api {
    server 127.0.0.1:3200;
    keepalive 64;
}

upstream soulmate_web {
    server 127.0.0.1:3201;
    keepalive 64;
}

server {
    listen 8080;
    server_name 138.124.61.221 soulmate.ru www.soulmate.ru;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript
               image/svg+xml;

    # Request size limits (for file uploads)
    client_max_body_size 50M;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;

    # ------------------------------------------
    # Backend API: /api/* -> backend:3200/v1/*
    # ------------------------------------------
    location /api/ {
        rewrite ^/api/(.*) /v1/$1 break;

        proxy_pass http://soulmate_api;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # Do not buffer API responses (important for streaming)
        proxy_buffering off;
    }

    # ------------------------------------------
    # Swagger API docs: /docs -> backend:3200/docs
    # ------------------------------------------
    location /docs {
        proxy_pass http://soulmate_api;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ------------------------------------------
    # WebSocket: /socket.io/* -> backend:3200
    # Used by Socket.IO for the AI chat gateway
    # ------------------------------------------
    location /socket.io/ {
        proxy_pass http://soulmate_api;
        proxy_http_version 1.1;

        # Required for WebSocket upgrade
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Longer timeouts for persistent WebSocket connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ------------------------------------------
    # Frontend: / -> Next.js:3201
    # ------------------------------------------
    location / {
        proxy_pass http://soulmate_web;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # Next.js HMR WebSocket (development only, harmless in production)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # ------------------------------------------
    # Static assets caching
    # ------------------------------------------
    location /_next/static/ {
        proxy_pass http://soulmate_web;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # ------------------------------------------
    # Logging
    # ------------------------------------------
    access_log /var/log/nginx/soulmate-access.log;
    error_log  /var/log/nginx/soulmate-error.log warn;
}
NGINX
```

### Enable the site and restart Nginx

```bash
# Create symlink to enable the site
sudo ln -sf /etc/nginx/sites-available/soulmate.conf /etc/nginx/sites-enabled/

# Remove the default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test the configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Verify Nginx is running
sudo systemctl status nginx
```

### Verify the proxy

```bash
# Frontend through nginx
curl -s -o /dev/null -w "%{http_code}" http://138.124.61.221:8080/

# API through nginx
curl -s http://138.124.61.221:8080/api/v1 | head -20

# Swagger docs through nginx
curl -s -o /dev/null -w "%{http_code}" http://138.124.61.221:8080/docs
```

---

## 10. PM2 Configuration

### Ecosystem file (`ecosystem.config.js`)

Create this file in the project root at `~/projects/soulmate/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'soulmate-api',
      cwd: './backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3200,
      },
      // Log configuration
      error_file: '/home/dvolkov/logs/soulmate/api-error.log',
      out_file: '/home/dvolkov/logs/soulmate/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // Source map support
      source_map_support: true,
    },
    {
      name: 'soulmate-web',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3201',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3201,
      },
      // Log configuration
      error_file: '/home/dvolkov/logs/soulmate/web-error.log',
      out_file: '/home/dvolkov/logs/soulmate/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
    },
  ],
};
```

### Using the ecosystem file

```bash
cd ~/projects/soulmate

# Start all applications
pm2 start ecosystem.config.js

# Restart all
pm2 restart ecosystem.config.js

# Stop all
pm2 stop ecosystem.config.js

# Delete all processes
pm2 delete ecosystem.config.js

# Reload with zero-downtime (for fork mode this is equivalent to restart)
pm2 reload ecosystem.config.js
```

### PM2 startup (persist across reboots)

```bash
# Generate the startup script
pm2 startup systemd -u dvolkov --hp /home/dvolkov

# Execute the command that pm2 outputs, for example:
# sudo env PATH=$PATH:/home/dvolkov/.nvm/versions/node/v20.x.x/bin pm2 startup systemd -u dvolkov --hp /home/dvolkov

# Save the current process list
pm2 save
```

---

## 11. SSL/TLS Setup with Let's Encrypt

### Prerequisites

- A registered domain (e.g., `soulmate.ru`) pointing to the server IP `138.124.61.221`
- Port 80 and 443 open in the firewall

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain certificate

```bash
sudo certbot --nginx -d soulmate.ru -d www.soulmate.ru \
  --non-interactive \
  --agree-tos \
  --email admin@soulmate.ru \
  --redirect
```

Certbot will automatically modify the Nginx configuration to:
- Listen on port 443 with SSL
- Redirect HTTP (port 80) to HTTPS
- Add the SSL certificate and key paths

### Update Nginx for HTTPS (manual approach)

If you prefer to configure SSL manually, update `/etc/nginx/sites-available/soulmate.conf`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name soulmate.ru www.soulmate.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name soulmate.ru www.soulmate.ru;

    ssl_certificate /etc/letsencrypt/live/soulmate.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/soulmate.ru/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/soulmate.ru/chain.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS (uncomment once SSL is confirmed working)
    # add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # ... (rest of the location blocks from Section 9) ...
}
```

### Auto-renewal

Certbot installs a systemd timer for automatic renewal. Verify:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

### Update environment after enabling SSL

After SSL is active, update the following:

1. `backend/.env`:
   ```dotenv
   CORS_ORIGINS=https://soulmate.ru,https://www.soulmate.ru
   ```

2. `frontend/.env.local`:
   ```dotenv
   NEXT_PUBLIC_API_URL=https://soulmate.ru/api/v1
   NEXT_PUBLIC_WS_URL=https://soulmate.ru
   ```

3. Rebuild and restart the frontend:
   ```bash
   cd ~/projects/soulmate/frontend
   npm run build
   pm2 restart soulmate-web
   ```

4. Restart the backend for CORS changes:
   ```bash
   pm2 restart soulmate-api
   ```

---

## 12. Monitoring and Logging

### PM2 Monitoring

```bash
# Real-time process monitoring dashboard
pm2 monit

# Process status
pm2 status

# Detailed process info
pm2 describe soulmate-api
pm2 describe soulmate-web

# View logs (real-time)
pm2 logs

# View logs for a specific process
pm2 logs soulmate-api --lines 100
pm2 logs soulmate-web --lines 100

# View only error logs
pm2 logs soulmate-api --err --lines 50

# Flush all logs
pm2 flush
```

### Nginx Logs

```bash
# Access logs (all requests coming through nginx)
tail -f /var/log/nginx/soulmate-access.log

# Error logs (proxy errors, upstream timeouts)
tail -f /var/log/nginx/soulmate-error.log

# Count requests by status code in the last hour
awk '{print $9}' /var/log/nginx/soulmate-access.log | sort | uniq -c | sort -rn

# Find slow requests (response time > 1s)
awk '$NF > 1.0' /var/log/nginx/soulmate-access.log | tail -20
```

### Application-level log files

With the ecosystem.config.js above, logs are stored at:

| Log File | Path |
|----------|------|
| API stdout | `/home/dvolkov/logs/soulmate/api-out.log` |
| API stderr | `/home/dvolkov/logs/soulmate/api-error.log` |
| Web stdout | `/home/dvolkov/logs/soulmate/web-out.log` |
| Web stderr | `/home/dvolkov/logs/soulmate/web-error.log` |

### Log rotation

PM2 has a built-in log rotation module:

```bash
pm2 install pm2-logrotate

# Configure rotation
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:workerInterval 30
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

For Nginx log rotation, configure logrotate:

```bash
sudo tee /etc/logrotate.d/soulmate-nginx <<'EOF'
/var/log/nginx/soulmate-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 $(cat /var/run/nginx.pid)
    endscript
}
EOF
```

### Docker container logs (PostgreSQL and Redis)

```bash
# PostgreSQL logs
docker logs soulmate-postgres --tail 100 -f

# Redis logs
docker logs soulmate-redis --tail 100 -f
```

### System resource monitoring

```bash
# Quick system overview
htop

# Disk usage
df -h

# Memory usage by process
ps aux --sort=-%mem | head -20

# Check port usage
sudo ss -tlnp | grep -E '3200|3201|5432|6379|8080'
```

---

## 13. Backup Strategy

### Database backups

#### Manual backup

```bash
# Full database dump
docker exec soulmate-postgres pg_dump \
  -U taler \
  -d soulmate \
  --format=custom \
  --compress=9 \
  > ~/backups/soulmate/db-$(date +%Y%m%d-%H%M%S).dump

# For the current production container:
docker exec taler-id-postgres-1 pg_dump \
  -U taler \
  -d soulmate \
  --format=custom \
  --compress=9 \
  > ~/backups/soulmate/db-$(date +%Y%m%d-%H%M%S).dump
```

#### Automated daily backup (cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 3:00 AM Moscow time (UTC+3)
0 0 * * * docker exec taler-id-postgres-1 pg_dump -U taler -d soulmate --format=custom --compress=9 > /home/dvolkov/backups/soulmate/db-$(date +\%Y\%m\%d-\%H\%M\%S).dump 2>> /home/dvolkov/logs/soulmate/backup.log

# Clean up backups older than 30 days
0 1 * * * find /home/dvolkov/backups/soulmate/ -name "db-*.dump" -mtime +30 -delete
```

#### Restore from backup

```bash
# Stop the backend first
pm2 stop soulmate-api

# Restore the database
docker exec -i soulmate-postgres pg_restore \
  -U taler \
  -d soulmate \
  --clean \
  --if-exists \
  < ~/backups/soulmate/db-20260303-030000.dump

# Restart the backend
pm2 restart soulmate-api
```

### Application code backup

The Git repository serves as the primary backup for application code. Additionally:

```bash
# Before any deployment, tag the current state
cd ~/projects/soulmate
git tag -a "deploy-$(date +%Y%m%d-%H%M%S)" -m "Pre-deployment snapshot"
git push origin --tags
```

### Redis backup

Redis data is ephemeral cache in this application. If persistence is needed:

```bash
# Trigger a Redis snapshot
docker exec soulmate-redis redis-cli BGSAVE

# Copy the dump file
docker cp soulmate-redis:/data/dump.rdb ~/backups/soulmate/redis-$(date +%Y%m%d).rdb
```

---

## 14. Rollback Procedure

### Quick rollback to previous Git commit

```bash
cd ~/projects/soulmate

# Find the last known good commit
git log --oneline -10

# Store the current commit hash for reference
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "Rolling back from: $CURRENT_COMMIT"

# Roll back to the previous commit
git checkout HEAD~1

# Or roll back to a specific commit/tag
git checkout <commit-hash>
# Or:
git checkout deploy-20260302-120000
```

### Full rollback procedure

```bash
#!/bin/bash
# rollback.sh -- Full rollback script
set -euo pipefail

PROJECT_DIR=~/projects/soulmate
ROLLBACK_TARGET=${1:-HEAD~1}

echo "=== SoulMate Rollback ==="
echo "Rolling back to: $ROLLBACK_TARGET"

cd "$PROJECT_DIR"

# 1. Record current state
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "Current commit: $CURRENT_COMMIT"

# 2. Stop processes
echo "Stopping PM2 processes..."
pm2 stop soulmate-api soulmate-web

# 3. Checkout the target commit
echo "Checking out $ROLLBACK_TARGET..."
git checkout "$ROLLBACK_TARGET"

# 4. Rebuild backend
echo "Rebuilding backend..."
cd "$PROJECT_DIR/backend"
npm ci --production=false
npx prisma generate
npm run build

# 5. Rebuild frontend
echo "Rebuilding frontend..."
cd "$PROJECT_DIR/frontend"
npm ci
npm run build

# 6. Restart processes
echo "Restarting PM2 processes..."
pm2 restart soulmate-api soulmate-web

# 7. Verify
sleep 5
pm2 status

echo "=== Rollback complete ==="
echo "Rolled back from $CURRENT_COMMIT to $(git rev-parse HEAD)"
echo ""
echo "If you need to undo this rollback, run:"
echo "  git checkout $CURRENT_COMMIT"
```

### Database migration rollback

Prisma does not support automatic down migrations in production. If a migration must be reverted:

```bash
# 1. Restore from database backup (see Section 13)
docker exec -i taler-id-postgres-1 pg_restore \
  -U taler -d soulmate --clean --if-exists \
  < ~/backups/soulmate/db-YYYYMMDD-HHMMSS.dump

# 2. Mark the problematic migration as rolled back in the _prisma_migrations table
docker exec -it taler-id-postgres-1 psql -U taler -d soulmate -c \
  "DELETE FROM _prisma_migrations WHERE migration_name = 'YYYYMMDDHHMMSS_migration_name';"

# 3. Restart the backend
pm2 restart soulmate-api
```

### Emergency: revert to a known working state

```bash
# If you tagged the deployment (recommended):
cd ~/projects/soulmate
git tag -l 'deploy-*' | sort -r | head -5

# Revert to the last tagged deployment
git checkout deploy-YYYYMMDD-HHMMSS

# Rebuild and restart
cd backend && npm ci --production=false && npx prisma generate && npm run build && cd ..
cd frontend && npm ci && npm run build && cd ..
pm2 restart ecosystem.config.js
```

---

## 15. Troubleshooting Guide

### Backend does not start

**Symptom:** `pm2 status` shows soulmate-api with status "errored" or constant restarts.

```bash
# Check error logs
pm2 logs soulmate-api --err --lines 50

# Common causes and fixes:

# 1. Port already in use
sudo lsof -i :3200
# Kill the conflicting process or change PORT in .env

# 2. Database connection failed
# Verify PostgreSQL is running:
docker ps --filter name=postgres
# Test connection manually:
docker exec -it taler-id-postgres-1 psql -U taler -d soulmate -c "SELECT 1;"
# Check DATABASE_URL in backend/.env

# 3. Redis connection failed
docker exec -it soulmate-redis redis-cli ping
# Check REDIS_HOST and REDIS_PORT in backend/.env

# 4. Prisma client not generated
cd ~/projects/soulmate/backend
npx prisma generate

# 5. Missing dist/ directory
npm run build
```

### Frontend does not start

**Symptom:** `pm2 status` shows soulmate-web with status "errored".

```bash
# Check logs
pm2 logs soulmate-web --err --lines 50

# Common causes:

# 1. .next directory missing (build not run)
cd ~/projects/soulmate/frontend
npm run build

# 2. Port 3201 already in use
sudo lsof -i :3201

# 3. NEXT_PUBLIC_API_URL not set at build time
# Environment variables with NEXT_PUBLIC_ prefix must be present during `npm run build`
cat .env.local
npm run build
pm2 restart soulmate-web
```

### Nginx returns 502 Bad Gateway

```bash
# Check if both backend and frontend processes are running
pm2 status

# Check if they are listening on the expected ports
curl -s http://localhost:3200/v1
curl -s http://localhost:3201

# Check nginx error logs
sudo tail -20 /var/log/nginx/soulmate-error.log

# Verify upstream configuration
sudo nginx -t
```

### Nginx returns 504 Gateway Timeout

```bash
# This usually means the backend is taking too long to respond
# Check backend logs for slow queries or API calls
pm2 logs soulmate-api --lines 50

# Increase proxy timeouts in nginx config if needed
# proxy_read_timeout 300s;
```

### WebSocket connections fail

```bash
# Verify the Socket.IO endpoint is accessible
curl -s "http://localhost:3200/socket.io/?EIO=4&transport=polling"

# Check nginx WebSocket proxy configuration
# The /socket.io/ location block must have:
#   proxy_set_header Upgrade $http_upgrade;
#   proxy_set_header Connection "upgrade";

# Check CORS settings in backend
grep CORS_ORIGINS ~/projects/soulmate/backend/.env
```

### Database migration fails

```bash
# Check the migration status
cd ~/projects/soulmate/backend
npx prisma migrate status

# If there are failed migrations, check the error:
npx prisma migrate deploy 2>&1

# If the schema is out of sync with the database:
npx prisma db pull   # Introspect current DB state
npx prisma generate  # Regenerate client

# For pgvector-related errors, ensure the extension is enabled:
docker exec -it taler-id-postgres-1 psql -U taler -d soulmate \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### High memory usage

```bash
# Check PM2 memory usage
pm2 monit

# If a process exceeds memory limits, PM2 will auto-restart it
# (max_memory_restart: 512M in ecosystem config)

# Check overall system memory
free -h

# Check for memory leaks in Node.js processes
pm2 describe soulmate-api | grep -E 'memory|restart'
```

### Connection refused on port 8080

```bash
# Check nginx is running
sudo systemctl status nginx

# Check if port 8080 is being listened on
sudo ss -tlnp | grep 8080

# Check firewall rules
sudo ufw status
```

---

## 16. Health Checks

### Automated health check script

Create `~/scripts/soulmate-healthcheck.sh`:

```bash
#!/bin/bash
# soulmate-healthcheck.sh -- Comprehensive health check

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

check() {
    local name="$1"
    local cmd="$2"
    local expected="$3"

    result=$(eval "$cmd" 2>/dev/null)
    if [ "$result" = "$expected" ]; then
        echo -e "${GREEN}[OK]${NC} $name"
    else
        echo -e "${RED}[FAIL]${NC} $name (got: $result, expected: $expected)"
        ERRORS=$((ERRORS + 1))
    fi
}

echo "=== SoulMate Health Check ==="
echo "Timestamp: $(date -Iseconds)"
echo ""

# PM2 processes
echo "--- PM2 Processes ---"
check "soulmate-api is online" \
    "pm2 jlist 2>/dev/null | python3 -c \"import sys,json; procs=json.load(sys.stdin); print(next((p['pm2_env']['status'] for p in procs if p['name']=='soulmate-api'), 'not found'))\"" \
    "online"

check "soulmate-web is online" \
    "pm2 jlist 2>/dev/null | python3 -c \"import sys,json; procs=json.load(sys.stdin); print(next((p['pm2_env']['status'] for p in procs if p['name']=='soulmate-web'), 'not found'))\"" \
    "online"

# Port checks
echo ""
echo "--- Port Checks ---"
check "Backend port 3200" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:3200/v1 --max-time 5" \
    "200"

check "Frontend port 3201" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:3201 --max-time 5" \
    "200"

check "Nginx port 8080" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 --max-time 5" \
    "200"

# Database
echo ""
echo "--- Database ---"
check "PostgreSQL connection" \
    "docker exec taler-id-postgres-1 pg_isready -U taler -d soulmate 2>/dev/null | grep -c 'accepting connections'" \
    "1"

check "pgvector extension" \
    "docker exec taler-id-postgres-1 psql -U taler -d soulmate -tAc \"SELECT count(*) FROM pg_extension WHERE extname='vector';\" 2>/dev/null" \
    "1"

# Redis
echo ""
echo "--- Redis ---"
check "Redis ping" \
    "redis-cli ping 2>/dev/null" \
    "PONG"

# Nginx
echo ""
echo "--- Nginx ---"
check "Nginx service" \
    "systemctl is-active nginx 2>/dev/null" \
    "active"

# API through Nginx
echo ""
echo "--- End-to-End ---"
check "API via Nginx" \
    "curl -s -o /dev/null -w '%{http_code}' http://138.124.61.221:8080/api/v1 --max-time 10" \
    "200"

check "Frontend via Nginx" \
    "curl -s -o /dev/null -w '%{http_code}' http://138.124.61.221:8080/ --max-time 10" \
    "200"

# Disk space
echo ""
echo "--- Disk Space ---"
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | tr -d '%')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}[OK]${NC} Disk usage: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}[WARN]${NC} Disk usage: ${DISK_USAGE}% (consider cleanup)"
else
    echo -e "${RED}[CRIT]${NC} Disk usage: ${DISK_USAGE}%"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "==========================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All checks passed.${NC}"
else
    echo -e "${RED}$ERRORS check(s) failed.${NC}"
fi

exit $ERRORS
```

```bash
chmod +x ~/scripts/soulmate-healthcheck.sh
```

### Schedule periodic health checks (cron)

```bash
crontab -e

# Run health check every 5 minutes, log failures
*/5 * * * * /home/dvolkov/scripts/soulmate-healthcheck.sh >> /home/dvolkov/logs/soulmate/healthcheck.log 2>&1 || echo "$(date): Health check failed" >> /home/dvolkov/logs/soulmate/healthcheck-alerts.log
```

---

## 17. Current Production State

### Server: 138.124.61.221

| Component        | Details                                            |
|------------------|----------------------------------------------------|
| User             | dvolkov                                            |
| Node.js          | 20.x LTS (via nvm)                                |
| Git repository   | git@github.com:dvvolkovv/couch.git (branch: main) |
| Project path     | ~/projects/soulmate                                |

### Processes

| PM2 Name      | Application        | Port | Script                    |
|---------------|--------------------|------|---------------------------|
| soulmate-api  | NestJS backend     | 3200 | backend/dist/main.js      |
| soulmate-web  | Next.js frontend   | 3201 | frontend (next start)     |

### Database

| Parameter      | Value                        |
|----------------|------------------------------|
| Docker container | taler-id-postgres-1        |
| Image          | pgvector/pgvector:pg16       |
| Host           | localhost                    |
| Port           | 5432                         |
| User           | taler                        |
| Password       | taler_secret_2026            |
| Database       | soulmate                     |
| pgvector       | Enabled                      |

### Redis

| Parameter      | Value        |
|----------------|--------------|
| Host           | localhost    |
| Port           | 6379         |
| Database       | 2            |
| Authentication | None         |

### Nginx

| Parameter      | Value                                  |
|----------------|----------------------------------------|
| Listen port    | 8080                                   |
| Frontend       | / -> localhost:3201                    |
| API            | /api/* -> localhost:3200/v1/*          |
| WebSocket      | /socket.io/* -> localhost:3200         |
| Swagger        | /docs -> localhost:3200/docs           |

### Accessing the application

| What             | URL                                     |
|------------------|-----------------------------------------|
| Frontend         | http://138.124.61.221:8080/             |
| API base         | http://138.124.61.221:8080/api/v1       |
| Swagger docs     | http://138.124.61.221:8080/docs         |
| WebSocket (AI)   | ws://138.124.61.221:8080/socket.io/     |

---

## Quick Reference: Full Deployment Sequence

For a clean deployment from scratch on a new server:

```bash
# 1. System setup
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential nginx docker.io docker-compose-v2

# 2. Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20

# 3. Install PM2
npm install -g pm2

# 4. Clone repository
cd ~/projects
git clone git@github.com:dvvolkovv/couch.git soulmate
cd soulmate

# 5. Start database and Redis
cd backend
docker compose up -d
cd ..

# 6. Enable pgvector
docker exec -it soulmate-postgres psql -U soulmate -d soulmate -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 7. Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env with production values (see Section 4)

# 8. Deploy backend
cd backend
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build
cd ..

# 9. Configure and deploy frontend
cd frontend
cat > .env.local <<'EOF'
NEXT_PUBLIC_API_URL=http://138.124.61.221:8080/api/v1
NEXT_PUBLIC_WS_URL=http://138.124.61.221:8080
EOF
npm ci
npm run build
cd ..

# 10. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 11. Configure Nginx (see Section 9)
# 12. Enable SSL (see Section 11)
# 13. Run health check
~/scripts/soulmate-healthcheck.sh
```
