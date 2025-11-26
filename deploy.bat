@echo off
echo ========================================
echo Firebase Deployment Script
echo ========================================
echo.
echo Step 1: Logging in to Firebase...
echo (This will open your browser)
echo.
cmd /c firebase login
echo.
echo Step 2: Deploying to Firebase Hosting...
echo.
cmd /c firebase deploy --only hosting
echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your app is now live at:
echo https://trip-project1988.web.app
echo.
pause
