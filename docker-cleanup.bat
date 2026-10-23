@echo off
echo ========================================
echo Docker Cleanup Script
echo ========================================
echo.

echo Stopping all running containers...
docker-compose down

echo.
echo Removing old images...
docker-compose down --rmi all

echo.
echo Pruning Docker system (removing unused data)...
docker system prune -f

echo.
echo Removing build cache...
docker builder prune -f

echo.
echo ========================================
echo Cleanup complete!
echo ========================================
echo.
echo You can now run: docker-compose up --build
pause
