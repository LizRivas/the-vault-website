@echo off
setlocal

cd /d "%~dp0"

echo Starting The Vault dev website preview...
echo.
echo Open this address if the browser does not open automatically:
echo http://localhost:8080
echo.

start "" "http://localhost:8080"

where node >nul 2>nul
if %errorlevel%==0 (
  node preview-server.js
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 -m http.server 8080
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 8080
  goto :eof
)

echo Python or Node was not found. Open the site with VS Code Live Server.
pause
