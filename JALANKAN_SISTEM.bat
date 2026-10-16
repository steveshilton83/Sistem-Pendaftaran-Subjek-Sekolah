@echo off
title e-Agihan SMKTego 2026 - Pelayan Pengutipan Data Subjek
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "server.ps1"
pause
