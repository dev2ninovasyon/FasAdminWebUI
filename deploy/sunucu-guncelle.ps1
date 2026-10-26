<#
.SYNOPSIS
    Next.js uygulamasını sunucuda derler ve IIS sitesine dağıtır (standalone çıktı, IIS'te node).

.DESCRIPTION
    Sunucudaki C:\deploy\guncelle.ps1 tarafından, depo origin/main'e çekildikten sonra çalıştırılır:

        C:\deploy\guncelle.ps1 -Uygulama FasAdminWebUI

    1. Derlemeye gömülen NEXT_PUBLIC_* değerlerini sunucudaki ortam dosyasından okur (repoda tutulmaz).
    2. package-lock.json değiştiyse npm ci, ardından npm run build çalıştırır (site bu sırada çalışmaya devam eder).
    3. Standalone çıktıya static ve public klasörlerini ekler.
    4. app_offline.htm ile siteyi geçici olarak kapatır: IIS bu sitenin node sürecini durdurur ve kullanıcılara
       bakım sayfası gösterir. Dosyaları eşitler ve siteyi açar. Sunucudaki diğer node süreçlerine dokunulmaz.
       Sitenin web.config dosyası ve logs klasörü korunur.
    5. Ana sayfayı yerel olarak isteyerek doğrular.
#>
[CmdletBinding()]
param(
    [string]$SiteKlasoru = "C:\inetpub\betadmin",
    [string]$HostAdi = "betadmin.fasmart.app",
    [string]$DistDir = "build",
    [ValidateSet("https", "http")]
    [string]$Protokol = "https",
    [string]$OrtamDosyasi = "C:\deploy\env\FasAdminWebUI.env",
    [string]$PaketOnbellekDosyasi = "C:\deploy\cache\FasAdminWebUI-package-lock.sha256",
    [switch]$PaketKurulumunuAtla
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
$nodeKlasoru = "C:\Program Files\nodejs"
$npm = Join-Path $nodeKlasoru "npm.cmd"
if (-not (Test-Path (Join-Path $nodeKlasoru "node.exe")) -or -not (Test-Path $npm)) {
    throw "Node.js kurulumu bulunamadı: $nodeKlasoru"
}
# Zamanlanmış görev/S4U oturumunda PATH kullanıcı ortamını içermeyebilir. npm'in lifecycle alt süreçleri
# node.exe'yi yalnız PATH üzerinden arar; bu nedenle Node.js klasörünü işlem PATH'ine açıkça ekle.
$pathParcalari = @($env:Path -split ";" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
if ($pathParcalari -notcontains $nodeKlasoru) {
    $env:Path = (@($nodeKlasoru) + $pathParcalari) -join ";"
}

# Windows PowerShell 5.1 uzaktan (WinRM) ya da yönlendirilmiş çalışırken yerel araçların stderr satırlarını
# hata kaydına çevirir; "Stop" ile bu, npm uyarılarında betiği keserdi. Çıktı günlüğe yazılır,
# başarı çıkış koduna göre değerlendirilir.
function Invoke-Arac {
    param([string]$Komut, [string[]]$Argumanlar)
    $onceki = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try { & $Komut @Argumanlar 2>&1 | ForEach-Object { Write-Host "$_" } }
    finally { $ErrorActionPreference = $onceki }
    return $LASTEXITCODE
}

Write-Host "==> [1/5] Ortam değişkenleri"
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"
if (Test-Path $OrtamDosyasi) {
    foreach ($satir in Get-Content $OrtamDosyasi) {
        # tr-TR kültüründe case-insensitive -match, ASCII I harfi içeren env anahtarlarını
        # [A-Za-z] aralığıyla eşleştirmeyebilir. Ortam anahtarları zaten büyük/küçük harfe duyarlıdır.
        if ($satir -cmatch '^\s*([A-Za-z0-9_]+)\s*=(.*)$') {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim(), "Process")
            Write-Host "   $($Matches[1]) ayarlandı"
        }
    }
}
else {
    Write-Host "   Ortam dosyası yok ($OrtamDosyasi); uygulamanın varsayılanları kullanılacak."
}

Push-Location $repo
try {
    $packageLock = Join-Path $repo "package-lock.json"
    $nodeModules = Join-Path $repo "node_modules"
    $packageLockHash = if (Test-Path -LiteralPath $packageLock) {
        (Get-FileHash -Algorithm SHA256 -LiteralPath $packageLock).Hash
    }
    else {
        ""
    }
    $cachedHash = if (Test-Path -LiteralPath $PaketOnbellekDosyasi) {
        [IO.File]::ReadAllText($PaketOnbellekDosyasi).Trim()
    }
    else {
        ""
    }
    $paketlerHazir = (Test-Path -LiteralPath $nodeModules) -and
        -not [string]::IsNullOrWhiteSpace($packageLockHash) -and
        $packageLockHash -eq $cachedHash

    if ($PaketKurulumunuAtla) {
        if (-not (Test-Path -LiteralPath $nodeModules)) {
            throw "Paket kurulumu atlanamaz; node_modules bulunamadı: $nodeModules"
        }
        Write-Host "==> [2/5] npm ci atlandı (hızlı dağıtım)"
    }
    elseif ($paketlerHazir) {
        Write-Host "==> [2/5] npm ci atlandı (package-lock.json değişmedi)"
    }
    else {
        # NODE_ENV=production iken npm ci devDependencies kurmaz; derleme araçları devDependencies'te olabilir.
        Write-Host "==> [2/5] npm ci"
        $kod = Invoke-Arac $npm @("ci", "--include=dev", "--no-audit", "--no-fund")
        if ($kod -ne 0) { throw "npm ci başarısız (çıkış kodu $kod)." }
    }

    if (-not [string]::IsNullOrWhiteSpace($packageLockHash)) {
        $cacheDirectory = Split-Path -Parent $PaketOnbellekDosyasi
        New-Item -ItemType Directory -Path $cacheDirectory -Force | Out-Null
        [IO.File]::WriteAllText($PaketOnbellekDosyasi, $packageLockHash, (New-Object Text.UTF8Encoding($false)))
    }

    Write-Host "==> [2/5] npm run build"
    $kod = Invoke-Arac $npm @("run", "build")
    if ($kod -ne 0) { throw "npm run build başarısız (çıkış kodu $kod)." }
}
finally {
    Pop-Location
}

Write-Host "==> [3/5] Standalone çıktı hazırlanıyor"
$dist = Join-Path $repo $DistDir
$standalone = Join-Path $dist "standalone"
$serverDosyasi = Join-Path $standalone "server.js"
if (-not (Test-Path $serverDosyasi)) { throw "Standalone çıktı bulunamadı: $standalone" }

# IIS AspNetCoreModule dinamik portu ASPNETCORE_PORT ile verir; Next.js standalone yalnız PORT'u okur.
$serverIcerigi = [IO.File]::ReadAllText($serverDosyasi)
$nextPortIfadesi = "parseInt(process.env.PORT, 10)"
$iisPortIfadesi = "parseInt(process.env.ASPNETCORE_PORT || process.env.PORT, 10)"
if ($serverIcerigi.Contains($nextPortIfadesi)) {
    $serverIcerigi = $serverIcerigi.Replace($nextPortIfadesi, $iisPortIfadesi)
    [IO.File]::WriteAllText($serverDosyasi, $serverIcerigi, (New-Object System.Text.UTF8Encoding($false)))
}
elseif (-not $serverIcerigi.Contains($iisPortIfadesi)) {
    throw "Standalone server.js port ifadesi tanınmadı; IIS port uyarlaması uygulanamadı."
}
Copy-Item (Join-Path $dist "static") (Join-Path $standalone "$DistDir\static") -Recurse -Force
if (Test-Path (Join-Path $repo "public")) {
    Copy-Item (Join-Path $repo "public") (Join-Path $standalone "public") -Recurse -Force
}

Write-Host "==> [4/5] Site geçici olarak kapatılıyor (app_offline.htm) ve dosyalar eşitleniyor"
$webConfig = Join-Path $SiteKlasoru "web.config"
$yedek = Join-Path $env:TEMP ("{0}-web.config.yedek" -f (Split-Path $SiteKlasoru -Leaf))
if (Test-Path $webConfig) { Copy-Item $webConfig $yedek -Force }

$offline = Join-Path $SiteKlasoru "app_offline.htm"
Set-Content -Path $offline -Encoding UTF8 -Value @"
<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Güncelleniyor</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;font-family:system-ui,Segoe UI,sans-serif;color:#0f172a}
.k{max-width:440px;padding:32px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;text-align:center}h1{font-size:18px;margin:0 0 8px}p{margin:0;color:#475569;font-size:14px;line-height:1.6}</style>
<meta http-equiv="refresh" content="20"></head><body><div class="k"><h1>Sistem güncelleniyor</h1><p>Yeni sürüm yükleniyor. Sayfa birkaç dakika içinde kendiliğinden yenilenecek.</p></div></body></html>
"@

# IIS node sürecini kapatıp dosyaları bırakana kadar bekle (yerel .node modülleri kilitlenir).
$kilitliOlabilir = @(Get-ChildItem $SiteKlasoru -Recurse -File -Filter "*.node" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
foreach ($i in 1..60) {
    $kilitli = $kilitliOlabilir | Where-Object {
        try { [IO.File]::Open($_, "Open", "ReadWrite", "None").Dispose(); $false } catch [IO.FileNotFoundException] { $false } catch { $true }
    }
    if (-not $kilitli) { break }
    Start-Sleep -Seconds 1
}
Start-Sleep -Seconds 2

try {
    $kod = Invoke-Arac "robocopy" @($standalone, $SiteKlasoru, "/MIR", "/R:5", "/W:3", "/NP", "/NFL", "/NDL", "/NJH", "/XF", "web.config", "app_offline.htm", "/XD", "logs")
    if ($kod -ge 8) { throw "robocopy başarısız (çıkış kodu $kod)." }
}
finally {
    if (-not (Test-Path $webConfig) -and (Test-Path $yedek)) { Copy-Item $yedek $webConfig -Force }
    Remove-Item $offline -Force -ErrorAction SilentlyContinue
}

Write-Host "==> [5/5] Sağlık kontrolü"
$port = if ($Protokol -eq "https") { 443 } else { 80 }
$durum = ""
foreach ($deneme in 1..12) {
    Start-Sleep -Seconds 5
    $durum = & curl.exe -s -o NUL -w "%{http_code}" --connect-timeout 5 --max-time 15 --resolve "${HostAdi}:${port}:127.0.0.1" "${Protokol}://$HostAdi/"
    if ($durum -match '^[23]\d\d$') { break }
}
if ($durum -notmatch '^[23]\d\d$') { throw "Sağlık kontrolü başarısız: ${Protokol}://$HostAdi/ -> HTTP $durum" }
Write-Host "==> Dağıtım tamamlandı (HTTP $durum)."
