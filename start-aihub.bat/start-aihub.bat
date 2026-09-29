@echo off
title AI Hub Launcher
color 0A

echo ======================================
echo          AI HUB STARTING...
echo ======================================

:: Start XAMPP Apache
echo Starting Apache...
start "" "C:\xampp\apache_start.bat"

:: Wait
timeout /t 5 /nobreak >nul

:: Start MySQL
echo Starting MariaDB...
start "" "C:\xampp\mysql_start.bat"

timeout /t 5 /nobreak >nul

:: Start Ollama
echo Starting Ollama...
start "" "C:\Users\sp833\AppData\Local\Programs\Ollama\ollama.exe" serve

timeout /t 5 /nobreak >nul

:: Start ComfyUI
echo Starting ComfyUI...
cd /d "C:\Users\sp833\ComfyUI"
start "" run_nvidia_gpu.bat

timeout /t 15 /nobreak >nul

:: Start Backend
echo Starting Backend...

cd /d "C:\Users\sp833\mark01\AI HUB\js"

start cmd /k "node server.js"

timeout /t 10 /nobreak >nul

:: Open Browser
start http://localhost:3000

echo.
echo ======================================
echo AI HUB IS READY
echo ======================================

pause
