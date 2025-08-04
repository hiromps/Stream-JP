@echo off
echo StreamPartnerJP を起動しています...
cd /d "%~dp0"
call venv\Scripts\activate.bat
echo 仮想環境をアクティベートしました
python app.py
pause