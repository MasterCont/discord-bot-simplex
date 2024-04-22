@echo off
:startover
echo (%time%) App started.
npm start
echo (%time%) WARNING: App closed or crashed, restarting.
goto startover