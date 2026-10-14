@echo off
chcp 65001 >nul
title Generar Android App Bundle (AAB para Play Store) - Guesscape
color 0B

echo ========================================================
echo        GUISSCAPE - GENERADOR DE AAB (PLAY STORE)
echo ========================================================
echo.

echo [1/3] Compilando recursos web (build.js)...
call node build.js
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Falló al compilar recursos web.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Sincronizando con Capacitor (cap sync android)...
call npx.cmd cap sync android
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Falló al sincronizar Capacitor con Android.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compilando AAB de Release con Gradle...
cd android
call gradlew.bat bundleRelease
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Falló al compilar el AAB con Gradle.
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

if exist "android\app\build\outputs\bundle\release\app-release.aab" (
    copy /Y "android\app\build\outputs\bundle\release\app-release.aab" "Guesscape-release.aab" >nul
    color 0A
    echo.
    echo ========================================================
    echo   ¡AAB GENERADO CON ÉXITO PARA LA PLAY STORE!
    echo   Ubicación: %CD%\Guesscape-release.aab
    echo ========================================================
) else (
    color 0E
    echo [AVISO] Compilado, pero no se encontró el archivo AAB esperado.
)

echo.
pause
