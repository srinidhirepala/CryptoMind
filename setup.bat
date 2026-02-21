@echo off
echo ============================================
echo  CryptoMind - Setup Script
echo ============================================

REM Verify Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/ and re-run this script.
    pause
    exit /b 1
)

echo Node.js found: 
node --version

REM Install dependencies
echo.
echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)

REM Copy env file if .env.local doesn't exist
if not exist ".env.local" (
    echo.
    echo Creating .env.local from template...
    copy ".env.local.example" ".env.local"
    echo IMPORTANT: Edit .env.local and add your OPENAI_API_KEY!
)

echo.
echo ============================================
echo  Setup Complete!
echo ============================================
echo.
echo Next steps:
echo  1. Edit .env.local and add your OPENAI_API_KEY
echo  2. Run: npm run dev
echo  3. Open http://localhost:3000
echo.
pause
