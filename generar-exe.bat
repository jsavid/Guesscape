@echo off
chcp 65001 >nul
title Generar Ejecutable Windows (EXE) - Guesscape
color 0B

echo ========================================================
echo           GUISSCAPE - GENERADOR DE EJECUTABLE (EXE)
echo ========================================================
echo.

echo [1/3] Verificando icono de la aplicación...
if not exist "assets\icon.ico" (
    if exist "assets\icon.png" (
        echo Convirtiendo assets\icon.png a assets\icon.ico...
        python -c "from PIL import Image; img = Image.open('assets/icon.png'); img.save('assets/icon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)])"
    )
)

echo.
echo [2/3] Empaquetando aplicación de escritorio para Windows...
call node build-exe.js
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Falló el empaquetado del ejecutable.
    pause
    exit /b %ERRORLEVEL%
)

color 0A
echo.
echo ========================================================
echo   ¡EJECUTABLE GENERADO CON ÉXITO!
echo   Ubicación: %CD%\dist\Guesscape-win32-x64\Guesscape.exe
echo ========================================================
echo.
echo Abriendo la carpeta del ejecutable...
explorer "%CD%\dist\Guesscape-win32-x64"

echo.
pause
