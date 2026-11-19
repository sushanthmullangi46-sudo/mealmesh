@echo off
title MealMesh - Food Rescue and Redistribution
cd /d "%~dp0"
where java >nul 2>nul
if errorlevel 1 (
  echo Java 21 or newer is required. Install it from https://adoptium.net and run this file again.
  pause
  exit /b 1
)
echo Starting MealMesh... the browser will open at http://localhost:8080 in about 20 seconds.
echo Keep this window open while you use the app. Close it to stop MealMesh.
start "" /min cmd /c "timeout /t 20 >nul && start http://localhost:8080"
java -jar MealMesh.jar
pause
