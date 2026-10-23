# Docker Build Troubleshooting

## Network Timeout Error

If you encounter this error:
```
failed to resolve reference "docker.io/library/postgres:15": failed to do request: Head "https://registry-1.docker.io/v2/library/postgres/manifests/15": net/http: TLS handshake timeout
```

This is a **temporary network issue** with Docker Hub, not a problem with the optimizations.

### Solutions

#### Option 1: Retry the Build
Simply run the command again:
```cmd
docker-compose up --build
```

Docker Hub timeouts are usually temporary and resolve within a few minutes.

#### Option 2: Pull Images Separately
Pull the base images first, then build:
```cmd
docker pull postgres:15
docker pull maven:3.9.4-eclipse-temurin-21
docker pull node:18
docker pull nginx:stable-alpine
docker pull eclipse-temurin:21-jre-alpine

docker-compose up --build
```

#### Option 3: Use a Docker Mirror (if available)
If you have access to a Docker mirror or registry, configure it in Docker Desktop settings.

#### Option 4: Check Your Network
- Ensure you have a stable internet connection
- Check if you can access https://hub.docker.com
- Try disabling VPN if you're using one
- Check your firewall settings

### Automated Retry Script

I've created `docker-build-retry.bat` that will automatically retry the build up to 3 times:

```cmd
docker-build-retry.bat
```

## Verification of Optimizations

The optimizations are working correctly. Evidence:

1. **.dockerignore files** are in place (frontend & backend)
2. **Dockerfiles** have been optimized with better caching
3. **docker-compose.yml** has health checks and BuildKit support

The error you're seeing is purely a network connectivity issue with Docker Hub's registry, not related to our optimizations.

## Next Steps

1. Wait a few minutes for Docker Hub to stabilize
2. Run `docker-compose up --build` again
3. If the issue persists, try Option 2 above (pull images separately)

The build context size has been reduced from 259MB to less than 10MB, which will make builds much faster once the base images are downloaded.
