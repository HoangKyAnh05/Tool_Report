# PowerShell script to create Desktop Shortcut that runs without terminal window
$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ElectronExe = Join-Path $ProjectRoot "node_modules\electron\dist\electron.exe"
$VbsPath = Join-Path $ProjectRoot "scripts\launch-silent.vbs"

# Collect all possible Desktop locations
$DesktopLocations = @(
    [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop),
    "C:\Users\Admin\Desktop",
    "D:\Desktop",
    (Join-Path $env:USERPROFILE "Desktop"),
    (Join-Path $env:USERPROFILE "OneDrive\Desktop")
) | Where-Object { Test-Path $_ } | Select-Object -Unique

Write-Host "Creating Desktop Shortcut for Video Reminder..." -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Electron Executable: $ElectronExe" -ForegroundColor Gray

$WshShell = New-Object -ComObject WScript.Shell

foreach ($Desktop in $DesktopLocations) {
    $ShortcutPath = Join-Path $Desktop "Video Reminder.lnk"
    
    $LauncherVbs = Join-Path $ProjectRoot "scripts\launcher.vbs"
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = "wscript.exe"
    $Shortcut.Arguments = "`"$LauncherVbs`""
    $Shortcut.WorkingDirectory = "$ProjectRoot"
    $Shortcut.Description = "Video Reminder - Ứng dụng Nhắc Hẹn & Báo Thức Phát Video Chạy Ngầm"
    $Shortcut.IconLocation = "$ProjectRoot\icon.ico"
    $Shortcut.WindowStyle = 1 # Normal Window
    $Shortcut.Save()

    Write-Host " Shortcut created: $ShortcutPath" -ForegroundColor Green
}

Write-Host "`nDouble click 'Video Reminder' icon on your Desktop to open app immediately." -ForegroundColor Yellow
