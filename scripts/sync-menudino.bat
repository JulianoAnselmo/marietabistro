@echo off
REM -----------------------------------------------------------------------
REM sync-menudino.bat — wrapper para rodar o sync do cardapio via Task Scheduler
REM
REM O que faz:
REM   1. Muda para o diretorio raiz do projeto marieta (pai de scripts/)
REM   2. Chama `npm run sync:menudino`
REM   3. Acrescenta stdout+stderr num arquivo de log com data/hora
REM
REM Uso manual (para testar):
REM   C:\dev\clientes\marieta\scripts\sync-menudino.bat
REM
REM Agendamento no Task Scheduler (Windows):
REM   Programa/script: C:\dev\clientes\marieta\scripts\sync-menudino.bat
REM   (nada em "Adicionar argumentos" nem "Iniciar em")
REM -----------------------------------------------------------------------

cd /d "%~dp0.."

echo. >> scripts\sync-menudino.log
echo ================================ >> scripts\sync-menudino.log
echo Execucao: %DATE% %TIME% >> scripts\sync-menudino.log
echo ================================ >> scripts\sync-menudino.log

call npm run sync:menudino >> scripts\sync-menudino.log 2>&1

exit /b %ERRORLEVEL%
