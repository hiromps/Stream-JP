# StreamPartnerJP ローカル環境セットアップガイド

## 1. 環境変数の設定

1. `.env.example`ファイルを`.env`にコピー：
   ```bash
   copy .env.example .env
   ```

2. `.env`ファイルを編集して、Twitch API認証情報を設定：
   - [Twitch Developer Console](https://dev.twitch.tv/console/apps)でアプリケーションを作成
   - Client IDとClient Secretを取得
   - `.env`ファイルに以下のように記入：
   ```
   TWITCH_CLIENT_ID=あなたのクライアントID
   TWITCH_CLIENT_SECRET=あなたのクライアントシークレット
   ```

## 2. 仮想環境の作成と依存関係のインストール

```bash
# 仮想環境を作成
python -m venv venv

# 仮想環境をアクティベート
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 依存関係をインストール
pip install -r requirements.txt
```

## 3. アプリケーションの起動

### 方法1: 起動スクリプトを使用（推奨）

**Windows:**
```bash
# バッチファイルをダブルクリックまたは実行
start.bat
```

**PowerShell:**
```powershell
# PowerShellスクリプトを実行
.\start.ps1
```

### 方法2: 手動で起動

```bash
# 仮想環境をアクティベート
venv\Scripts\activate

# アプリケーションを起動
python app.py
```

アプリケーションは `http://localhost:5000` で起動します。

## 4. トラブルシューティング

### 仮想環境のアクティベートができない場合

Windows PowerShellの場合：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1
```

### Twitch API認証エラーの場合

1. `.env`ファイルが正しく設定されているか確認
2. Twitch Developer ConsoleでアプリケーションのOAuth Redirect URLsに `http://localhost:5000` を追加
3. Client IDとClient Secretが正しくコピーされているか確認

### ポートが使用中の場合

別のポートでアプリケーションを起動：
```bash
# app.pyの最終行を以下のように変更
app.run(debug=True, host='0.0.0.0', port=5001)
```