// ベースURLを動的に取得
function getBaseUrl() {
    // Vercelでは全てのAPIエンドポイントが同じオリジンで提供される
    // 開発環境と本番環境を自動判別
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // 開発環境: Flask開発サーバー
        return 'http://localhost:5000';
    } else {
        // 本番環境（Vercel）: APIは同じオリジンの/api/パスで提供される
        return '';
    }
}

const BASE_URL = getBaseUrl();

// バッジの入手可能期間データベース（badge-detail.jsと同じ）
const badgeAvailabilityPeriods = {
    'clips-leader': {
        type: 'ongoing',
        description: 'Ongoing feature since April 11, 2025'
    },
    'legendus': {
        type: 'time-limited',
        start: '2025-06-28T00:00:00Z',
        end: '2025-06-29T23:59:59Z',
        description: 'LEGENDUS ITADAKI event June 28-29, 2025'
    },
    'marathon-reveal-runner': {
        type: 'time-limited',
        start: '2025-04-11T00:00:00Z',
        end: '2025-04-12T23:59:59Z',
        description: 'Marathon Reveal stream subscription April 11-12, 2025'
    },
    'gone-bananas': {
        type: 'time-limited',
        start: '2025-04-01T00:00:00Z',
        end: '2025-04-04T23:59:59Z',
        description: 'April Fools 2025 April 1-4, 2025'
    },
    'elden-ring-wylder': {
        type: 'time-limited',
        start: '2025-05-29T00:00:00Z',
        end: '2025-06-03T23:59:59Z',
        description: 'Elden Ring Nightreign clip sharing May 29 - June 3, 2025'
    },
    'elden-ring-recluse': {
        type: 'time-limited',
        start: '2025-05-29T00:00:00Z',
        end: '2025-05-30T23:59:59Z',
        description: 'Elden Ring SuperFan Recluse May 29-30, 2025'
    },
    'league-of-legends-mid-season-invitational-2025---grey': {
        type: 'time-limited',
        start: '2025-06-24T00:00:00Z',
        end: '2025-07-12T08:59:00Z',
        description: 'MSI 2025 June 24 - July 12, 2025'
    },
    'league-of-legends-mid-season-invitational-2025---purple': {
        type: 'time-limited',
        start: '2025-06-24T00:00:00Z',
        end: '2025-07-12T08:59:00Z',
        description: 'MSI 2025 June 24 - July 12, 2025'
    },
    'league-of-legends-mid-season-invitational-2025---blue': {
        type: 'time-limited',
        start: '2025-06-24T00:00:00Z',
        end: '2025-07-12T08:59:00Z',
        description: 'MSI 2025 June 24 - July 12, 2025'
    },
    'borderlands-4-badge---ripper': {
        type: 'time-limited',
        start: '2025-06-21T00:00:00Z',
        end: '2025-06-21T23:59:59Z',
        description: 'Borderlands 4 Fan Fest June 21, 2025'
    },
    'borderlands-4-badge---vault-symbol': {
        type: 'time-limited',
        start: '2025-06-21T00:00:00Z',
        end: '2025-06-21T23:59:59Z',
        description: 'Borderlands 4 Fan Fest June 21, 2025'
    },
    'bot-badge': {
        type: 'future',
        description: 'Added to system but not yet distributed'
    },
    'minecraft-15th-anniversary-celebration': {
        type: 'time-limited',
        start: '2024-05-25T00:00:00Z',
        end: '2024-05-31T23:59:59Z',
        description: 'Minecraft 15th Anniversary May 25-31, 2024'
    },
    'clip-the-halls': {
        type: 'time-limited',
        start: '2024-12-02T00:00:00Z',
        end: '2024-12-13T23:59:59Z',
        description: 'Holiday Hoopla 2024 December 2-13, 2024'
    },
    'gold-pixel-heart---together-for-good-24': {
        type: 'time-limited',
        start: '2024-12-03T00:00:00Z',
        end: '2024-12-15T23:59:59Z',
        description: 'Together for Good 2024 December 3-15, 2024'
    },
    'gold-pixel-heart': {
        type: 'time-limited',
        start: '2024-12-03T00:00:00Z',
        end: '2024-12-15T23:59:59Z',
        description: 'Together for Good 2024 December 3-15, 2024'
    },
    'arcane-season-2-premiere': {
        type: 'time-limited',
        start: '2024-11-08T00:00:00Z',
        end: '2024-11-09T23:59:59Z',
        description: 'Arcane Season 2 Premiere November 8-9, 2024'
    },
    'dreamcon-2024': {
        type: 'time-limited',
        start: '2024-07-26T00:00:00Z',
        end: '2024-07-28T23:59:59Z',
        description: 'DreamCon 2024 July 26-28, 2024'
    },
    'destiny-2-the-final-shape-streamer': {
        type: 'time-limited',
        start: '2024-06-07T00:00:00Z',
        end: '2024-06-09T23:59:59Z',
        description: 'Destiny 2 raid race June 7-9, 2024'
    },
    'destiny-2-final-shape-raid-race': {
        type: 'time-limited',
        start: '2024-06-07T00:00:00Z',
        end: '2024-06-09T23:59:59Z',
        description: 'Destiny 2 raid race June 7-9, 2024'
    },
    'evo-2025': {
        type: 'time-limited',
        start: '2025-08-01T00:00:00Z',
        end: '2025-08-04T23:59:59Z',
        description: 'Evo 2025 fighting game tournament August 1-4, 2025'
    },
    'share-the-love': {
        type: 'time-limited',
        start: '2025-02-14T00:00:00Z',
        end: '2025-02-14T23:59:59Z',
        description: 'Share the Love Valentine\'s Day 2025'
    },
    'raging-wolf-helm': {
        type: 'time-limited',
        start: '2024-06-20T00:00:00Z',
        end: '2024-06-22T23:59:59Z',
        description: 'Elden Ring collaboration event June 2024'
    },
    'speedons-5-badge': {
        type: 'time-limited',
        start: '2025-02-24T00:00:00Z',
        end: '2025-02-24T23:59:59Z',
        description: 'Speedons 5 event February 24, 2025'
    },
    'ruby-pixel-heart---together-for-good-24': {
        type: 'time-limited',
        start: '2024-12-02T00:00:00Z',
        end: '2024-12-15T23:59:59Z',
        description: 'Together for Good 2024 December 2-15, 2024'
    },
    'purple-pixel-heart---together-for-good-24': {
        type: 'time-limited',
        start: '2024-12-02T00:00:00Z',
        end: '2024-12-15T23:59:59Z', 
        description: 'Together for Good 2024 December 2-15, 2024'
    },
    'la-velada-iv': {
        type: 'time-limited',
        start: '2024-07-13T00:00:00Z',
        end: '2024-07-14T23:59:59Z',
        description: 'La Velada del Año IV July 13, 2024'
    },
    'la-velada-v-badge': {
        type: 'time-limited',
        start: '2025-07-26T16:45:00Z',
        end: '2025-07-27T01:30:00Z',
        description: 'La Velada del Año V July 26, 2025'
    },
    'valorant-2025': {
        type: 'time-limited',
        start: '2025-09-12T17:00:00Z',
        end: '2025-10-05T18:59:00Z',
        description: 'VCT Champions Paris 2025 - SUBtember September 12 - October 5, 2025'
    },
    'zevent-2024': {
        type: 'time-limited',
        start: '2024-09-06T18:00:00Z',
        end: '2024-09-08T23:59:59Z',
        description: 'ZEVENT 2024 charity marathon September 6-8, 2024'
    },
    'zevent25': {
        type: 'time-limited',
        start: '2025-09-04T16:00:00Z',
        end: '2025-09-07T00:00:00Z',
        description: 'ZEVENT 2025 charity marathon September 4-7, 2025'
    },
    'hornet': {
        type: 'time-limited',
        start: '2025-09-04T14:00:00Z',
        end: '2025-09-13T06:59:00Z',
        description: 'Hollow Knight: Silksong launch event September 4-13, 2025'
    },
    'subtember-2025': {
        type: 'time-limited',
        start: '2025-08-29T17:00:00Z',
        end: '2025-10-01T17:00:00Z',
        description: 'SUBtember 2025 August 29 - October 1, 2025'
    },
    'gears-of-war-superfan-badge': {
        type: 'time-limited',
        start: '2025-08-25T07:00:00Z',
        end: '2025-08-26T19:00:00Z',
        description: 'Gears of War: Reloaded Superfan August 25-26, 2025'
    },
    'path-of-exile-2-badge': {
        type: 'time-limited',
        start: '2025-08-29T07:00:00Z',
        end: '2025-09-15T06:59:00Z',
        description: 'Path of Exile II launch promotion August 29 - September 15, 2025'
    }
};

// 動的な入手可能性を判定する関数
function getBadgeAvailabilityStatus(badgeId) {
    const period = badgeAvailabilityPeriods[badgeId];
    if (!period) {
        return { status: 'unknown', message: '入手可能期間の情報がありません' };
    }
    
    const now = new Date();
    
    switch (period.type) {
        case 'ongoing':
            return { 
                status: 'available', 
                message: '現在入手可能',
                isAvailable: true,
                description: period.description
            };
        
        case 'time-limited':
            const startDate = new Date(period.start);
            const endDate = new Date(period.end);
            
            if (now < startDate) {
                const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
                return {
                    status: 'upcoming',
                    message: `${daysUntilStart}日後に入手可能`,
                    isAvailable: false,
                    description: period.description,
                    startDate: startDate,
                    endDate: endDate
                };
            } else if (now > endDate) {
                return {
                    status: 'expired',
                    message: '入手期間終了',
                    isAvailable: false,
                    description: period.description,
                    startDate: startDate,
                    endDate: endDate
                };
            } else {
                const hoursUntilEnd = (endDate - now) / (1000 * 60 * 60);
                let message;
                
                if (hoursUntilEnd < 24) {
                    // 24時間未満の場合は時間表示
                    const hours = Math.ceil(hoursUntilEnd);
                    message = `あと${hours}時間で終了`;
                } else {
                    // 24時間以上の場合は日数表示（切り捨て）
                    const daysUntilEnd = Math.floor(hoursUntilEnd / 24);
                    if (daysUntilEnd === 0) {
                        message = '本日終了';
                    } else if (daysUntilEnd === 1) {
                        message = 'あと1日で終了';
                    } else {
                        message = `あと${daysUntilEnd}日で終了`;
                    }
                }
                
                return {
                    status: 'limited',
                    message: message,
                    isAvailable: true,
                    description: period.description,
                    startDate: startDate,
                    endDate: endDate
                };
            }
        
        case 'future':
            return {
                status: 'future',
                message: '配布予定',
                isAvailable: false,
                description: period.description
            };
        
        default:
            return { 
                status: 'unknown', 
                message: '入手可能期間の情報がありません',
                isAvailable: false
            };
    }
}

// 翻訳データ
const translations = {
    ja: {
        'app.title': 'StreamPartnerJP',
        'app.subtitle': 'Twitchグローバルバッジ一覧',
        'loading.message': 'バッジを読み込み中...',
        'footer.copyright': '© 2025 StreamPartnerJP.',
        'footer.description': 'Twitch APIを使用して最新のグローバルバッジを表示しています。',
        'error.loading': 'バッジの読み込みに失敗しました',
        'error.notfound': 'バッジが見つかりませんでした。',
        'badge.version': 'バージョン',
        'sort.label': '並び替え:',
        'sort.newest': '新しい順',
        'sort.oldest': '古い順',
        'nav.emotes': 'エモートページ'
    },
    en: {
        'app.title': 'StreamPartnerJP',
        'app.subtitle': 'Twitch Global Badges',
        'loading.message': 'Loading badges...',
        'footer.copyright': '© 2025 StreamPartnerJP.',
        'footer.description': 'Displaying the latest global badges using the Twitch API.',
        'error.loading': 'Failed to load badges',
        'error.notfound': 'No badges found.',
        'badge.version': 'Version',
        'sort.label': 'Sort by:',
        'sort.newest': 'Newest first',
        'sort.oldest': 'Oldest first',
        'nav.emotes': 'Emotes Page'
    }
};

// 現在の言語
let currentLanguage = 'ja';

// バッジデータを保存するグローバル変数
let allBadges = [];
let currentSortOrder = 'newest';

// グローバルバッジを取得して表示する
async function loadGlobalBadges() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const badgeContainer = document.getElementById('badge-container');
    
    try {
        // バックエンドAPIにリクエスト
        const response = await fetch(`${BASE_URL}/api/badges`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // エラーチェック
        if (data.error) {
            throw new Error(data.error);
        }
        
        // ローディング表示を非表示
        loadingElement.style.display = 'none';
        
        // バッジデータに追加時刻と番号を記録
        const timestamp = Date.now();
        allBadges = data.data.map((badge, index) => {
            // バッジIDから番号を抽出（例：60-seconds_1 → 1）
            const badgeNumber = extractBadgeNumber(badge.set_id);
            
            // 作成日の設定：APIからの正確な日付を優先し、なければ推定日を使用
            let createdDate = null;
            let hasRealTimestamp = false;
            
            if (badge.created_at && badge.has_real_timestamp) {
                // APIからの正確な作成日
                createdDate = new Date(badge.created_at);
                hasRealTimestamp = true;
            } else {
                // 推定作成日を生成
                createdDate = generateCreatedDate(badge.set_id, index);
            }
            
            return {
                ...badge,
                addedAt: timestamp + index,
                originalIndex: index,
                badgeNumber: badgeNumber,
                createdDate: createdDate,
                hasRealTimestamp: hasRealTimestamp
            };
        });
        
        // バッジデータを表示（デフォルトで最新順ソート）
        displayBadges(allBadges);
        
        // 最新順でソートを適用
        sortBadges('newest');
        
    } catch (error) {
        console.error('Error loading badges:', error);
        
        // ローディング表示を非表示
        loadingElement.style.display = 'none';
        
        // エラーメッセージを表示
        errorElement.textContent = `${t('error.loading')}: ${error.message}`;
        errorElement.style.display = 'block';
    }
}

// バッジデータをHTMLとして表示
function displayBadges(badgeData) {
    const badgeContainer = document.getElementById('badge-container');
    const sortControls = document.getElementById('sort-controls');
    
    // バッジデータが空の場合
    if (!badgeData || badgeData.length === 0) {
        badgeContainer.innerHTML = `<p>${t('error.notfound')}</p>`;
        sortControls.style.display = 'none';
        return;
    }
    
    // 並び替えコントロールを表示
    sortControls.style.display = 'flex';
    
    // コンテナをクリア
    badgeContainer.innerHTML = '';
    
    // 各バッジセットについて処理
    badgeData.forEach(badgeSet => {
        const badgeCard = createBadgeCard(badgeSet);
        badgeContainer.appendChild(badgeCard);
    });
}

// バッジカードを作成
function createBadgeCard(badgeSet) {
    const card = document.createElement('div');
    card.className = 'badge-card';
    card.style.cursor = 'pointer';
    
    // カードクリックイベントを追加
    card.addEventListener('click', () => {
        openBadgeDetail(badgeSet);
    });
    
    // バッジセットのタイトル
    const title = document.createElement('h3');
    title.className = 'badge-set-title';
    title.textContent = formatBadgeSetId(badgeSet.set_id);
    card.appendChild(title);
    
    // 作成日情報を表示（正確な追加日のみ）
    if (badgeSet.createdDate && badgeSet.hasRealTimestamp) {
        const dateInfo = document.createElement('div');
        dateInfo.className = 'badge-date-info';
        
        // 正確な追加日のみ表示
        const dateText = currentLanguage === 'ja' ? '追加日' : 'Added';
        
        const formattedDate = badgeSet.createdDate.toLocaleDateString(
            currentLanguage === 'ja' ? 'ja-JP' : 'en-US'
        );
        
        dateInfo.textContent = `${dateText}: ${formattedDate}`;
        dateInfo.style.color = '#4ecdc4'; // 正確な追加日は青緑色
        
        card.appendChild(dateInfo);
    }
    
    // 入手可能性の情報を表示
    const availabilityInfo = getBadgeAvailabilityStatus(badgeSet.set_id);
    if (availabilityInfo.status !== 'unknown') {
        const availabilityElement = document.createElement('div');
        availabilityElement.className = 'badge-availability';
        
        // 状態に応じたスタイルクラスを追加
        let statusClass = '';
        switch (availabilityInfo.status) {
            case 'available':
                statusClass = 'availability-available';
                break;
            case 'limited':
                statusClass = 'availability-limited';
                break;
            case 'upcoming':
                statusClass = 'availability-upcoming';
                break;
            case 'expired':
                statusClass = 'availability-expired';
                break;
            case 'future':
                statusClass = 'availability-future';
                break;
        }
        
        availabilityElement.className += ` ${statusClass}`;
        availabilityElement.textContent = availabilityInfo.message;
        
        card.appendChild(availabilityElement);
    }
    
    // バージョンコンテナ
    const versionsContainer = document.createElement('div');
    versionsContainer.className = 'badge-versions';
    
    // 各バージョンについて処理
    badgeSet.versions.forEach(version => {
        const versionElement = createBadgeVersion(version);
        versionsContainer.appendChild(versionElement);
    });
    
    card.appendChild(versionsContainer);
    return card;
}

// バッジ詳細ページを開く
function openBadgeDetail(badgeSet) {
    // URLパラメータを使用してバッジ詳細ページに遷移
    const badgeId = badgeSet.set_id;
    const versionId = badgeSet.versions[0]?.id || '1';
    window.location.href = `badge-detail.html?badge=${encodeURIComponent(badgeId)}&version=${encodeURIComponent(versionId)}`;
}

// バッジバージョンを作成
function createBadgeVersion(version) {
    // バッジ画像（divで囲まずに直接返す）
    const img = document.createElement('img');
    img.className = 'badge-image-large';
    
    // 高解像度画像を優先して使用（4x > 2x > 1x）
    if (version.image_url_4x) {
        img.src = version.image_url_4x;
    } else if (version.image_url_2x) {
        img.src = version.image_url_2x;
    } else {
        img.src = version.image_url_1x;
    }
    
    img.alt = version.title || version.id;
    img.loading = 'lazy';
    
    // バージョン情報をtitle属性に設定（ホバー時に表示）
    img.title = version.title ? version.title : `${t('badge.version')}: ${version.id}`;
    
    return img;
}

// バッジIDから番号を抽出
function extractBadgeNumber(setId) {
    const match = setId.match(/_(\d+)$/);
    return match ? parseInt(match[1]) : 0;
}

// バッジの作成日を生成（推定・より正確なデータベース）
function generateCreatedDate(setId, index) {
    // 実際のバッジの推定作成日データベース
    const badgeCreationDates = {
        // 基本的なTwitchバッジ（初期からある）
        'broadcaster': '2011-06-01',
        'moderator': '2011-06-01',
        'staff': '2011-06-01',
        'admin': '2011-06-01',
        'global-mod': '2011-06-01',
        'partner': '2011-06-01',
        'turbo': '2013-08-01',
        'subscriber': '2011-06-01',
        'premium': '2019-05-01',
        'bits': '2016-06-01',
        'bits-leader': '2017-03-01',
        'sub-gifter': '2017-07-01',
        'sub-gift-leader': '2018-02-01',
        'founder': '2018-08-01',
        'vip': '2018-07-01',
        'artist-badge': '2019-04-01',
        'hype-train': '2019-11-01',
        'predictions': '2021-03-01',
        'moments': '2017-12-01',
        'clip': '2016-05-01',
        'prime': '2016-09-01',
        'glhf-pledge': '2020-10-01',
        'glitchcon2020': '2020-11-01',
        'twitchcon': '2015-09-01',
        'drops-enabled': '2017-11-01',
        'game-awards': '2019-12-01',
        'charity': '2019-06-01',
        'no_audio': '2014-08-01',
        'no_video': '2014-08-01',
        'anonymous-cheerer': '2018-06-01',
        'verified': '2021-07-01',
        'twitchbot': '2019-10-01',
        'game-developer': '2020-05-01',
        
        // ゲーム固有のバッジ（推定）
        '1979-revolution': '2016-04-01',
        '60-seconds': '2015-05-01',
        'a-hat-in-time': '2017-10-01',
        'among-us': '2018-11-01',
        'apex-legends': '2019-02-01',
        'battlefield': '2016-10-01',
        'call-of-duty': '2019-10-01',
        'cyberpunk-2077': '2020-12-01',
        'dota': '2013-07-01',
        'fallout-76': '2018-11-01',
        'fortnite': '2017-07-01',
        'gta-v': '2013-09-01',
        'league-of-legends': '2012-10-01',
        'minecraft': '2011-11-01',
        'overwatch': '2016-05-01',
        'pubg': '2017-03-01',
        'rocket-league': '2015-07-01',
        'subnautica': '2018-01-01',
        'the-witcher': '2019-12-01',
        'valorant': '2020-06-01',
        'warcraft': '2004-11-01',
        'world-of-warcraft': '2004-11-01'
    };
    
    // 完全一致または部分一致で日付を検索
    let createdDate = null;
    
    // 完全一致チェック
    if (badgeCreationDates[setId]) {
        createdDate = new Date(badgeCreationDates[setId]);
    } else {
        // 部分一致チェック
        for (const [key, date] of Object.entries(badgeCreationDates)) {
            if (setId.includes(key) || key.includes(setId.split('_')[0])) {
                createdDate = new Date(date);
                break;
            }
        }
    }
    
    // 見つからない場合は推定日付を生成
    if (!createdDate) {
        // バッジIDから年を推定
        const yearMatch = setId.match(/(\d{4})/);
        if (yearMatch) {
            const year = parseInt(yearMatch[1]);
            if (year >= 2011 && year <= 2025) {
                createdDate = new Date(year, 0, 1);
            }
        }
    }
    
    // それでも見つからない場合は、APIの順序に基づいて推定
    if (!createdDate) {
        // 2011年からの推定（1週間ごと）
        const baseDate = new Date('2011-06-01');
        const weeksToAdd = Math.floor(index / 10); // 10個ごとに1週間進める
        createdDate = new Date(baseDate.getTime() + (weeksToAdd * 7 * 24 * 60 * 60 * 1000));
    }
    
    return createdDate;
}

// バッジセットIDをフォーマット（Stream database風の包括的翻訳）
function formatBadgeSetId(setId) {
    if (currentLanguage === 'en') {
        // 英語の場合は標準的なフォーマット
        return setId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // 日本語の場合は包括的な翻訳システム
    const badgeTranslations = {
        // 基本的な役割バッジ
        'broadcaster': '配信者',
        'moderator': 'モデレーター',
        'vip': 'VIP',
        'subscriber': 'サブスクライバー',
        'sub-gifter': 'サブギフター',
        'sub-gift-leader': 'サブギフトリーダー',
        'founder': 'ファウンダー',
        'artist-badge': 'アーティスト',
        
        // ビッツ関連
        'bits': 'ビッツ',
        'bits-leader': 'ビッツリーダー',
        'bits-charity': 'チャリティビッツ',
        'bits-badge-tier': 'ビッツバッジ',
        'cheer': 'チアー',
        'anonymous-cheerer': '匿名チアー',
        
        // プレミアム系
        'turbo': 'Turbo',
        'prime': 'Prime Gaming',
        'premium': 'プレミアム',
        'nitro': 'Nitro',
        
        // 配信関連
        'moments': 'モーメント',
        'clip': 'クリップ',
        'predictions': '予想',
        'hype-train': 'ハイプトレイン',
        'hype-train-conductor': 'ハイプトレイン車掌',
        'hype-train-participant': 'ハイプトレイン参加者',
        
        // 時間関連
        'moments-badge': 'モーメントバッジ',
        'watching-since': '視聴開始日',
        'subscriber-anniversary': 'サブスク記念日',
        'follow-age': 'フォロー日数',
        
        // 特別なバッジ
        'staff': 'スタッフ',
        'admin': '管理者',
        'global-mod': 'グローバルモデレーター',
        'partner': 'パートナー',
        'verified': '認証済み',
        'twitchbot': 'Twitchボット',
        'game-developer': 'ゲーム開発者',
        
        // 配信品質
        'no_audio': '音声なし',
        'no_video': '映像なし',
        'audio-only': '音声のみ',
        'mobile': 'モバイル',
        'desktop': 'デスクトップ',
        
        // イベント関連
        'glhf-pledge': 'GLHF誓約',
        'glitchcon2020': 'GlitchCon 2020',
        'twitchcon': 'TwitchCon',
        'drops-enabled': 'ドロップ有効',
        'game-awards': 'ゲームアワード',
        
        // 支援・チャリティ
        'charity': 'チャリティ',
        'donate': '寄付',
        'support': 'サポート',
        'fundraiser': '募金',
        
        // 技術関連
        'extension': 'エクステンション',
        'developer': '開発者',
        'beta': 'ベータ',
        'alpha': 'アルファ',
        
        // 時間単位のバッジ
        'subscriber-1': '1ヶ月サブスク',
        'subscriber-2': '2ヶ月サブスク',
        'subscriber-3': '3ヶ月サブスク',
        'subscriber-6': '6ヶ月サブスク',
        'subscriber-9': '9ヶ月サブスク',
        'subscriber-12': '12ヶ月サブスク',
        'subscriber-18': '18ヶ月サブスク',
        'subscriber-24': '24ヶ月サブスク',
        'subscriber-36': '36ヶ月サブスク',
        'subscriber-48': '48ヶ月サブスク',
        'subscriber-60': '60ヶ月サブスク',
        'subscriber-72': '72ヶ月サブスク',
        
        // 数字付きバッジの一般的なパターン
        '60-seconds': '60秒',
        '2-months': '2ヶ月',
        '3-months': '3ヶ月',
        '6-months': '6ヶ月',
        '9-months': '9ヶ月',
        '12-months': '12ヶ月',
        '18-months': '18ヶ月',
        '24-months': '24ヶ月',
        '36-months': '36ヶ月',
        '48-months': '48ヶ月',
        '60-months': '60ヶ月',
        '72-months': '72ヶ月',
        
        // その他
        'partner-anniversary': 'パートナー記念日',
        'community-events': 'コミュニティイベント',
        'achievement': '実績',
        'milestone': 'マイルストーン',
        'celebration': 'お祝い',
        'special-event': '特別イベント',
        'tournament': 'トーナメント',
        'competition': '競技',
        'esports': 'eスポーツ',
        'featured': '注目',
        'trending': 'トレンド',
        'popular': '人気',
        'recommended': 'おすすめ',
        'new': '新着',
        'updated': '更新',
        'limited': '限定',
        'exclusive': '限定',
        'rare': 'レア',
        'legendary': '伝説',
        'epic': 'エピック',
        'common': '通常',
        'seasonal': '季節限定'
    };
    
    // 完全一致チェック
    if (badgeTranslations[setId]) {
        return badgeTranslations[setId];
    }
    
    // 部分一致チェック（Stream database風）
    for (const [key, value] of Object.entries(badgeTranslations)) {
        if (setId.includes(key)) {
            // 数字を含む場合の処理
            const match = setId.match(/(\d+)/);
            if (match) {
                const number = match[1];
                // 月数、年数、日数などの自動変換
                if (setId.includes('month') || setId.includes('subscriber')) {
                    return `${number}ヶ月サブスク`;
                } else if (setId.includes('year')) {
                    return `${number}年`;
                } else if (setId.includes('day')) {
                    return `${number}日`;
                } else if (setId.includes('week')) {
                    return `${number}週間`;
                } else if (setId.includes('bits')) {
                    return `${number}ビッツ`;
                } else if (setId.includes('gift')) {
                    return `${number}ギフト`;
                } else {
                    return `${value} ${number}`;
                }
            }
            return value;
        }
    }
    
    // 一般的なパターンマッチング
    let translatedName = setId;
    
    // 数字パターンの処理
    translatedName = translatedName.replace(/(\d+)[-_]?(month|months)/gi, '$1ヶ月');
    translatedName = translatedName.replace(/(\d+)[-_]?(year|years)/gi, '$1年');
    translatedName = translatedName.replace(/(\d+)[-_]?(day|days)/gi, '$1日');
    translatedName = translatedName.replace(/(\d+)[-_]?(week|weeks)/gi, '$1週間');
    translatedName = translatedName.replace(/(\d+)[-_]?(hour|hours)/gi, '$1時間');
    translatedName = translatedName.replace(/(\d+)[-_]?(minute|minutes)/gi, '$1分');
    translatedName = translatedName.replace(/(\d+)[-_]?(second|seconds)/gi, '$1秒');
    
    // 一般的な単語の置換
    const wordReplacements = {
        'sub': 'サブ',
        'gift': 'ギフト',
        'tier': 'ティア',
        'level': 'レベル',
        'badge': 'バッジ',
        'award': 'アワード',
        'achievement': '実績',
        'milestone': 'マイルストーン',
        'anniversary': '記念日',
        'celebration': 'お祝い',
        'special': '特別',
        'event': 'イベント',
        'limited': '限定',
        'exclusive': '限定',
        'rare': 'レア',
        'legendary': '伝説',
        'epic': 'エピック',
        'common': '通常',
        'leader': 'リーダー',
        'participant': '参加者',
        'member': 'メンバー',
        'supporter': 'サポーター',
        'contributor': '貢献者',
        'champion': 'チャンピオン',
        'winner': '勝者',
        'finalist': 'ファイナリスト',
        'participant': '参加者'
    };
    
    // 単語レベルでの置換
    for (const [english, japanese] of Object.entries(wordReplacements)) {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translatedName = translatedName.replace(regex, japanese);
    }
    
    // 最終的な整形
    translatedName = translatedName
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    // 最初の文字を大文字に
    if (translatedName.charAt(0).match(/[a-zA-Z]/)) {
        translatedName = translatedName.charAt(0).toUpperCase() + translatedName.slice(1);
    }
    
    return translatedName || setId;
}

// 並び替え機能
function sortBadges(sortOrder) {
    currentSortOrder = sortOrder;
    let sortedBadges = [...allBadges];
    
    switch (sortOrder) {
        case 'newest':
            // 新しい順：すべてのバッジを追加日順で並べる（推定日も含む）
            sortedBadges.sort((a, b) => {
                // 両方とも正確な追加日がある場合
                if (a.createdDate && b.createdDate) {
                    return b.createdDate - a.createdDate;
                }
                // 片方だけ正確な追加日がある場合、そちらを優先
                if (a.createdDate && !b.createdDate) return -1;
                if (!a.createdDate && b.createdDate) return 1;
                
                // 両方とも追加日不明の場合は、元のAPI順序を維持（新しいものが先）
                return a.originalIndex - b.originalIndex;
            });
            break;
        case 'oldest':
            // 古い順：すべてのバッジを追加日順で並べる（推定日も含む）
            sortedBadges.sort((a, b) => {
                // 両方とも正確な追加日がある場合
                if (a.createdDate && b.createdDate) {
                    return a.createdDate - b.createdDate;
                }
                // 片方だけ正確な追加日がある場合、そちらを優先
                if (a.createdDate && !b.createdDate) return -1;
                if (!a.createdDate && b.createdDate) return 1;
                
                // 両方とも追加日不明の場合は、元のAPI順序を逆順で維持（古いものが先）
                return b.originalIndex - a.originalIndex;
            });
            break;
    }
    
    displayBadges(sortedBadges);
}

// 並び替えイベントリスナー
function initializeSortControls() {
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', (e) => {
        sortBadges(e.target.value);
    });
}

// 言語を設定
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageTranslations();
    updateLanguageButtons();
    updateSortOptions();
    
    // バッジを再読み込み（言語に応じた表示のため）
    const badgeContainer = document.getElementById('badge-container');
    if (badgeContainer.children.length > 0) {
        badgeContainer.innerHTML = '';
        // 最新順でソートを適用
        sortBadges('newest');
    }
}

// ページの翻訳を更新
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

// 言語ボタンの状態を更新
function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ソートオプションの翻訳を更新
function updateSortOptions() {
    const sortLabel = document.querySelector('label[for="sort-select"]');
    if (sortLabel) {
        sortLabel.textContent = t('sort.label');
    }
    
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.innerHTML = `
            <option value="newest">${t('sort.newest')}</option>
            <option value="oldest">${t('sort.oldest')}</option>
        `;
        sortSelect.value = currentSortOrder;
    }
}

// 翻訳を取得
function t(key) {
    return translations[currentLanguage][key] || key;
}

// ページ読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', () => {
    // 保存された言語設定を読み込む
    const savedLanguage = localStorage.getItem('language') || 'ja';
    currentLanguage = savedLanguage;
    
    // 初期翻訳を適用
    updatePageTranslations();
    updateLanguageButtons();
    
    // 言語切り替えボタンのイベントリスナー
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
    
    // バッジを読み込む
    loadGlobalBadges();
    initializeSortControls();
    initializeAdminControls();
});

// 管理者用コントロールの初期化
function initializeAdminControls() {
    let isAdminMode = false;
    
    // Ctrl+Alt+U で管理者モード切り替え
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'u') {
            e.preventDefault();
            isAdminMode = !isAdminMode;
            const adminControls = document.getElementById('admin-controls');
            adminControls.style.display = isAdminMode ? 'flex' : 'none';
            
            if (isAdminMode) {
                console.log('管理者モードが有効になりました');
            }
        }
    });
    
    // 更新ボタンのクリックイベント
    const updateBtn = document.getElementById('update-badges-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
            await updateBadgeData();
        });
    }
}

// Stream Databaseから最新バッジ情報を取得して更新
async function updateBadgeData() {
    const updateBtn = document.getElementById('update-badges-btn');
    const originalText = updateBtn.innerHTML;
    
    try {
        // ボタンを無効化してローディング状態に
        updateBtn.disabled = true;
        updateBtn.innerHTML = '🔄 更新中...';
        
        // 自分のAPIエンドポイント経由でStream Databaseをチェック
        const response = await fetch(`${BASE_URL}/api/update-badges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown error');
        }
        
        console.log('バッジ更新結果:', data);
        
        // 結果を表示
        if (data.new_badges_count > 0) {
            const newBadgesList = data.new_badges.join('\n• ');
            alert(`🎉 ${data.new_badges_count}個の新しいバッジが見つかりました！\n\n• ${newBadgesList}\n\n詳細な更新はCLAUDE.mdの手順に従って手動で行ってください。`);
        } else {
            alert(`✅ ${data.message}\n\n現在 ${data.total_badges_found} 個のバッジが登録されています。`);
        }
        
        // バッジリストを再読み込み
        await loadGlobalBadges();
        
        updateBtn.innerHTML = '✅ 更新完了';
        setTimeout(() => {
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('バッジ更新エラー:', error);
        updateBtn.innerHTML = '❌ 更新失敗';
        
        setTimeout(() => {
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
        }, 3000);
        
        alert(`バッジ情報の更新に失敗しました。\n\nエラー: ${error.message}\n\nしばらく時間をおいてから再試行してください。`);
    }
}