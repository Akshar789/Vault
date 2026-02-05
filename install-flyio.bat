@echo off
echo Installing Fly.io CLI...
echo.

REM Download flyctl
powershell -Command "& {Invoke-WebRequest -Uri 'https://fly.io/install.ps1' -OutFile 'flyio-install.ps1'}"

REM Run installer
powershell -ExecutionPolicy Bypass -File flyio-install.ps1

REM Clean up
del flyio-install.ps1

echo.
echo Installation complete!
echo.
echo Please close this terminal and open a NEW terminal window.
echo Then run: fly auth login
echo.
pause
