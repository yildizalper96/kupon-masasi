@echo off
rem Kullanim: yerel-guncelle.bat [live|full|due]   (Gorev Zamanlayicisi bunu cagirir)
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0.."
node tools\yerel-guncelle.mjs %* >> tools\yerel-guncelle.log 2>&1
