
$path = "src/app/(AdminUI)/DenetimKanitlari/DenetimKontrolTestleri/page.tsx"
$bytes = [System.IO.File]::ReadAllBytes($path)
$start = 830
$count = 20
if ($bytes.Length -gt $start) {
    if ($start + $count -gt $bytes.Length) { $count = $bytes.Length - $start }
    $chunk = $bytes[$start..($start + $count - 1)]
    $hex = $chunk | ForEach-Object { "{0:X2}" -f $_ }
    Write-Host "Bytes at $start: $($hex -join ' ')"
    
    # Try to decode as UTF-8
    try {
        $text = [System.Text.Encoding]::UTF8.GetString($chunk)
        Write-Host "Text (UTF-8): $text"
    }
    catch {
        Write-Host "Invalid UTF-8 sequence in chunk"
    }

    # Try to decode as Default
    try {
        $text = [System.Text.Encoding]::Default.GetString($chunk)
        Write-Host "Text (Default): $text"
    }
    catch {
        Write-Host "Invalid Default sequence in chunk"
    }
}
else {
    Write-Host "File too short"
}
