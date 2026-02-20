
$path = "src/app/(AdminUI)/DenetimKanitlari/DenetimKontrolTestleri/page.tsx"
$enc1254 = [System.Text.Encoding]::GetEncoding(1254)
$utf8 = new-object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, $enc1254)
[System.IO.File]::WriteAllText($path, $content, $utf8)
Write-Host "Forced 1254 -> UTF8 for $path"
