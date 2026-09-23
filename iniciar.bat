@echo off
title Juegos TIC Solidario
cd /d "%~dp0"
echo.
echo   ====================================
echo    JUEGOS TIC SOLIDARIO
echo   ====================================
echo.
echo    Trivia    ^-^> http://localhost:3000
echo    Memotest  ^-^> http://localhost:3001
echo.
echo    Para cerrar todo: cierre esta ventana.
echo.
start "Trivia TIC"   /min cmd /c "node server.js"
start "Memotest TIC" /min cmd /c "node server-memo.js"
timeout /t 2 /nobreak >nul
start http://localhost:3000
start http://localhost:3001
echo   Listo. Los dos juegos estan abiertos en el navegador.
echo.
pause
