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

## 継続的メンテナンスタスク

### Stream Database統合による最新バッジ情報の取得

**重要**: このプロジェクトでは、https://www.streamdatabase.com/twitch/global-badges から継続的に最新のバッジ情報を取得し、詳細な入手方法情報を追加する必要があります。

#### 定期メンテナンスタスク（推奨：週1-2回）

1. **新バッジの発見と詳細情報追加**
   ```bash
   # 新バッジがある場合の作業フロー例：
   # "new-badge-name" が発見された場合
   ```

   **実行すべきタスク:**
   - Stream Databaseサイトで新バッジの詳細情報を調査
   - イベント名、開催日時、入手条件、参加チャンネル等を特定
   - Web検索で追加情報（公式発表、イベント詳細）を収集
   - 以下のファイルに情報を追加：
     - `script.js`: `badgeAvailabilityPeriods` オブジェクトに期間情報
     - `badge-detail.js`: `badgeAvailabilityPeriods` と `badgeObtainMethods` に詳細情報
     - 日本語・英語両方の入手方法説明を記載

2. **必要な情報の構造**
   ```javascript
   // script.js と badge-detail.js の badgeAvailabilityPeriods に追加
   'new-badge-name': {
       type: 'time-limited', // または 'ongoing', 'future'
       start: '2025-MM-DDTHH:mm:ssZ', // ISO 8601形式
       end: '2025-MM-DDTHH:mm:ssZ',
       description: 'イベント名とその説明'
   }

   // badge-detail.js の badgeObtainMethods に追加
   'new-badge-name': {
       ja: {
           title: 'バッジ名（日本語）',
           description: '詳細な説明文（日本語）',
           requirements: [
               '入手条件1',
               '入手条件2',
               '特記事項'
           ],
           availability: 'unavailable', // 'available' or 'unavailable'
           url: 'https://www.streamdatabase.com/twitch/global-badges/badge-name/1'
       },
       en: {
           title: 'Badge Name (English)',
           description: 'Detailed description (English)',
           requirements: [
               'Requirement 1',
               'Requirement 2', 
               'Special notes'
           ],
           availability: 'unavailable',
           url: 'https://www.streamdatabase.com/twitch/global-badges/badge-name/1'
       }
   }
   ```

3. **調査すべき情報項目**
   - **イベント名**: 正確なイベント名と主催者
   - **開催日時**: 開始・終了日時（UTCタイムゾーン）
   - **入手条件**: 視聴時間、サブスクリプション、特定チャンネル等
   - **特記事項**: Prime Gaming対象外、複数回サブスク必要等
   - **イベント背景**: 主催者、参加者、規模、意義等

4. **調査に使用すべきリソース**
   - **Primary**: https://www.streamdatabase.com/twitch/global-badges/[badge-name]
   - **Secondary**: Web検索、公式Twitchブログ、イベント公式サイト
   - **Tools**: WebSearch, WebFetch ツールを積極的に活用

5. **グレーアウト表示の自動化**
   - 期間終了したバッジは自動的にメインページ (`http://localhost:5000/index.html`) でグレーアウト表示
   - `getBadgeAvailabilityStatus()` 関数が現在日時と比較して自動判定
   - CSS `.badge-card:has(.availability-expired)` により視覚的効果を適用

6. **品質保証チェックリスト**
   - [ ] 正確な日時（タイムゾーン確認）
   - [ ] 日本語・英語両方の情報完備
   - [ ] 入手条件の詳細性と正確性
   - [ ] URLリンクの動作確認
   - [ ] 期間終了バッジのグレーアウト表示確認

#### 実装例（参考）
```javascript
// 今回追加されたバッジの例：
// - Evo 2025: 格闘ゲーム大会、サブスクリプション要件
// - La Velada V: スペインボクシングイベント、ibai視聴5分
// - ZEVENT 2024: フランスチャリティマラソン、15分視聴
// - Share the Love: バレンタインデー特別イベント
```

### 作業フロー推奨事項

1. **新バッジ発見時の対応**
   - TodoWrite ツールで作業項目を追跡
   - 複数バッジがある場合は並行して調査
   - 情報が不足している場合は「調査中」として記録

2. **コミット時の注意**
   - 各バッジの詳細情報追加を明確に記録
   - 日本語説明で主要な変更点を説明
   - テスト確認（グレーアウト表示等）を実施

3. **継続性の確保**
   - 定期的なStream Databaseサイトの監視
   - 季節イベント（ハロウィン、クリスマス等）の事前準備
   - 大型イベント（TwitchCon、E3等）の情報収集

**注意**: この作業は Stream-JP プロジェクトの品質と価値を維持するための重要なメンテナンス作業です。新しいバッジが追加された際は、ユーザーエクスペリエンス向上のため迅速かつ正確な情報追加を心がけてください。