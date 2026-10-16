@echo off
title Hantar ke GitHub - e-Agihan SMKTego
cd /d "%~dp0"

echo ========================================================
echo   HANTAR PROJEK KE GITHUB REPOSITORY
echo   Sistem Pendaftaran Subjek Sekolah
echo ========================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\gh;%PATH%"

echo Semakan status log masuk GitHub CLI...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo Sila log masuk ke akaun GitHub anda terlebih dahulu.
    echo Pelayar web akan dibuka untuk pengesahan...
    echo.
    gh auth login --web -h github.com
)

echo.
echo Sedang mencipta repositori dan menolak kod ke GitHub...
gh repo create "Sistem-Pendaftaran-Subjek-Sekolah" --public --source=. --remote=origin --push --description "Sistem Pendaftaran & Pengutipan Agihan Subjek PdP Guru SMK Tenghilan (Pra-Jadual Waktu)"

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  BERJAYA! Projek telah dimuat naik ke GitHub.
    echo ========================================================
) else (
    echo.
    echo Cuba tolak secara manual ke origin:
    git push -u origin main
)

pause
