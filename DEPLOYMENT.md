# AtomQuest Deployment Guide

This guide covers deploying AtomQuest to production environments.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 15 (or Docker image)
- Node.js 18+ (for local builds)
- A server or cloud platform (AWS, Azure, GCP, DigitalOcean, etc.)
- SSL certificates (for HTTPS)

## Local Production Build

### 1. Build the Docker Image

```bash
docker build -t atomquest:latest .
```

### 2. Verify Build

```bash
docker run -it atomquest:latest npm run build
```

## Docker Compose Production Deployment

### 1. Prepare Environment File

Create `.env.production`:

```env
NODE_ENV=production
DATABASE_URL=postgresql://atomquest:SecurePassword123@postgres:5432/atomquest
JWT_SECRET=your-very-secure-random-secret-key-here
JWT_EXPIRY=7d
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### 2. Use Production Compose File

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: atomquest-postgres
    environment:
      POSTGRES_USER: atomquest
      POSTGRES_PASSWORD: SecurePassword123
      POSTGRES_DB: atomquest
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - atomquest-network
    restart: always
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U atomquest']
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: atomquest-app
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - '3000:3000'
    networks:
      - atomquest-network
    restart: always
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000']
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: atomquest-nginx
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./certbot:/etc/letsencrypt:ro
    networks:
      - atomquest-network
    restart: always
    depends_on:
      - app

volumes:
  postgres_data:

networks:
  atomquest-network:
    driver: bridge
```

### 3. Configure Nginx

Create `nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;

    upstream atomquest {
        server app:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://atomquest;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_buffering off;
        }
    }
}
```

### 4. Generate SSL Certificates

Using Let's Encrypt with Certbot:

```bash
docker run -it --rm -v ./certbot:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com
```

### 5. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Cloud Platform Deployment

### AWS ECS

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name atomquest
   ```

2. **Push Image**
   ```bash
   docker tag atomquest:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/atomquest:latest
   docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/atomquest:latest
   ```

3. **Create RDS PostgreSQL Instance**
   - Engine: PostgreSQL 15
   - Multi-AZ enabled
   - Automated backups enabled

4. **Create ECS Task Definition**
   - CPU: 512
   - Memory: 1024
   - Container: atomquest:latest
   - Environment variables with secrets

5. **Create ECS Service**
   - Load Balancer: ALB
   - Port: 3000
   - Health check: /api/health

### DigitalOcean App Platform

1. **Connect GitHub Repository**
2. **Configure Build**
   ```yaml
   build_command: npm run build
   run_command: npm start
   ```
3. **Set Environment Variables**
   - DATABASE_URL
   - JWT_SECRET
   - NODE_ENV=production
4. **Deploy**

### Heroku

```bash
heroku create atomquest
heroku addons:create heroku-postgresql:standard
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

## Database Management

### Backup PostgreSQL

```bash
docker exec atomquest-postgres pg_dump -U atomquest atomquest > backup.sql
```

### Restore PostgreSQL

```bash
docker exec -i atomquest-postgres psql -U atomquest atomquest < backup.sql
```

### Run Migrations

```bash
docker exec atomquest-app npx prisma migrate deploy
```

## Monitoring & Logs

### View Application Logs

```bash
docker-compose logs -f app
```

### View Database Logs

```bash
docker-compose logs -f postgres
```

### Health Checks

```bash
curl https://yourdomain.com/api/auth/me
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, etc.)
- Rotate JWT_SECRET regularly

### 2. Database
- Use strong passwords
- Enable SSL connections
- Regular backups
- Limit database access to app service

### 3. HTTPS
- Always use SSL/TLS
- Redirect HTTP to HTTPS
- Use strong cipher suites
- Renew certificates before expiry

### 4. Application
- Set `NODE_ENV=production`
- Disable debug mode
- Enable CORS appropriately
- Implement rate limiting
- Regular security audits

### 5. Access Control
- Use strong passwords
- Enable MFA for admin accounts
- Regular access reviews
- Audit all changes

## Scaling

### Horizontal Scaling

Use Docker Compose or Kubernetes:

```yaml
services:
  app:
    deploy:
      replicas: 3
```

### Database Connection Pooling

Configure in CONNECTION_POOL_SIZE environment variable (recommended: 20-40)

## Performance Optimization

### 1. Enable Caching
- Redis for session storage
- Cache API responses
- Static asset caching

### 2. Database Optimization
- Add indexes on frequently queried fields
- Optimize queries with EXPLAIN ANALYZE
- Regular VACUUM and ANALYZE

### 3. CDN
- Serve static assets from CDN
- CloudFront, Cloudflare, etc.

## Backup & Disaster Recovery

### Daily Backups

```bash
#!/bin/bash
docker exec atomquest-postgres pg_dump -U atomquest atomquest | \
  gzip > /backups/atomquest-$(date +%Y%m%d).sql.gz
```

### RTO/RPO Targets
- RTO (Recovery Time Objective): 2 hours
- RPO (Recovery Point Objective): 24 hours

## Rollback Procedure

```bash
# Stop current version
docker-compose stop app

# Restore database backup
docker exec -i atomquest-postgres psql -U atomquest atomquest < backup.sql

# Restart with previous image
docker-compose up -d
```

## Support

For issues or questions, refer to:
- [README.md](./README.md)
- [API.md](./API.md)
- GitHub Issues

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-17
