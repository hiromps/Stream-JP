# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

StreamPartnerJPは、Twitch Helix APIを使用してTwitchのグローバルバッジとエモートを表示するFlaskベースのWebアプリケーションです。多言語対応（日本語・英語）とVercelでのデプロイをサポートしています。

## 技術スタック

- **バックエンド**: Python 3 + Flask
- **フロントエンド**: Vanilla JavaScript、HTML5、CSS3
- **デプロイ**: Vercel (Serverless Functions)
- **API**: Twitch Helix API
- **外部データソース**: Stream Database API（バッジ・エモート追加日情報）

## 開発コマンド

### 依存関係のインストール
```bash
pip install -r requirements.txt
```

### ローカル開発サーバーの実行
```bash
python app.py
```
これにより、`http://0.0.0.0:5000`でFlask開発サーバーがデバッグモード有効で起動します。

### 環境変数の設定
`.env`ファイルを作成し、Twitch API認証情報を設定：
```
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
```

## アーキテクチャ

### デュアルデプロイ構造
アプリケーションは2つのFlask実装を持っています：

1. **ローカル開発用 (`app.py`)**:
   - 完全なFlaskアプリケーション
   - 静的ファイル配信
   - バッジ自動検出・監視システム
   - 管理者API（新バッジ管理）

2. **Vercelデプロイ用 (`api/index.py`)**:
   - Serverless Functions対応の軽量版
   - 静的ファイルはVercelが直接配信
   - 必要最小限のAPI機能のみ

### フロントエンド構造
- **メインページ** (`index.html` + `script.js`): バッジ一覧表示
- **エモートページ** (`emotes.html` + `emotes-script.js`): エモート一覧表示  
- **詳細ページ** (`badge-detail.html` + `badge-detail.js`): 個別バッジ詳細
- **管理ページ** (`admin.html`): 新バッジ承認システム
- **ストリームページ** (`stream.html` + `stream.js`): 動的バッジ表示

### 主要機能

#### バッジ・エモート管理システム
- Stream Database APIからの正確な追加日情報統合
- 自動新バッジ検出システム (`BadgeAutoUpdater`クラス in `app.py:161-340`)
- 管理者承認ワークフロー

#### 多言語対応
- 日本語・英語の動的切り替え
- JavaScript多言語化システム (`script.js`内の国際化機能)

#### データ拡張機能
- Twitchネイティブデータにタイムスタンプ付与
- アニメーション対応エモートURL生成
- バッジ入手方法詳細情報

## APIエンドポイント

### 公開API
- `GET /` - メインページ
- `GET /stream` - ストリームページ  
- `GET /api/badges` - Twitchグローバルバッジデータ（Stream Database拡張）
- `GET /api/emotes` - Twitchグローバルエモートデータ（Stream Database拡張）

### 管理者API（app.pyのみ）
- `GET /api/admin/pending-badges` - 承認待ち新バッジ一覧
- `POST /api/admin/approve-badge` - バッジ情報承認
- `GET /api/admin/force-check` - 手動バッジチェック実行

## 重要な実装詳細

### 認証とトークン管理
- 環境変数ベースの認証情報管理（`.env`ファイル使用）
- トークンキャッシュシステム（`get_app_access_token()`）
- 認証情報欠落時の適切なエラーハンドリング

### データソース統合
バッジ・エモートのタイムスタンプデータは以下の優先順位で処理：
1. Stream Database公式サイトからの正確な追加日（`badge_timestamps`辞書）
2. 部分一致による推定
3. 不明な場合は空データ

### 自動化システム
- 新バッジの自動検出（1時間間隔）
- 自動情報収集とキューイング
- 管理者承認待ちシステム