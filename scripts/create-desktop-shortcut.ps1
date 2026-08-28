# PowerShell script to create Desktop Shortcut that runs without terminal window
$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$VbsPath = Join-Path $ProjectRoot "scripts\launch-silent.vbs"
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path $DesktopPath "Video Reminder.lnk"

Write-Host "Creating Desktop Shortcut for Video Reminder..." -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Shortcut Target: $ShortcutPath" -ForegroundColor Gray

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$VbsPath`""
$Shortcut.WorkingDirectory = "$ProjectRoot"
$Shortcut.Description = "Video Reminder - Ứng dụng Nhắc Hẹn & Báo Thức Phát Video Chạy Ngầm"

# Try to use shell32 icon (alarm clock / bell) or custom icon
$Shortcut.IconLocation = "shell32.dll,239" 
$Shortcut.WindowStyle = 7 # Minimized / Hidden
$Shortcut.Save()

Write-Host "Shortcut created successfully on Desktop: $ShortcutPath" -ForegroundColor Green
Write-Host "Double click 'Video Reminder' icon on your Desktop to run silently in background." -ForegroundColor Yellow
