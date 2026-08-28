@echo off
title Video Reminder
cd /d "%~dp0"

echo ===================================================
echo   KHOI DONG VIDEO REMINDER (NHAC HEN PHAT VIDEO)
echo ===================================================
echo.

if not exist "node_modules\electron\dist\electron.exe" (
    echo Dang cai dat thu vien lan dau, vui long doi...
    call npm install
)

if not exist "dist\index.html" (
    echo Dang build ung dung, vui long doi...
    call npm run build
)

echo Dang khoi chay ung dung...
start "" "node_modules\electron\dist\electron.exe" .

exit
