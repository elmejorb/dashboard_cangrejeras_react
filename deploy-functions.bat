@echo off
echo ========================================
echo  Despliegue de Cloud Functions
echo  Cangrejeras de Santurce
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)
echo OK - Node.js instalado
echo.

echo [2/4] Verificando Firebase CLI...
firebase --version 2>nul
if errorlevel 1 (
    echo ERROR: Firebase CLI no esta instalado
    echo Ejecuta: npm install -g firebase-tools
    pause
    exit /b 1
)
echo OK - Firebase CLI instalado
echo.

echo [3/4] Instalando dependencias...
cd functions
call npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias
    cd ..
    pause
    exit /b 1
)
echo OK - Dependencias instaladas
cd ..
echo.

echo [4/4] Desplegando Cloud Functions...
echo.
echo IMPORTANTE: Asegurate de haber ejecutado:
echo   firebase use --add
echo.
pause
echo.

cd functions
call npm run deploy
if errorlevel 1 (
    echo.
    echo ERROR: Fallo el despliegue
    echo.
    echo Verifica:
    echo - Ejecutaste: firebase use --add
    echo - Tienes permisos en el proyecto
    echo - El plan Blaze esta habilitado
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo  DESPLIEGUE COMPLETADO!
echo ========================================
echo.
echo Funciones desplegadas:
echo - onMatchGoesLive
echo - onMatchFinished
echo - onVotingSessionActivated
echo - onVotingSessionFinished
echo - testNotification
echo.
pause
