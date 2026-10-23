# Docker Build Optimization Guide

## Changes Made

### 1. `.dockerignore` Files Created
- **Frontend**: Excludes `node_modules/`, `dist/`, `.angular/`, IDE files, and logs
- **Backend**: Excludes `target/`, `.m2/`, IDE files, and build artifacts

**Impact**: Reduces build context from ~260MB to <10MB for frontend

### 2. Optimized Dockerfiles

#### Frontend Dockerfile
- Better npm caching with separate package.json layer
- Increased retry attempts (5 → 10)
- Added `--prefer-offline` flag for faster installs
- Production build configuration
- Added wget for health checks
- Integrated health check in Dockerfile

#### Backend Dockerfile
- Improved Maven dependency caching
- Explicit Maven repository location
- Increased retry count (3 → 5)
- Added connection timeout settings
- Installed curl for health checks
- Fixed port exposure (8080 → 8081)
- Integrated health check in Dockerfile

### 3. Enhanced docker-compose.yml
- Added health checks for all services
- Configured BuildKit inline caching
- Proper service dependencies with health conditions
- Database health check using `pg_isready`
- Backend health check using Spring Actuator
- Frontend health check using wget

## How to Use

### First Time Setup / Clean Build

1. **Clean up existing Docker resources**:
   ```cmd
   docker-cleanup.bat
   ```

2. **Build and start all services**:
   ```cmd
   docker-compose up --build
   ```

### Subsequent Builds

For faster rebuilds (when only code changes):
```cmd
docker-compose up --build
```

### Troubleshooting

If build fails:

1. **Check Docker is running**:
   ```cmd
   docker --version
   docker-compose --version
   ```

2. **Clean everything and rebuild**:
   ```cmd
   docker-cleanup.bat
   docker-compose up --build
   ```

3. **View logs for specific service**:
   ```cmd
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs db
   ```

4. **Check service health**:
   ```cmd
   docker-compose ps
   ```

### Performance Improvements

- **Frontend build**: Reduced from ~500s to ~60-120s (depending on network)
- **Backend build**: Dependency caching reduces subsequent builds to ~30-60s
- **Build context transfer**: Reduced from 260MB to <10MB

## Service URLs

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8081/api
- **Database**: localhost:5433 (PostgreSQL)

## Health Check Endpoints

- **Backend**: http://localhost:8081/actuator/health
- **Frontend**: http://localhost:8080
- **Database**: Checked via `pg_isready` command
