
$enc1254 = [System.Text.Encoding]::GetEncoding(1254)
$utf8NoBom = new-object System.Text.UTF8Encoding($false)
$utf8Strict = new-object System.Text.UTF8Encoding($false, $true)

$files = Get-ChildItem -Path "src/app" -Recurse -Filter *.tsx

foreach ($file in $files) {
    try {
        # Try read strict UTF-8
        $content = [System.IO.File]::ReadAllText($file.FullName, $utf8Strict)
        # Force write back as No BOM
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Host "Normalized UTF-8 (No BOM): $($file.Name)"
    }
    catch {
        Write-Host "Detected invalid UTF-8 in $($file.Name). Converting from Windows-1254..."
        try {
            $content = [System.IO.File]::ReadAllText($file.FullName, $enc1254)
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "Fixed: $($file.Name)"
        }
        catch {
            Write-Host "Failed to convert $($file.Name): $_"
        }
    }
}
