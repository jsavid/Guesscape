@echo off
chcp 65001 >nul
title Generar APK - Guesscape
color 0B

echo ========================================================
echo               GUISSCAPE - GENERADOR DE APK
echo ========================================================
echo.

echo [1/3] Compilando recursos web (build.js)...
call node build.js
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Fallo al compilar recursos web.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Sincronizando con Capacitor (cap sync android)...
call npx.cmd cap sync android
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Fallo al sincronizar Capacitor con Android.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compilando APK de Release con Gradle...
cd android
call gradlew.bat assembleRelease
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Fallo al compilar el APK con Gradle.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy /Y "android\app\build\outputs\apk\release\app-release.apk" "Guesscape-release.apk" >nul
    color 0A
    echo.
    echo ========================================================
    echo   ¡APK GENERADO CON ÉXITO!
    echo   Ubicación: %CD%\Guesscape-release.apk
    echo ========================================================
) else (
    color 0E
    echo [AVISO] Compilado, pero no se encontró el archivo de salida esperado.
)

echo.
pause
