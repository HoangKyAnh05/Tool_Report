@echo off
title Video Reminder
cd /d "%~dp0"

echo [1/2] Dang kiem tra ban build moi nhat...
if not exist "dist\index.html" (
    call npm run build
)

echo [2/2] Dang khoi chay Video Reminder...
start "" "node_modules\electron\dist\electron.exe" "%~dp0."
exit
