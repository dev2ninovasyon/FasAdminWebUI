$enc1254 = [System.Text.Encoding]::GetEncoding(1254)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$filePath = "src\app\(AdminUI)\components\Layout\Vertical\Sidebar\MenuItems.ts"

Write-Host "Attempting to fix encoding for: $filePath"

try {
    Write-Host "Reading file with Windows-1254 encoding..."
    $content = [System.IO.File]::ReadAllText($filePath, $enc1254)
    
    Write-Host "Writing file with UTF-8 encoding (No BOM)..."
    [System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)
    
    Write-Host "Successfully fixed: $filePath"
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Full error: $_"
}
