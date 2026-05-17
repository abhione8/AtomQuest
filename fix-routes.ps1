$path = 'f:\vsCode\AtomQuest\src\app\api'
$files = Get-ChildItem -Path $path -Recurse -Filter 'route.ts'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'getSession\(request\)', 'getSession()'
    $content = $content -replace 'session\.userId', 'session.id'
    $content = $content -replace 'createdBy: session\.id', 'createdBy: session.id'
    $content = $content -replace 'updatedBy: session\.id', 'updatedBy: session.id'
    Set-Content -Path $file.FullName -Value $content
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "All files fixed!"
