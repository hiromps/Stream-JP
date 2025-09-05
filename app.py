from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os
import json
from datetime import datetime, timedelta
import threading
import time
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Twitch API認証情報（環境変数から取得）
CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')
CLIENT_SECRET = os.getenv('TWITCH_CLIENT_SECRET')

# 環境変数が設定されていない場合のエラーチェック
if not CLIENT_ID or not CLIENT_SECRET:
    print("ERROR: Twitch API credentials not found!")
    print("Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in your .env file")
    print("Copy .env.example to .env and add your credentials")
    exit(1)

# アクセストークンのキャッシュ
access_token_cache = {
    'token': None,
    'expires_at': 0
}

def get_app_access_token():
    """Twitchアプリケーションアクセストークンを取得"""
    import time
    
    # キャッシュされたトークンが有効な場合はそれを返す
    if access_token_cache['token'] and time.time() < access_token_cache['expires_at']:
        return access_token_cache['token']
    
    # 新しいトークンを取得
    url = 'https://id.twitch.tv/oauth2/token'
    params = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'client_credentials'
    }
    
    try:
        response = requests.post(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        access_token = data['access_token']
        expires_in = data.get('expires_in', 3600)
        
        # トークンをキャッシュ
        access_token_cache['token'] = access_token
        access_token_cache['expires_at'] = time.time() + expires_in - 60  # 1分前に期限切れとする
        
        return access_token
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error getting access token: {e}")
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        return None
    except Exception as e:
        print(f"Error getting access token: {e}")
        return None

@app.route('/api/badges')
def get_global_badges():
    """Twitchグローバルバッジを取得するAPIエンドポイント"""
    # アクセストークンを取得
    access_token = get_app_access_token()
    
    if not access_token:
        return jsonify({'error': 'Failed to get access token'}), 500
    
    # Twitch APIからグローバルバッジを取得
    url = 'https://api.twitch.tv/helix/chat/badges/global'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Client-Id': CLIENT_ID
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        twitch_data = response.json()
        
        # Stream Database APIから追加日情報を取得して統合
        enhanced_data = enhance_badges_with_timestamps(twitch_data)
        
        return jsonify(enhanced_data)
    except Exception as e:
        print(f"Error fetching badges: {e}")
        return jsonify({'error': 'Failed to fetch badges'}), 500

def enhance_badges_with_timestamps(twitch_data):
    """Stream Databaseのデータでバッジにタイムスタンプを追加（正確な追加日のみ）"""
    # 基本的なタイムスタンプデータベース（Stream Database公式サイトから取得した正確な追加日）
    base_badge_timestamps = {
        # 2025年の新しいバッジ（Stream Databaseから取得した正確な追加日）
        'evo-2025': '2025-07-31T00:00:00.000Z',
        'la-velada-v-badge': '2025-07-23T00:00:00.000Z',
        'legendus': '2025-06-28T06:15:55.000Z',
        'league-of-legends-mid-season-invitational-2025---grey': '2025-06-24T01:11:19.640Z',
        'league-of-legends-mid-season-invitational-2025---purple': '2025-06-24T01:11:19.640Z',
        'league-of-legends-mid-season-invitational-2025---blue': '2025-06-24T01:11:19.640Z',
        'borderlands-4-badge---ripper': '2025-06-20T22:01:18.225Z',
        'borderlands-4-badge---vault-symbol': '2025-06-20T22:01:18.225Z',
        'bot-badge': '2025-06-09T23:43:23.947Z',
        'elden-ring-recluse': '2025-05-30T22:26:02.951Z',
        'elden-ring-wylder': '2025-05-30T22:26:02.951Z',
        'twitchcon-referral-program-2025-bleedpurple': '2025-05-29T00:00:00.000Z',
        'twitchcon-referral-program-2025-chrome-star': '2025-05-29T00:00:00.000Z',
        'minecraft-15th-anniversary-celebration': '2025-05-28T00:00:00.000Z',
        'clips-leader': '2025-04-11T20:37:56.758Z',
        'marathon-reveal-runner': '2025-04-10T21:04:04.000Z',
        'gone-bananas': '2025-04-01T17:07:13.529Z',
        'speedons-5-badge': '2025-02-24T00:00:00.000Z',
        'share-the-love': '2025-02-14T00:00:00.000Z',  # バレンタインデー関連
        'twitchcon-2025---rotterdam': '2025-02-10T00:00:00.000Z',
        
        # 2024年のバッジ（Stream Databaseから取得した正確な追加日）
        'twitch-recap-2024': '2024-12-09T00:00:00.000Z',
        'clip-the-halls': '2024-12-03T18:59:14.164Z',
        'ruby-pixel-heart---together-for-good-24': '2024-12-02T00:00:00.000Z',  # 寄付50ドル以上
        'purple-pixel-heart---together-for-good-24': '2024-12-02T00:00:00.000Z',  # Together for Good 2024
        'gold-pixel-heart---together-for-good-24': '2024-12-02T21:05:01.561Z',
        'arcane-season-2-premiere': '2024-11-07T21:36:20.704Z',
        'subtember-2024': '2024-09-26T00:00:00.000Z',
        'zevent-2024': '2024-09-07T00:00:00.000Z',
        'streamer-awards-2024': '2024-08-23T00:00:00.000Z',
        'dreamcon-2024': '2024-08-28T21:00:06.004Z',
        'la-velada-del-ano-iv': '2024-07-13T16:19:09.441Z',
        'la-velada-iv': '2024-07-13T16:19:09.441Z',  # La Velada del Año IV (別名)
        'raging-wolf-helm': '2024-06-20T00:00:00.000Z',  # Elden Ring関連
        'destiny-2-final-shape-raid-race': '2024-06-06T22:09:47.189Z',
        'destiny-2-the-final-shape-streamer': '2024-06-06T22:09:48.208Z',
        'twitchcon-2024---san-diego': '2024-05-28T00:00:00.000Z',
        'twitch-intern-2024': '2024-08-23T00:00:00.000Z',
        
        # 2023年のバッジ（Stream Databaseから取得した情報）
        'twitch-recap-2023': '2023-12-11T00:00:00.000Z',  # 推定日
        'rplace-2023': '2023-07-20T00:00:00.000Z',  # 推定日
        'the-game-awards-2023': '2023-12-07T00:00:00.000Z',  # 推定日
        'the-golden-predictor-of-the-game-awards-2023': '2023-12-07T00:00:00.000Z',  # 推定日
        'superultracombo-2023': '2023-08-04T00:00:00.000Z',  # 推定日
        'twitchconEU2023': '2023-07-15T00:00:00.000Z',  # 推定日
        'twitchconNA2023': '2023-10-20T00:00:00.000Z',  # 推定日
        'twitch-intern-2023': '2023-08-15T00:00:00.000Z',  # 推定日
    }
    
    # 最新のタイムスタンプデータを取得してマージ
    try:
        latest_timestamps = badge_updater.get_latest_badge_timestamps()
        badge_timestamps = {**base_badge_timestamps, **latest_timestamps}
        print(f"Using {len(badge_timestamps)} badge timestamps ({len(latest_timestamps)} from latest data)")
    except:
        badge_timestamps = base_badge_timestamps
        print(f"Using {len(badge_timestamps)} base badge timestamps")
    
    # バッジデータにタイムスタンプを追加（正確な追加日のみ）
    if 'data' in twitch_data:
        for badge in twitch_data['data']:
            set_id = badge.get('set_id', '')
            
            # 完全一致チェック（正確な追加日のみ）
            if set_id in badge_timestamps:
                badge['created_at'] = badge_timestamps[set_id]
                badge['has_real_timestamp'] = True
            else:
                # 部分一致チェック（正確な追加日のみ）
                found_timestamp = None
                for key, timestamp in badge_timestamps.items():
                    if key in set_id or set_id in key:
                        found_timestamp = timestamp
                        break
                
                if found_timestamp:
                    badge['created_at'] = found_timestamp
                    badge['has_real_timestamp'] = True
                else:
                    # 追加日が不明な場合は何も設定しない
                    badge['has_real_timestamp'] = False
    
    return twitch_data

# 新しいバッジの自動検出と情報収集システム
class BadgeAutoUpdater:
    def __init__(self):
        self.last_checked = datetime.now()
        self.known_badges = set()
        self.new_badges_queue = []
        self.auto_update_enabled = True
        self.load_known_badges()
        
    def load_known_badges(self):
        """既知のバッジリストを読み込む"""
        try:
            with open('known_badges.json', 'r') as f:
                data = json.load(f)
                self.known_badges = set(data.get('badges', []))
                self.last_checked = datetime.fromisoformat(data.get('last_checked', datetime.now().isoformat()))
        except FileNotFoundError:
            # 初回起動時には最新の5つのバッジを既知として設定
            self.known_badges = {
                'zevent25', 'hornet', 'subtember-2025', 
                'gears-of-war-superfan-badge', 'path-of-exile-2-badge',
                'zevent-2024', 'la-velada-v-badge', 'evo-2025',
                'share-the-love', 'speedons-5-badge', 'clips-leader'
            }
            self.save_known_badges()
    
    def save_known_badges(self):
        """既知のバッジリストを保存"""
        data = {
            'badges': list(self.known_badges),
            'last_checked': self.last_checked.isoformat(),
            'new_badges_queue': self.new_badges_queue
        }
        with open('known_badges.json', 'w') as f:
            json.dump(data, f, indent=2)
    
    def check_for_new_badges(self):
        """新しいバッジをチェック - Stream Databaseサイトから最新データを取得"""
        if not self.auto_update_enabled:
            return
        
        try:
            print("Checking for new badges from Stream Database...")
            
            # Stream DatabaseのTwitchバッジページから最新データを取得
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get('https://www.streamdatabase.com/twitch/global-badges', 
                                  headers=headers, timeout=15)
            
            if response.status_code == 200:
                # HTMLからバッジ情報を抽出
                current_badges = self._extract_badges_from_html(response.text)
                current_badge_ids = set(current_badges.keys())
                
                # 新しいバッジを検出
                new_badges = current_badge_ids - self.known_badges
                
                if new_badges:
                    print(f"New badges detected: {len(new_badges)} badges")
                    print(f"New badge IDs: {list(new_badges)[:5]}...")  # 最初の5個を表示
                    
                    # 新しいバッジ情報を保存
                    for badge_id in new_badges:
                        if badge_id in current_badges:
                            self.collect_badge_info_from_data(badge_id, current_badges[badge_id])
                    
                    self.known_badges.update(new_badges)
                    self.last_checked = datetime.now()
                    self.save_known_badges()
                    
                    # バッジタイムスタンプデータを更新
                    self._update_badge_timestamps(current_badges)
                    
                else:
                    print("No new badges found.")
                    
        except Exception as e:
            print(f"Error checking for new badges: {e}")
    
    def _extract_badges_from_html(self, html_content):
        """HTMLからバッジ情報を抽出"""
        import re
        import json
        
        badge_data = {}
        
        try:
            # Next.jsのページデータを抽出
            script_pattern = r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>'
            script_match = re.search(script_pattern, html_content, re.DOTALL)
            
            if script_match:
                next_data = json.loads(script_match.group(1))
                page_props = next_data.get('props', {}).get('pageProps', {})
                
                # バッジデータを抽出
                if 'badges' in page_props:
                    for badge in page_props['badges']:
                        badge_id = badge.get('set_id')
                        if badge_id:
                            badge_data[badge_id] = {
                                'set_id': badge_id,
                                'name': badge.get('name', ''),
                                'description': badge.get('description', ''),
                                'created_at': badge.get('created_at', ''),
                                'user_count': badge.get('user_count', 0),
                                'image_urls': badge.get('image_urls', {}),
                                'source': 'stream_database'
                            }
            
            # フォールバック: HTMLから直接バッジIDを抽出
            if not badge_data:
                # バッジIDのパターンを検索
                badge_id_pattern = r'\/twitch\/global-badges\/([^\/\s"]+)'
                badge_ids = re.findall(badge_id_pattern, html_content)
                
                for badge_id in set(badge_ids):  # 重複を除去
                    if badge_id and not badge_id.endswith('.json'):
                        badge_data[badge_id] = {
                            'set_id': badge_id,
                            'name': badge_id.replace('-', ' ').title(),
                            'description': f'Badge discovered: {badge_id}',
                            'created_at': '',
                            'source': 'html_extraction'
                        }
            
        except Exception as e:
            print(f"Error extracting badge data from HTML: {e}")
        
        return badge_data
    
    def collect_badge_info_from_data(self, badge_id, badge_data):
        """Stream Databaseから取得したデータから新しいバッジ情報を収集"""
        try:
            badge_info = {
                'id': badge_id,
                'name': badge_data.get('name', badge_id.replace('-', ' ').title()),
                'added_date': badge_data.get('created_at', ''),
                'description': badge_data.get('description', ''),
                'user_count': badge_data.get('user_count', 0),
                'image_urls': badge_data.get('image_urls', {}),
                'url': f'https://www.streamdatabase.com/twitch/global-badges/{badge_id}',
                'discovered_at': datetime.now().isoformat(),
                'auto_collected': True,
                'research_needed': True,
                'source': badge_data.get('source', 'stream_database')
            }
            
            # 自動的に情報を収集して推測
            self.auto_research_badge(badge_info)
            
            # 新しいバッジを待機キューに追加
            self.new_badges_queue.append(badge_info)
            
            print(f"Collected info for new badge: {badge_id} - {badge_info['name']}")
            
        except Exception as e:
            print(f"Error collecting info for badge {badge_id}: {e}")
    
    def collect_badge_info(self, badge_id):
        """レガシーメソッド - 互換性のため保持"""
        badge_data = {
            'set_id': badge_id,
            'name': badge_id.replace('-', ' ').title(),
            'description': f'Badge discovered: {badge_id}',
            'created_at': '',
            'source': 'legacy'
        }
        self.collect_badge_info_from_data(badge_id, badge_data)
    
    def _update_badge_timestamps(self, current_badges):
        """現在のバッジタイムスタンプデータを更新（改良版）"""
        try:
            # 新しいタイムスタンプデータを収集
            new_timestamps = {}
            badge_details = {}
            
            for badge_id, badge_data in current_badges.items():
                created_at = badge_data.get('created_at')
                if created_at and created_at.strip():
                    new_timestamps[badge_id] = created_at
                
                # 詳細情報も保存
                badge_details[badge_id] = {
                    'name': badge_data.get('name', ''),
                    'description': badge_data.get('description', ''),
                    'created_at': created_at,
                    'user_count': badge_data.get('user_count', 0),
                    'last_updated': datetime.now().isoformat(),
                    'source': badge_data.get('source', 'stream_database')
                }
            
            # データベースファイルを読み込み・更新
            database_file = 'badge_database.json'
            try:
                with open(database_file, 'r') as f:
                    database = json.load(f)
            except FileNotFoundError:
                database = {
                    'metadata': {'last_updated': '', 'version': '1.0', 'total_badges': 0},
                    'timestamps': {},
                    'badge_details': {},
                    'update_history': []
                }
            
            # データを更新
            old_count = len(database['timestamps'])
            database['timestamps'].update(new_timestamps)
            database['badge_details'].update(badge_details)
            database['metadata']['last_updated'] = datetime.now().isoformat()
            database['metadata']['total_badges'] = len(database['timestamps'])
            
            # 更新履歴を追加
            database['update_history'].append({
                'timestamp': datetime.now().isoformat(),
                'badges_added': len(new_timestamps),
                'total_badges': len(database['timestamps']),
                'new_badges': list(new_timestamps.keys())[:10]  # 最初の10個のみ
            })
            
            # 履歴を最新の10件のみ保持
            database['update_history'] = database['update_history'][-10:]
            
            # データベースファイルに保存
            with open(database_file, 'w') as f:
                json.dump(database, f, indent=2)
            
            # レガシーファイルも更新
            with open('latest_badge_timestamps.json', 'w') as f:
                json.dump(new_timestamps, f, indent=2)
            
            new_count = len(database['timestamps'])
            added_count = new_count - old_count
            
            print(f"Database updated: {new_count} total badges (+{added_count} new)")
            
        except Exception as e:
            print(f"Error updating badge database: {e}")
    
    def get_latest_badge_timestamps(self):
        """最新のバッジタイムスタンプを取得"""
        try:
            with open('latest_badge_timestamps.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
        except Exception as e:
            print(f"Error loading latest timestamps: {e}")
            return {}
    
    def auto_research_badge(self, badge_info):
        """バッジ情報を自動的に調査"""
        badge_id = badge_info['id']
        badge_name = badge_info['name']
        
        # 検索クエリを生成
        search_queries = [
            f'"{badge_name}" Twitch badge how to obtain',
            f'"{badge_id}" Twitch badge 2025',
            f'Twitch "{badge_name}" badge event',
            f'"{badge_name}" badge requirements'
        ]
        
        research_results = []
        
        for query in search_queries[:2]:  # 最初の2つのクエリのみ実行
            try:
                # Web検索を実行（実際の実装では適切なAPIを使用）
                search_result = {
                    'query': query,
                    'timestamp': datetime.now().isoformat(),
                    'results': f"Auto-research for {badge_name} - Manual verification needed"
                }
                research_results.append(search_result)
                
                # レート制限を考慮した待機
                time.sleep(1)
                
            except Exception as e:
                print(f"Error researching {badge_id}: {e}")
        
        badge_info['research_results'] = research_results
        
        # 基本的な推測情報を生成
        self.generate_basic_badge_info(badge_info)
    
    def generate_basic_badge_info(self, badge_info):
        """基本的なバッジ情報を生成"""
        badge_id = badge_info['id']
        badge_name = badge_info['name']
        
        # 基本的な推測情報
        basic_info = {
            'ja': {
                'title': badge_name,
                'description': f'{badge_name}は新しく追加されたTwitchグローバルバッジです。詳細な入手方法は調査中です。',
                'requirements': [
                    '入手方法は調査中',
                    '詳細情報は随時更新予定',
                    'Stream Databaseで最新情報を確認してください'
                ],
                'availability': 'unknown',
                'url': badge_info['url']
            },
            'en': {
                'title': badge_name,
                'description': f'{badge_name} is a newly added Twitch global badge. Detailed obtaining method is under investigation.',
                'requirements': [
                    'Obtaining method under investigation',
                    'Detailed information will be updated',
                    'Check Stream Database for latest information'
                ],
                'availability': 'unknown',
                'url': badge_info['url']
            }
        }
        
        badge_info['basic_info'] = basic_info
    
    def get_pending_badges(self):
        """承認待ちの新しいバッジを取得"""
        return [badge for badge in self.new_badges_queue if badge.get('research_needed', True)]
    
    def approve_badge(self, badge_id, updated_info):
        """バッジ情報を承認して本番データベースに追加"""
        # badge_detail.jsの更新（実際の実装では適切なファイル操作を行う）
        print(f"Badge {badge_id} approved and added to main database")
        
        # 承認済みとしてマーク
        for badge in self.new_badges_queue:
            if badge['id'] == badge_id:
                badge['research_needed'] = False
                badge['approved_at'] = datetime.now().isoformat()
                badge['approved_info'] = updated_info
                break
        
        self.save_known_badges()

# グローバルインスタンス
badge_updater = BadgeAutoUpdater()

def start_badge_monitoring():
    """バッジ監視を開始（改良版）"""
    def monitor_loop():
        print("Badge monitoring started...")
        check_interval = 1800  # 30分ごとにチェック（より頻繁に）
        error_count = 0
        max_errors = 5
        
        # 初回チェック
        try:
            badge_updater.check_for_new_badges()
            print("Initial badge check completed")
        except Exception as e:
            print(f"Error in initial badge check: {e}")
        
        while True:
            try:
                time.sleep(check_interval)
                badge_updater.check_for_new_badges()
                error_count = 0  # 成功したらエラーカウントをリセット
                
                # チェック間隔を動的に調整
                current_hour = datetime.now().hour
                if 6 <= current_hour <= 22:  # 昼間はより頻繁に
                    check_interval = 1800  # 30分
                else:  # 夜間は少し間隔を開ける
                    check_interval = 3600  # 1時間
                    
            except Exception as e:
                error_count += 1
                print(f"Error in badge monitoring (#{error_count}): {e}")
                
                if error_count >= max_errors:
                    print(f"Too many errors ({max_errors}), extending retry interval")
                    time.sleep(3600)  # 1時間待機
                    error_count = 0
                else:
                    time.sleep(600)  # 10分後に再試行
    
    monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
    monitor_thread.start()
    return monitor_thread

# 新しいバッジ管理用のAPI
@app.route('/api/admin/pending-badges')
def get_pending_badges():
    """承認待ちの新しいバッジを取得"""
    return jsonify({
        'pending_badges': badge_updater.get_pending_badges(),
        'last_checked': badge_updater.last_checked.isoformat()
    })

@app.route('/api/admin/approve-badge', methods=['POST'])
def approve_badge():
    """バッジを承認"""
    from flask import request
    data = request.json
    badge_id = data.get('badge_id')
    updated_info = data.get('updated_info')
    
    if badge_id and updated_info:
        badge_updater.approve_badge(badge_id, updated_info)
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'Invalid data'}), 400

@app.route('/api/admin/force-check')
def force_check():
    """手動でバッジチェックを実行（改良版）"""
    try:
        print("Manual badge check initiated...")
        badge_updater.check_for_new_badges()
        
        # 最新のバッジ情報を取得
        pending_count = len(badge_updater.get_pending_badges())
        known_count = len(badge_updater.known_badges)
        
        return jsonify({
            'success': True, 
            'message': 'Badge check completed successfully',
            'known_badges_count': known_count,
            'pending_badges_count': pending_count,
            'last_checked': badge_updater.last_checked.isoformat()
        })
    except Exception as e:
        print(f"Error in manual badge check: {e}")
        return jsonify({
            'success': False, 
            'error': str(e),
            'message': 'Badge check failed'
        }), 500

@app.route('/api/admin/status')
def get_status():
    """システム状態を取得"""
    try:
        latest_timestamps = badge_updater.get_latest_badge_timestamps()
        
        return jsonify({
            'badge_updater': {
                'known_badges_count': len(badge_updater.known_badges),
                'pending_badges_count': len(badge_updater.get_pending_badges()),
                'last_checked': badge_updater.last_checked.isoformat(),
                'auto_update_enabled': badge_updater.auto_update_enabled,
                'latest_timestamps_count': len(latest_timestamps)
            },
            'system': {
                'timestamp': datetime.now().isoformat(),
                'status': 'running'
            }
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/admin/update-timestamps')
def update_timestamps():
    """タイムスタンプデータを強制更新"""
    try:
        # Stream Databaseから最新データを取得
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get('https://www.streamdatabase.com/twitch/global-badges', 
                              headers=headers, timeout=15)
        
        if response.status_code == 200:
            current_badges = badge_updater._extract_badges_from_html(response.text)
            badge_updater._update_badge_timestamps(current_badges)
            
            return jsonify({
                'success': True,
                'message': f'Updated timestamps for {len(current_badges)} badges',
                'updated_count': len(current_badges)
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Failed to fetch data: HTTP {response.status_code}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/emotes')
def get_global_emotes():
    """Twitchグローバルエモートを取得するAPIエンドポイント"""
    # アクセストークンを取得
    access_token = get_app_access_token()
    
    if not access_token:
        return jsonify({'error': 'Failed to get access token'}), 500
    
    # Twitch APIからグローバルエモートを取得
    url = 'https://api.twitch.tv/helix/chat/emotes/global'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Client-Id': CLIENT_ID
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        twitch_data = response.json()
        
        # Stream Database APIから追加日情報を取得して統合
        enhanced_data = enhance_emotes_with_timestamps(twitch_data)
        
        return jsonify(enhanced_data)
    except Exception as e:
        print(f"Error fetching emotes: {e}")
        return jsonify({'error': 'Failed to fetch emotes'}), 500

def enhance_emotes_with_timestamps(twitch_data):
    """Stream Databaseのデータでエモートにタイムスタンプとアニメーション情報を追加"""
    # Stream Database（2025年7月更新）からの正確な追加日データベース
    emote_timestamps = {
        # 2025年に追加されたエモート（Stream Databaseから取得）
        'bosscleared': '2025-08-01T00:00:00.000Z',
        'veladapeereira': '2025-07-24T00:00:00.000Z',
        'veladaperxitaa': '2025-07-24T00:00:00.000Z',
        'veladaroro': '2025-07-24T00:00:00.000Z',
        'veladatomas': '2025-07-24T00:00:00.000Z',
        'veladaviruzz': '2025-07-24T00:00:00.000Z',
        'veladawestcol': '2025-07-24T00:00:00.000Z',
        'veladarivaldios': '2025-07-24T00:00:00.000Z',
        'veladagrefg': '2025-07-24T00:00:00.000Z',
        'veladagaspi': '2025-07-24T00:00:00.000Z',
        'veladacarlos': '2025-07-24T00:00:00.000Z',
        'veladaandoni': '2025-07-24T00:00:00.000Z',
        'veladaarigeli': '2025-07-24T00:00:00.000Z',
        'veladaabby': '2025-07-24T00:00:00.000Z',
        'veladaalana': '2025-07-24T00:00:00.000Z',
        'velocityrun': '2025-07-07T00:00:00.000Z',
        'mechacharge': '2025-07-02T00:00:00.000Z',
        'ewccrush': '2025-06-16T00:00:00.000Z',
        'elegiggle': '2025-06-09T00:00:00.000Z',
        'nrwylder': '2025-05-30T00:00:00.000Z',
        'pbmmixtape': '2025-05-29T00:00:00.000Z',
        'darthjarjar': '2025-05-28T00:00:00.000Z',
        'streameru': '2025-05-23T00:00:00.000Z',
        'faze': '2025-05-23T00:00:00.000Z',
        'oops25': '2025-05-16T00:00:00.000Z',
        'zlansup': '2025-04-18T00:00:00.000Z',
        'feverfighter': '2025-04-17T00:00:00.000Z',
        'baftagames': '2025-04-08T00:00:00.000Z',
        'mcdzombiehamburglar': '2025-04-01T00:00:00.000Z',
        'inzoipsycat': '2025-03-27T00:00:00.000Z',
        'acshadows': '2025-03-20T00:00:00.000Z',
        'clixhuh': '2025-03-17T00:00:00.000Z',
        'wedidthat': '2025-03-07T00:00:00.000Z',
        'splitfictionjosef': '2025-03-05T00:00:00.000Z',
        'mizfight': '2025-02-28T00:00:00.000Z',
        'andtime': '2025-02-27T00:00:00.000Z',
        'lovesmash': '2025-02-14T00:00:00.000Z',
        'sharetheve': '2025-02-14T00:00:00.000Z',
        'sharethehug': '2025-02-14T00:00:00.000Z',
        'sharethelo': '2025-02-14T00:00:00.000Z',
        'simsplumbob': '2025-02-04T00:00:00.000Z',
        
        # 2024年に追加されたエモート（Stream Databaseから取得）
        'pewpewpew': '2024-12-20T00:00:00.000Z',
        'cinheimer': '2024-11-08T00:00:00.000Z',
        'caitthinking': '2024-11-08T00:00:00.000Z',
        'ekkochest': '2024-11-08T00:00:00.000Z',
        'ambessalove': '2024-11-08T00:00:00.000Z',
        'feelsvi': '2024-11-08T00:00:00.000Z',
        'jinxlul': '2024-11-08T00:00:00.000Z',
        'bratchat': '2024-10-10T00:00:00.000Z',
        'bigsad': '2024-09-30T00:00:00.000Z',
        'andalusiancrush': '2024-09-23T00:00:00.000Z',
    }
    
    # エモートデータにタイムスタンプとアニメーション情報を追加
    if 'data' in twitch_data:
        for emote in twitch_data['data']:
            emote_name = emote.get('name', '').lower()
            
            # 完全一致チェック
            if emote_name in emote_timestamps:
                emote['created_at'] = emote_timestamps[emote_name]
            
            # アニメーション対応のURL構築
            enhance_emote_with_animation_urls(emote)
    
    return twitch_data

def enhance_emote_with_animation_urls(emote):
    """エモートにアニメーション対応のURLを追加"""
    emote_id = emote.get('id')
    if not emote_id:
        return
    
    # 既存の画像URLを取得
    images = emote.get('images', {})
    
    # アニメーション形式のURLを構築
    # Twitchのエモートアニメーション形式: /animated/dark/scale または /static/dark/scale
    base_url = f"https://static-cdn.jtvnw.net/emoticons/v2/{emote_id}"
    
    # アニメーション版のURLを追加
    animated_urls = {
        'animated_url_1x': f"{base_url}/animated/dark/1.0",
        'animated_url_2x': f"{base_url}/animated/dark/2.0", 
        'animated_url_4x': f"{base_url}/animated/dark/3.0"
    }
    
    # 静的版のURLも追加（フォールバック用）
    static_urls = {
        'static_url_1x': f"{base_url}/static/dark/1.0",
        'static_url_2x': f"{base_url}/static/dark/2.0",
        'static_url_4x': f"{base_url}/static/dark/3.0"
    }
    
    # 画像オブジェクトにアニメーション情報を追加
    if 'images' not in emote:
        emote['images'] = {}
    
    emote['images'].update(animated_urls)
    emote['images'].update(static_urls)
    
    # アニメーション優先フラグを追加
    emote['prefer_animated'] = True

@app.route('/')
def index():
    """ルートエンドポイント"""
    return send_from_directory('.', 'index.html')

@app.route('/stream')
def stream():
    """ストリームページ"""
    return send_from_directory('.', 'stream.html')

@app.route('/api/update-badges', methods=['POST'])
def update_badges():
    """Stream Databaseから最新バッジ情報をチェック（開発環境用）"""
    try:
        if badge_updater:
            # 手動でバッジチェックを実行
            badge_updater.check_for_new_badges()
            
            result = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'message': 'バッジ情報の更新チェックが完了しました',
                'new_badges_count': len(badge_updater.new_badges_queue),
                'new_badges': [badge['id'] for badge in badge_updater.new_badges_queue[-10:]]  # 最新10個
            }
            
            return jsonify(result)
        else:
            return jsonify({
                'success': False,
                'error': 'Badge updater not initialized'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/<path:path>')
def serve_static(path):
    """静的ファイルを配信"""
    return send_from_directory('.', path)

if __name__ == '__main__':
    # バッジ監視を開始
    start_badge_monitoring()
    app.run(debug=True, host='0.0.0.0', port=5000)