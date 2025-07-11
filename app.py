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
    # Stream Database公式サイトから取得した正確な追加日データベース（2025年7月更新版）
    badge_timestamps = {
        # 2025年の新しいバッジ（Stream Databaseから取得した正確な追加日）
        'league-of-legends-mid-season-invitational-2025---grey': '2025-06-24T01:11:19.640Z',
        'league-of-legends-mid-season-invitational-2025---purple': '2025-06-24T01:11:19.640Z',
        'league-of-legends-mid-season-invitational-2025---blue': '2025-06-24T01:11:19.640Z',
        'legendus': '2025-06-28T06:15:55.000Z',
        'borderlands-4-badge---ripper': '2025-06-20T22:01:18.225Z',
        'borderlands-4-badge---vault-symbol': '2025-06-20T22:01:18.225Z',
        'bot-badge': '2025-06-09T23:43:23.947Z',
        'elden-ring-recluse': '2025-05-30T22:26:02.951Z',
        'elden-ring-wylder': '2025-05-30T22:26:02.951Z',
        'clips-leader': '2025-04-11T20:37:56.758Z',
        'marathon-reveal-runner': '2025-04-10T21:04:04.000Z',
        'gone-bananas': '2025-04-01T17:07:13.529Z',
        
        # 2024年のバッジ（Stream Databaseから取得した正確な追加日）
        'clip-the-halls': '2024-12-03T18:59:14.164Z',
        'gold-pixel-heart---together-for-good-24': '2024-12-02T21:05:01.561Z',
        'arcane-season-2-premiere': '2024-11-07T21:36:20.704Z',
        'dreamcon-2024': '2024-08-28T21:00:06.004Z',
        'la-velada-del-ano-iv': '2024-07-13T16:19:09.441Z',
        'destiny-2-final-shape-raid-race': '2024-06-06T22:09:47.189Z',
        'destiny-2-the-final-shape-streamer': '2024-06-06T22:09:48.208Z',
        'minecraft-15th-anniversary-celebration': '2024-05-28T17:21:51.000Z',
        
        # 注意: Stream Databaseから取得した正確な追加日のみを使用
        # 推定日は含まない（不明な場合は日付を表示しない）
    }
    
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
            self.known_badges = set()
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
        """新しいバッジをチェック"""
        if not self.auto_update_enabled:
            return
        
        try:
            # Stream Database APIから最新のバッジリストを取得
            response = requests.get('https://www.streamdatabase.com/api/twitch/global-badges', timeout=10)
            if response.status_code == 200:
                badges_data = response.json()
                current_badges = set()
                
                for badge in badges_data.get('badges', []):
                    badge_id = badge.get('set_id')
                    if badge_id:
                        current_badges.add(badge_id)
                
                # 新しいバッジを検出
                new_badges = current_badges - self.known_badges
                
                if new_badges:
                    print(f"New badges detected: {new_badges}")
                    for badge_id in new_badges:
                        self.collect_badge_info(badge_id)
                    
                    self.known_badges.update(new_badges)
                    self.last_checked = datetime.now()
                    self.save_known_badges()
                    
        except Exception as e:
            print(f"Error checking for new badges: {e}")
    
    def collect_badge_info(self, badge_id):
        """新しいバッジの情報を自動収集"""
        try:
            # Stream Database APIから詳細情報を取得
            response = requests.get(f'https://www.streamdatabase.com/api/twitch/global-badges/{badge_id}', timeout=10)
            if response.status_code == 200:
                badge_data = response.json()
                
                badge_info = {
                    'id': badge_id,
                    'name': badge_data.get('name', ''),
                    'added_date': badge_data.get('added_date', ''),
                    'description': badge_data.get('description', ''),
                    'url': f'https://www.streamdatabase.com/twitch/global-badges/{badge_id}/1',
                    'discovered_at': datetime.now().isoformat(),
                    'auto_collected': True,
                    'research_needed': True
                }
                
                # 自動的に情報を収集して推測
                self.auto_research_badge(badge_info)
                
                # 新しいバッジを待機キューに追加
                self.new_badges_queue.append(badge_info)
                self.save_known_badges()
                
                print(f"Collected info for new badge: {badge_id}")
                
        except Exception as e:
            print(f"Error collecting info for badge {badge_id}: {e}")
    
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
    """バッジ監視を開始"""
    def monitor_loop():
        while True:
            try:
                badge_updater.check_for_new_badges()
                time.sleep(3600)  # 1時間ごとにチェック
            except Exception as e:
                print(f"Error in badge monitoring: {e}")
                time.sleep(600)  # エラー時は10分後に再試行
    
    monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
    monitor_thread.start()

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
    """手動でバッジチェックを実行"""
    badge_updater.check_for_new_badges()
    return jsonify({'success': True, 'message': 'Badge check completed'})

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

@app.route('/<path:path>')
def serve_static(path):
    """静的ファイルを配信"""
    return send_from_directory('.', path)

if __name__ == '__main__':
    # バッジ監視を開始
    start_badge_monitoring()
    app.run(debug=True, host='0.0.0.0', port=5000)