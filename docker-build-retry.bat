@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Docker Build with Auto-Retry
echo ========================================
echo.

set MAX_RETRIES=3
set RETRY_COUNT=0

:retry
set /a RETRY_COUNT+=1
echo Attempt %RETRY_COUNT% of %MAX_RETRIES%...
echo.

docker-compose up --build -d

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build successful!
    echo ========================================
    echo.
    echo Services are starting. Check status with:
    echo   docker-compose ps
    echo.
    echo View logs with:
    echo   docker-compose logs -f
    echo.
    goto :success
)

if %RETRY_COUNT% LSS %MAX_RETRIES% (
    echo.
    echo Build failed. Waiting 10 seconds before retry...
    timeout /t 10 /nobreak >nul
    echo.
    goto :retry
)

echo.
echo ========================================
echo Build failed after %MAX_RETRIES% attempts
echo ========================================
echo.
echo Please check:
echo 1. Internet connection
echo 2. Docker Hub status (https://status.docker.com/)
echo 3. DOCKER_TROUBLESHOOTING.md for more solutions
echo.
pause
exit /b 1

:success
pause
exit /b 0
