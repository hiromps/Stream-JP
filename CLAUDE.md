# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

StreamPartnerJPは、Twitch Helix APIを使用してTwitchのグローバルバッジを表示するFlaskベースのWebアプリケーション（Twitchグローバルバッジビューアー）です。

## 技術スタック

- **バックエンド**: Python 3 + Flask
- **フロントエンド**: Vanilla JavaScript、HTML5、CSS3
- **API**: Twitch Helix API
- **主要な依存関係**:
  - `flask` - Webフレームワーク
  - `flask-cors` - CORS処理
  - `requests` - Twitch API用HTTPクライアント

## 開発コマンド

### アプリケーションの実行
```bash
python app.py
```
これにより、`http://0.0.0.0:5000`でFlask開発サーバーがデバッグモード有効で起動します。

### 依存関係のインストール
まず、仮想環境を作成します（推奨）：
```bash
python -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate
```

次に必要なパッケージをインストール：
```bash
pip install flask flask-cors requests
```

## アーキテクチャ

アプリケーションはシンプルなクライアント・サーバーアーキテクチャに従っています：

1. **バックエンド (`app.py`)**: 
   - Twitch APIへのプロキシとして機能するFlaskサーバー
   - トークンキャッシュ付きのTwitch OAuth2認証を処理
   - 静的ファイルの配信と`/api/badges`エンドポイントの提供
   - Twitch APIリクエストをプロキシすることでCORS問題を回避

2. **フロントエンド**:
   - `index.html`: メインページ構造
   - `script.js`: バッジデータの取得とUIインタラクションの処理
   - `style.css`: Twitchテーマのダークモードスタイリング

## 主要な実装詳細

### API認証
アプリはTwitch OAuth2クライアント認証フローを使用。APIコールを最小化するためアクセストークンはキャッシュされます：
- トークンキャッシュには有効期限の追跡が含まれる
- 期限切れ時の自動トークン更新
- `get_app_access_token()`関数に実装

### 現在の問題点

1. **ハードコードされた認証情報**: Twitch API認証情報が`app.py`に直接記述（10-11行目）
   - 環境変数に移行すべき
   - `.env`ファイルサポートのため`python-dotenv`の使用を検討

2. **依存関係管理の欠如**: `requirements.txt`ファイルが存在しない

3. **認証情報欠落時のエラー処理なし**: CLIENT_ID/CLIENT_SECRETが無効な場合アプリは失敗する

## 推奨される改善点

このコードベースで作業する際は以下を検討してください：

1. `requirements.txt`の作成：
   ```
   flask==2.3.2
   flask-cors==4.0.0
   requests==2.31.0
   python-dotenv==1.0.0
   ```

2. 環境変数サポートの追加：
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')
   CLIENT_SECRET = os.getenv('TWITCH_CLIENT_SECRET')
   ```

3. 環境変数欠落時のエラー処理の追加

4. `/api/badges`エンドポイントへのリクエストレート制限の検討

## APIエンドポイント

- `GET /` - メインHTMLページの配信
- `GET /api/badges` - Twitchグローバルバッジデータを返す
- `GET /<path>` - 静的ファイル（CSS、JS）の配信