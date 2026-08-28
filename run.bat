@echo off
title Video Reminder
cd /d "%~dp0"

echo [1/3] Dong cac tien trinh cu dang chay ngam trong Taskbar...
taskkill /F /IM electron.exe 2>nul

echo [2/3] Dang cap nhat ban build moi nhat...
call npm run build

echo [3/3] Dang khoi chay Video Reminder...
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0"
exit
