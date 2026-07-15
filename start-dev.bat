@echo off
title StaffBook + Resume API
echo Starting Resume API on port 3001...
start "Resume API" cmd /c "cd /d D:\Resume-api\Resume-api && title Resume API (3001) && npm run dev -- -p 3001"
timeout /t 3 /nobreak >nul
echo Starting StaffBook on port 3000...
call npm run dev
pause
