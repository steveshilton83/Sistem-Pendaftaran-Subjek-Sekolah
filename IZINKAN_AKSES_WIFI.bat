@echo off
title Konfigurasi Akses Wi-Fi Guru - e-Agihan SMKTego
color 0A

:: Semak kebenaran pentadbir (Administrator)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERHATIAN] Sila klik kanan pada fail ini dan pilih "Run as administrator".
    echo.
    pause
    exit /b
)

echo ============================================================================
echo   MENETAPKAN KEBENARAN AKSES RANGKAIAN WI-FI UNTUK TELEFON GURU
echo   Sekolah Menengah Kebangsaan Tenghilan (Port: 8089)
echo ============================================================================
echo.
echo 1. Membuka URL ACL untuk semua peranti pada port 8089...
netsh http delete urlacl url=http://*:8089/ >nul 2>&1
netsh http add urlacl url=http://*:8089/ user=Everyone

echo 2. Membuka Windows Firewall bagi port 8089...
netsh advfirewall firewall delete rule name="e-Agihan SMKTego Port 8089" >nul 2>&1
netsh advfirewall firewall add rule name="e-Agihan SMKTego Port 8089" dir=in action=allow protocol=TCP localport=8089

echo.
echo ============================================================================
echo   BERJAYA! Komputer ini kini membenarkan semua telefon guru pada Wi-Fi
echo   sekolah untuk mengakses e-Agihan secara serentak tanpa sekatan.
echo ============================================================================
echo.
pause
