<#
.SYNOPSIS
    Next.js uygulamasını sunucuda derler ve IIS sitesine dağıtır (standalone çıktı, IIS'te node).

.DESCRIPTION
    Sunucudaki C:\deploy\guncelle.ps1 tarafından, depo origin/main'e çekildikten sonra çalıştırılır:

        C:\deploy\guncelle.ps1 -Uygulama FasAdminWebUI

    1. Derlemeye gömülen NEXT_PUBLIC_* değerlerini sunucudaki ortam dosyasından okur (repoda tutulmaz).
    2. npm ci ve npm run build çalıştırır.
    3. Standalone çıktıya static ve public klasörlerini ekler.
    4. Yalnızca bu sitenin AppPool'unu durdurur, dosyaları eşitler, AppPool'u başlatır. Sunucudaki diğer
       node süreçlerine dokunulmaz. Sitenin web.config dosyası ve logs klasörü korunur.
    5. Ana sayfayı yerel olarak isteyerek doğrular.
#>
[CmdletBinding()]
param(
    [string]$SiteKlasoru = "C:\inetpub\betadmin",
    [string]$AppPool = "betadmin",
    [string]$HostAdi = "betadmin.fasmart.app",
    [string]$DistDir = "build",
    [ValidateSet("https", "http")]
    # betadmin.fasmart.app için sertifika DNS sunucuya yönlendirilince alınır; o zamana kadar http.
    [string]$Protokol = "http",
    [string]$OrtamDosyasi = "C:\deploy\env\FasAdminWebUI.env"
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
$npm = "C:\Program Files\nodejs\npm.cmd"
Import-Module WebAdministration

Write-Host "==> [1/5] Ortam değişkenleri"
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"
if (Test-Path $OrtamDosyasi) {
    foreach ($satir in Get-Content $OrtamDosyasi) {
        if ($satir -match '^\s*([A-Za-z0-9_]+)\s*=(.*)$') {
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
    Write-Host "==> [2/5] npm ci"
    & $npm ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "npm ci başarısız (çıkış kodu $LASTEXITCODE)." }

    Write-Host "==> [2/5] npm run build"
    & $npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build başarısız (çıkış kodu $LASTEXITCODE)." }
}
finally {
    Pop-Location
}

Write-Host "==> [3/5] Standalone çıktı hazırlanıyor"
$dist = Join-Path $repo $DistDir
$standalone = Join-Path $dist "standalone"
if (-not (Test-Path (Join-Path $standalone "server.js"))) { throw "Standalone çıktı bulunamadı: $standalone" }
Copy-Item (Join-Path $dist "static") (Join-Path $standalone "$DistDir\static") -Recurse -Force
if (Test-Path (Join-Path $repo "public")) {
    Copy-Item (Join-Path $repo "public") (Join-Path $standalone "public") -Recurse -Force
}

Write-Host "==> [4/5] AppPool '$AppPool' durduruluyor ve dosyalar eşitleniyor"
$webConfig = Join-Path $SiteKlasoru "web.config"
$yedek = Join-Path $env:TEMP "$AppPool-web.config.yedek"
if (Test-Path $webConfig) { Copy-Item $webConfig $yedek -Force }

if ((Get-WebAppPoolState -Name $AppPool).Value -ne "Stopped") { Stop-WebAppPool -Name $AppPool }
foreach ($i in 1..30) {
    if ((Get-WebAppPoolState -Name $AppPool).Value -eq "Stopped") { break }
    Start-Sleep -Seconds 1
}
Start-Sleep -Seconds 2

try {
    & robocopy $standalone $SiteKlasoru /MIR /R:5 /W:3 /NP /NFL /NDL /NJH /XF web.config /XD logs
    if ($LASTEXITCODE -ge 8) { throw "robocopy başarısız (çıkış kodu $LASTEXITCODE)." }
}
finally {
    if (-not (Test-Path $webConfig) -and (Test-Path $yedek)) { Copy-Item $yedek $webConfig -Force }
    Start-WebAppPool -Name $AppPool
}

Write-Host "==> [5/5] Sağlık kontrolü"
$durum = ""
foreach ($deneme in 1..12) {
    Start-Sleep -Seconds 5
    $port = if ($Protokol -eq "https") { 443 } else { 80 }
    $durum = & curl.exe -s -o NUL -w "%{http_code}" --resolve "${HostAdi}:${port}:127.0.0.1" "${Protokol}://$HostAdi/"
    if ($durum -match '^[23]\d\d$') { break }
}
if ($durum -notmatch '^[23]\d\d$') { throw "Sağlık kontrolü başarısız: ${Protokol}://$HostAdi/ -> HTTP $durum" }
Write-Host "==> Dağıtım tamamlandı (HTTP $durum)."
