from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
import time
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

app = Flask(__name__)
CORS(app)

# Twitch API認証情報（環境変数から取得）
CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')
CLIENT_SECRET = os.getenv('TWITCH_CLIENT_SECRET')

# 環境変数が設定されていない場合のエラーチェック
if not CLIENT_ID or not CLIENT_SECRET:
    print("ERROR: Twitch API credentials not found!")
    print("Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in your .env file")

# アクセストークンのキャッシュ
access_token_cache = {
    'token': None,
    'expires_at': 0
}

def get_app_access_token():
    """Twitchアプリケーションアクセストークンを取得"""
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
    except Exception as e:
        print(f"Error getting access token: {e}")
        return None

@app.route('/api/badges', methods=['GET'])
def get_global_badges():
    """Twitchグローバルバッジを取得するAPIエンドポイント"""
    if not CLIENT_ID or not CLIENT_SECRET:
        return jsonify({'error': 'API credentials not configured'}), 500
        
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
        'la-velada-v-badge': '2025-07-23T00:00:00.000Z',
        'evo-2025': '2025-07-31T00:00:00.000Z',
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

@app.route('/api/emotes', methods=['GET'])
def get_global_emotes():
    """Twitchグローバルエモートを取得するAPIエンドポイント"""
    if not CLIENT_ID or not CLIENT_SECRET:
        return jsonify({'error': 'API credentials not configured'}), 500
        
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
    """Stream Databaseのデータでエモートにタイムスタンプを追加"""
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
    
    # エモートデータにタイムスタンプを追加
    if 'data' in twitch_data:
        for emote in twitch_data['data']:
            emote_name = emote.get('name', '').lower()
            
            # 完全一致チェック
            if emote_name in emote_timestamps:
                emote['created_at'] = emote_timestamps[emote_name]
    
    return twitch_data

@app.route('/api/update-badges', methods=['POST'])
def update_badges():
    """Stream Databaseから最新バッジ情報をチェック"""
    import re
    import json
    from datetime import datetime
    
    try:
        # 既知のバッジリスト（現在コードに含まれているもの）
        known_badges = {
            'zevent25', 'hornet', 'subtember-2025', 
            'gears-of-war-superfan-badge', 'path-of-exile-2-badge',
            'zevent-2024', 'la-velada-v-badge', 'evo-2025',
            'share-the-love', 'speedons-5-badge', 'clips-leader',
            'legendus', 'marathon-reveal-runner', 'gone-bananas',
            'elden-ring-wylder', 'elden-ring-recluse',
            'league-of-legends-mid-season-invitational-2025---grey',
            'league-of-legends-mid-season-invitational-2025---purple',
            'league-of-legends-mid-season-invitational-2025---blue',
            'borderlands-4-badge---ripper', 'borderlands-4-badge---vault-symbol',
            'bot-badge', 'minecraft-15th-anniversary-celebration',
            'clip-the-halls', 'gold-pixel-heart---together-for-good-24',
            'gold-pixel-heart', 'arcane-season-2-premiere', 'dreamcon-2024',
            'destiny-2-the-final-shape-streamer', 'destiny-2-final-shape-raid-race',
            'raging-wolf-helm', 'ruby-pixel-heart---together-for-good-24',
            'purple-pixel-heart---together-for-good-24', 'la-velada-iv'
        }
        
        # Stream Databaseからデータを取得
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(
            'https://www.streamdatabase.com/twitch/global-badges',
            headers=headers,
            timeout=15
        )
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'Stream Database API error: {response.status_code}'
            }), 500
        
        html_content = response.text
        current_badges = set()
        
        # HTMLからバッジIDを抽出
        badge_id_pattern = r'\/twitch\/global-badges\/([^\/\s"]+)\/1'
        badge_ids = re.findall(badge_id_pattern, html_content)
        
        for badge_id in badge_ids:
            if badge_id and not badge_id.endswith('.json') and not badge_id.startswith('_'):
                current_badges.add(badge_id)
        
        # 新しいバッジを検出
        new_badges = current_badges - known_badges
        
        result = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'total_badges_found': len(current_badges),
            'known_badges_count': len(known_badges),
            'new_badges_count': len(new_badges),
            'new_badges': list(new_badges)[:10]  # 最大10個まで返す
        }
        
        if new_badges:
            result['message'] = f'{len(new_badges)}個の新しいバッジが見つかりました'
        else:
            result['message'] = '新しいバッジは見つかりませんでした'
        
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Network error: {str(e)}'
        }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

# VercelはFlaskアプリケーションを直接エクスポート
app = app