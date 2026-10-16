# ============================================================================
#  PELAYAN TEMPATAN e-AGIHAN SMK TENGHILAN (PowerShell REST API + Static Server)
#  Penyelaras: Steve Shilton Ating
# ============================================================================

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Muat pembolehubah dari .env jika wujud
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            if (-not [System.Environment]::GetEnvironmentVariable($key)) {
                [System.Environment]::SetEnvironmentVariable($key, $val)
            }
        }
    }
}

# Tetapan port & persekitaran
$port = if ($env:PORT) { [int]$env:PORT } else { 8089 }
$isProduction = ($env:NODE_ENV -eq "production") -or ($env:ENVIRONMENT -eq "production")
$schoolName = if ($env:SCHOOL_NAME) { $env:SCHOOL_NAME } else { "SMK TENGHILAN" }
$schoolSession = if ($env:SCHOOL_SESSION) { $env:SCHOOL_SESSION } else { "2026/2027" }
$coordinatorName = if ($env:COORDINATOR_NAME) { $env:COORDINATOR_NAME } else { "Steve Shilton Ating" }

$dataPath = Join-Path $root "data\pendaftaran.json"

# Pastikan fail pangkalan data wujud
if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path (Join-Path $root "data") -Force | Out-Null
    @{ school = $schoolName; session = $schoolSession; coordinator = $coordinatorName; registrations = @() } | ConvertTo-Json -Depth 10 | Set-Content $dataPath -Encoding UTF8
}

# Dapatkan IP Wi-Fi / Tempatan
$ips = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object { 
    $_.AddressFamily -eq 'InterNetwork' -and $_.IPAddressToString -notlike '127.*' -and $_.IPAddressToString -notlike '169.254.*'
}
$localIP = if ($ips) { $ips[0].IPAddressToString } else { '127.0.0.1' }

Clear-Host
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "   SISTEM PENGUTIPAN & PENDAFTARAN SUBJEK GURU (e-Agihan SMKTego 2026)" -ForegroundColor Yellow
Write-Host "   Sekolah Menengah Kebangsaan Tenghilan, Tuaran, Sabah" -ForegroundColor White
Write-Host "   Penyelaras Jadual Waktu: Steve Shilton Ating (Sidang Pagi)" -ForegroundColor White
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [+] Komputer Penyelaras : " -NoNewline -ForegroundColor Green
Write-Host "http://localhost:$port" -ForegroundColor White
if ($localIP -ne '127.0.0.1') {
    Write-Host "  [+] Telefon Guru (Wi-Fi): " -NoNewline -ForegroundColor Yellow
    Write-Host "http://$localIP`:$port" -ForegroundColor White
}
Write-Host ""
Write-Host "  PANDUAN GURU:" -ForegroundColor Magenta
Write-Host "  1. Sambungkan telefon ke Wi-Fi / Hotspot yang sama." -ForegroundColor Gray
Write-Host "  2. Buka alamat http://$localIP`:$port atau imbas Kod QR dalam sistem." -ForegroundColor Gray
Write-Host "  3. Tekan 'Pasang App Telefon' untuk simpan ke skrin utama telefon." -ForegroundColor Gray
Write-Host ""
Write-Host "  Tekan Ctrl+C pada tetingkap ini untuk menamatkan pelayan." -ForegroundColor DarkYellow
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$listener = New-Object System.Net.HttpListener

# Cuba mulakan pelayan pada semua antara muka rangkaian (Wildcard)
$listenerStarted = $false
try {
    $listener.Prefixes.Add("http://*:$port/")
    $listener.Start()
    $listenerStarted = $true
    Write-Host "  [i] Pelayan mendengar pada semua antara muka (Wi-Fi + Localhost)." -ForegroundColor Green
} catch {
    # Fallback kepada localhost jika akses dinafikan oleh Windows ACL
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
    try {
        $listener.Start()
        $listenerStarted = $true
        Write-Host "  [i] Pelayan aktif pada mod Localhost." -ForegroundColor Yellow
        Write-Host "      (Tip: Untuk membenarkan telefon guru di Wi-Fi, jalankan IZINKAN_AKSES_WIFI.bat sebagai Pentadbir)" -ForegroundColor DarkGray
    } catch {
        Write-Host "Ralat memulakan pelayan: $_" -ForegroundColor Red
        exit 1
    }
}


if (-not $isProduction -and -not $env:CI -and -not $env:HEADLESS) {
    Start-Process "http://localhost:$port"
}

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response

        # CORS Headers
        $res.Headers.Add('Access-Control-Allow-Origin', '*')
        $res.Headers.Add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        $res.Headers.Add('Access-Control-Allow-Headers', 'Content-Type')

        if ($req.HttpMethod -eq 'OPTIONS') {
            $res.StatusCode = 200
            $res.Close()
            continue
        }

        $rawPath = $req.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($rawPath)) { $rawPath = 'index.html' }

        # API: Status
        if ($rawPath -eq 'api/status') {
            $res.ContentType = 'application/json; charset=utf-8'
            $buf = [System.Text.Encoding]::UTF8.GetBytes('{"status":"ok"}')
            $res.OutputStream.Write($buf, 0, $buf.Length)
            $res.Close()
            continue
        }

        # API: Data
        if ($rawPath -eq 'api/data') {
            $res.ContentType = 'application/json; charset=utf-8'
            if (Test-Path $dataPath) {
                $buf = [System.IO.File]::ReadAllBytes($dataPath)
            } else {
                $buf = [System.Text.Encoding]::UTF8.GetBytes('{"registrations":[]}')
            }
            $res.OutputStream.Write($buf, 0, $buf.Length)
            $res.Close()
            continue
        }

        # API: Departments (Simpan Subjek & Bidang yang dikemaskini/ditambah)
        if ($rawPath -eq 'api/departments' -and $req.HttpMethod -eq 'POST') {
            $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd() | ConvertFrom-Json
            $db = @{ school = "SMK TENGHILAN"; session = "2026/2027"; registrations = @() }
            if (Test-Path $dataPath) {
                $rawDb = Get-Content $dataPath -Raw -Encoding UTF8
                if ($rawDb) { $db = $rawDb | ConvertFrom-Json }
            }
            $db.departments = $body.departments
            $db.lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
            $db | ConvertTo-Json -Depth 10 | Set-Content $dataPath -Encoding UTF8
            Write-Host "[KEMASKINI SUBJEK] Senarai subjek dan bidang berjaya dikemaskini." -ForegroundColor Green
            $res.ContentType = 'application/json; charset=utf-8'
            $respBuf = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
            $res.OutputStream.Write($respBuf, 0, $respBuf.Length)
            $res.Close()
            continue
        }

        # API: Teachers (Simpan Senarai Guru Baharu)
        if ($rawPath -eq 'api/teachers' -and $req.HttpMethod -eq 'POST') {
            $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd() | ConvertFrom-Json
            $db = @{ school = "SMK TENGHILAN"; session = "2026/2027"; registrations = @() }
            if (Test-Path $dataPath) {
                $rawDb = Get-Content $dataPath -Raw -Encoding UTF8
                if ($rawDb) { $db = $rawDb | ConvertFrom-Json }
            }
            $db.teachers = $body.teachers
            $db.lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
            $db | ConvertTo-Json -Depth 10 | Set-Content $dataPath -Encoding UTF8
            Write-Host "[KEMASKINI GURU] Senarai guru telah dikemaskini. Jumlah: $(@($body.teachers).Count) orang." -ForegroundColor Green
            $res.ContentType = 'application/json; charset=utf-8'
            $respBuf = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
            $res.OutputStream.Write($respBuf, 0, $respBuf.Length)
            $res.Close()
            continue
        }

        # API: Register
        if ($rawPath -eq 'api/register' -and $req.HttpMethod -eq 'POST') {
            $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
            $newReg = $body | ConvertFrom-Json

            $db = @{ school = "SMK TENGHILAN"; session = "2026/2027"; registrations = @() }
            if (Test-Path $dataPath) {
                $rawDb = Get-Content $dataPath -Raw -Encoding UTF8
                if ($rawDb) { $db = $rawDb | ConvertFrom-Json }
            }

            $regs = @($db.registrations)
            $conflict = $false
            $existingReg = $null

            foreach ($r in $regs) {
                if ($r.subjectCode -eq $newReg.subjectCode -and $r.classId -eq $newReg.classId) {
                    if ($r.teacherId -ne $newReg.teacherId) {
                        $conflict = $true
                        $existingReg = $r
                        break
                    }
                }
            }

            if ($conflict -and -not $newReg.isOverride) {
                Write-Host "[AMARAN KONFLIK] Guru: $($newReg.teacherName) cuba mendaftar subjek $($newReg.subjectName) kelas $($newReg.className) yang telah diambil oleh $($existingReg.teacherName)!" -ForegroundColor Red
                $respObj = @{
                    success = $false
                    conflict = $true
                    existing = $existingReg
                    message = "Subjek $($newReg.subjectName) untuk kelas $($newReg.className) telah didaftarkan. Sila berhubung dengan Guru Kanan Matapelajaran subjek ini"
                }
            } else {
                # Kemaskini atau tambah
                $filtered = @()
                foreach ($r in $regs) {
                    if (-not ($r.subjectCode -eq $newReg.subjectCode -and $r.classId -eq $newReg.classId)) {
                        $filtered += $r
                    }
                }
                $filtered += $newReg
                $db.registrations = $filtered
                $db.lastUpdated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
                $db | ConvertTo-Json -Depth 10 | Set-Content $dataPath -Encoding UTF8

                Write-Host "[PENDAFTARAN BERJAYA] $(Get-Date -Format 'HH:mm:ss') | $($newReg.teacherName) -> $($newReg.subjectName) -> $($newReg.className) ($($newReg.hours) Waktu)" -ForegroundColor Green
                $respObj = @{ success = $true; registrations = $filtered }
            }

            $res.ContentType = 'application/json; charset=utf-8'
            $jsonResp = $respObj | ConvertTo-Json -Depth 10
            $buf = [System.Text.Encoding]::UTF8.GetBytes($jsonResp)
            $res.OutputStream.Write($buf, 0, $buf.Length)
            $res.Close()
            continue
        }

        # API: Delete
        if ($rawPath -eq 'api/delete' -and $req.HttpMethod -eq 'POST') {
            $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd() | ConvertFrom-Json
            $db = Get-Content $dataPath -Raw -Encoding UTF8 | ConvertFrom-Json
            $filtered = @()
            foreach ($r in @($db.registrations)) {
                if ($r.id -ne $body.id) { $filtered += $r }
            }
            $db.registrations = $filtered
            $db | ConvertTo-Json -Depth 10 | Set-Content $dataPath -Encoding UTF8

            Write-Host "[BATAL PENDAFTARAN] ID: $($body.id) telah dipadam." -ForegroundColor Yellow
            $res.ContentType = 'application/json; charset=utf-8'
            $respObj = @{ success = $true; registrations = $filtered } | ConvertTo-Json -Depth 10
            $buf = [System.Text.Encoding]::UTF8.GetBytes($respObj)
            $res.OutputStream.Write($buf, 0, $buf.Length)
            $res.Close()
            continue
        }

        # API: Clear
        if ($rawPath -eq 'api/clear' -and $req.HttpMethod -eq 'POST') {
            $db = @{ school = 'SMK TENGHILAN'; session = '2026/2027'; registrations = @() }
            $db | ConvertTo-Json -Depth 10 | Set-Content $dataPath -Encoding UTF8
            Write-Host "[RESET] Pangkalan data telah dikosongkan oleh Penyelaras." -ForegroundColor Red
            $res.StatusCode = 200
            $res.Close()
            continue
        }

        # API: Import
        if ($rawPath -eq 'api/import' -and $req.HttpMethod -eq 'POST') {
            $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd() | ConvertFrom-Json
            $db = @{ school = 'SMK TENGHILAN'; session = '2026/2027'; registrations = @($body.registrations) }
            $db | ConvertTo-Json -Depth 10 | Set-Content $dataPath -Encoding UTF8
            Write-Host "[IMPORT] $(@($body.registrations).Count) rekod berjaya diimport." -ForegroundColor Green
            $res.StatusCode = 200
            $res.Close()
            continue
        }

        # Static Files
        $file = Join-Path $root $rawPath
        if (Test-Path $file -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($file)
            if ($file.EndsWith('.html')) { $res.ContentType = 'text/html; charset=utf-8' }
            elseif ($file.EndsWith('.css')) { $res.ContentType = 'text/css; charset=utf-8' }
            elseif ($file.EndsWith('.js')) { $res.ContentType = 'application/javascript; charset=utf-8' }
            elseif ($file.EndsWith('.json')) { $res.ContentType = 'application/json; charset=utf-8' }
            elseif ($file.EndsWith('.png')) { $res.ContentType = 'image/png' }
            elseif ($file.EndsWith('.jpg') -or $file.EndsWith('.jpeg')) { $res.ContentType = 'image/jpeg' }
            elseif ($file.EndsWith('.svg')) { $res.ContentType = 'image/svg+xml' }
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
        }
        $res.Close()
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
