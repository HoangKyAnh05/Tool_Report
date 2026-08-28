@echo off
title Video Reminder
cd /d "%~dp0"

if not exist "node_modules\electron\dist\electron.exe" (
    echo [1/2] Dang cai dat thu vien, vui long doi...
    call npm install
)

if not exist "dist\index.html" (
    echo [2/2] Dang build ung dung, vui long doi...
    call npm run build
)

echo Dang khoi chay Video Reminder...
start "" "node_modules\electron\dist\electron.exe" "%~dp0."
exit
