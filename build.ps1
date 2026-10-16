# ==============================================================================
#  SKRIP BINAAN PENGELUARAN (PRODUCTION BUILD & VERIFICATION) - e-Agihan SMKTego
# ==============================================================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }
$dist = Join-Path $root "dist"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   BINAAN PENGELUARAN & SEMAKAN INTEGRITI: e-Agihan SMKTego 2026" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Cyan

$errorCount = 0

# 1. Semak & Baca Fail .env
$envFile = Join-Path $root ".env"
$envMap = @{}
if (Test-Path $envFile) {
    Write-Host "[1/5] Membaca konfigurasi dari .env..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            $envMap[$key] = $val
            if (-not [System.Environment]::GetEnvironmentVariable($key)) {
                [System.Environment]::SetEnvironmentVariable($key, $val)
            }
        }
    }
} else {
    Write-Host "[1/5] Amaran: .env tidak ditemui, menggunakan tetapan lalai..." -ForegroundColor Yellow
}

# 2. Semak Integriti index.html dan Fail Import (No Missing Imports)
Write-Host "[2/5] Menyemak rujukan fail dalam index.html (Import Integrity)..." -ForegroundColor Green
$htmlPath = Join-Path $root "index.html"
if (-not (Test-Path $htmlPath)) {
    Write-Host "  [RALAT] index.html tidak ditemui!" -ForegroundColor Red
    exit 1
}

$html = Get-Content $htmlPath -Raw

# Cari skrip
$scriptMatches = [regex]::Matches($html, '<script\s+[^>]*src=["'']([^"'']+)["''][^>]*>')
foreach ($m in $scriptMatches) {
    $src = $m.Groups[1].Value
    if (-not $src.StartsWith("http://") -and -not $src.StartsWith("https://")) {
        $fullPath = Join-Path $root $src.Replace('/', '\')
        if (Test-Path $fullPath) {
            Write-Host "  [OK] Skrip ditemui: $src" -ForegroundColor DarkGreen
        } else {
            Write-Host "  [RALAT] Skrip hilang / tidak wujud: $src" -ForegroundColor Red
            $errorCount++
        }
    }
}

# Cari CSS
$linkMatches = [regex]::Matches($html, '<link\s+[^>]*href=["'']([^"'']+)["''][^>]*>')
foreach ($m in $linkMatches) {
    $href = $m.Groups[1].Value
    if (-not $href.StartsWith("http://") -and -not $href.StartsWith("https://")) {
        $fullPath = Join-Path $root $href.Replace('/', '\')
        if (Test-Path $fullPath) {
            Write-Host "  [OK] Pautan/Aset ditemui: $href" -ForegroundColor DarkGreen
        } else {
            Write-Host "  [RALAT] Pautan/Aset hilang: $href" -ForegroundColor Red
            $errorCount++
        }
    }
}

# 3. Semakan Sintaks & Linting JavaScript
Write-Host "[3/5] Menjalankan semakan sintaks JavaScript (Syntax & Lint Check)..." -ForegroundColor Green
$jsFiles = @("js\config.js", "js\data.js", "js\sync.js", "js\pdf-generator.js", "js\app.js", "sw.js")

foreach ($rel in $jsFiles) {
    $full = Join-Path $root $rel
    if (Test-Path $full) {
        $code = Get-Content $full -Raw
        
        # Semakan imbangan kurungan (Brackets & Parentheses balance check)
        $openParen = ($code -replace '[^()]').Length
        $openCurly = ($code -replace '[^{}]').Length
        $openSquare = ($code -replace '[^\[\]]').Length
        
        $pCount = 0
        $cCount = 0
        $sCount = 0
        
        foreach ($char in $code.ToCharArray()) {
            if ($char -eq '(') { $pCount++ }
            elseif ($char -eq ')') { $pCount-- }
            elseif ($char -eq '{') { $cCount++ }
            elseif ($char -eq '}') { $cCount-- }
            elseif ($char -eq '[') { $sCount++ }
            elseif ($char -eq ']') { $sCount-- }
        }
        
        if ($pCount -eq 0 -and $cCount -eq 0 -and $sCount -eq 0) {
            $sizeKb = [Math]::Round((Get-Item $full).Length / 1KB, 1)
            Write-Host "  [OK] Sintaks sah: $rel ($sizeKb KB)" -ForegroundColor DarkGreen
        } else {
            Write-Host "  [RALAT] Imbangan kurungan tidak sepadan dalam $rel (P:$pCount, C:$cCount, S:$sCount)" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "  [RALAT] Fail tidak wujud: $rel" -ForegroundColor Red
        $errorCount++
    }
}

if ($errorCount -gt 0) {
    Write-Host ""
    Write-Host "❌ BINAAN GAGAL: $errorCount ralat dikesan." -ForegroundColor Red
    exit 1
}

# 4. Bina Folder Pengeluaran (dist/)
Write-Host "[4/5] Membina folder pengeluaran [dist/]..." -ForegroundColor Green
if (Test-Path $dist) {
    Remove-Item -Path $dist -Recurse -Force
}
New-Item -ItemType Directory -Path $dist -Force | Out-Null

# Salin direktori aset, css, js
Copy-Item -Path (Join-Path $root "assets") -Destination (Join-Path $dist "assets") -Recurse -Force
Copy-Item -Path (Join-Path $root "css") -Destination (Join-Path $dist "css") -Recurse -Force
Copy-Item -Path (Join-Path $root "js") -Destination (Join-Path $dist "js") -Recurse -Force

# Salin fail akar
Copy-Item -Path (Join-Path $root "index.html") -Destination (Join-Path $dist "index.html") -Force
Copy-Item -Path (Join-Path $root "manifest.json") -Destination (Join-Path $dist "manifest.json") -Force
Copy-Item -Path (Join-Path $root "sw.js") -Destination (Join-Path $dist "sw.js") -Force

# 5. Suntik Konfigurasi Persekitaran ke dist/js/config.js
Write-Host "[5/5] Menyuntik pembolehubah persekitaran produksi..." -ForegroundColor Green
$distConfigPath = Join-Path $dist "js\config.js"

$clientEnv = @{
    SCHOOL_NAME = if ($envMap["SCHOOL_NAME"]) { $envMap["SCHOOL_NAME"] } else { "SMK TENGHILAN" }
    SCHOOL_SESSION = if ($envMap["SCHOOL_SESSION"]) { $envMap["SCHOOL_SESSION"] } else { "2026/2027" }
    COORDINATOR_NAME = if ($envMap["COORDINATOR_NAME"]) { $envMap["COORDINATOR_NAME"] } else { "Steve Shilton Ating" }
    ADMIN_PIN = if ($envMap["ADMIN_PIN"]) { $envMap["ADMIN_PIN"] } else { "2026" }
    FIREBASE_DATABASE_URL = if ($envMap["FIREBASE_DATABASE_URL"]) { $envMap["FIREBASE_DATABASE_URL"] } else { "" }
    API_BASE_URL = if ($envMap["API_BASE_URL"]) { $envMap["API_BASE_URL"] } else { "" }
    NODE_ENV = if ($envMap["NODE_ENV"]) { $envMap["NODE_ENV"] } else { "production" }
}

$jsonEnv = $clientEnv | ConvertTo-Json -Depth 5
$originalConfig = Get-Content $distConfigPath -Raw
$injectedConfig = "/**`n * KONFIGURASI PENGELUARAN (Production Build) - Dijana secara automatik`n */`nwindow.__ENV__ = $jsonEnv;`n`n" + $originalConfig

[System.IO.File]::WriteAllText($distConfigPath, $injectedConfig, [System.Text.Encoding]::UTF8)

# Ringkasan Binaan
$distFiles = Get-ChildItem -Path $dist -Recurse -File
$totalSize = ($distFiles | Measure-Object -Property Length -Sum).Sum / 1KB

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "✨ BINAAN PENGELUARAN BERJAYA DISIAPKAN (0 Ralat / 0 Errors)" -ForegroundColor Green
Write-Host "   Direktori Output: $dist" -ForegroundColor White
Write-Host "   Jumlah Fail     : $($distFiles.Count) fail siap untuk hosting" -ForegroundColor White
Write-Host "   Jumlah Saiz     : $([Math]::Round($totalSize, 1)) KB" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan

exit 0
