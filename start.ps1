# StreamPartnerJP 起動スクリプト
Write-Host "StreamPartnerJP を起動しています..." -ForegroundColor Green

# スクリプトのディレクトリに移動
Set-Location $PSScriptRoot

# 仮想環境をアクティベート
Write-Host "仮想環境をアクティベートしています..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Flaskアプリケーションを起動
Write-Host "アプリケーションを起動しています..." -ForegroundColor Yellow
Write-Host "アクセス先: http://localhost:5000" -ForegroundColor Cyan
python app.py