@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0.."
node tools\yerel-tetik.mjs >> tools\yerel-guncelle.log 2>&1
