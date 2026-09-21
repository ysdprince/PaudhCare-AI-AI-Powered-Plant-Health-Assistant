@echo off
title PaudhCare AI — Local Server Launcher
cd /d "%~dp0"
echo ===================================================
echo   PaudhCare AI — Plant Health Assessment Platform
echo   Zero Hunger Initiative ^| Real AI Vision Pipeline
echo ===================================================
echo.
echo Working Directory: %CD%
echo Starting PaudhCare AI local server on port 8000...
echo.

powershell.exe -ExecutionPolicy Bypass -NoExit -File "%~dp0start-server.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] PowerShell server failed with error code %ERRORLEVEL%.
    echo Checking if Node.js is available as alternate runner...
    where node >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Starting via Node.js server.js...
        node server.js
    ) else (
        echo Please ensure PowerShell or Node.js is available.
    )
)

pause
