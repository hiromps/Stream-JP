// 強化されたストリーム配信ダッシュボード JavaScript
class StreamDashboard {
    constructor() {
        this.badges = [];
        this.emotes = [];
        this.updateInterval = 30000; // 30秒
        this.initBadgeAvailabilityData();
        this.init();
    }

    // バッジの入手可能期間データベース（フロントページと同期）
    initBadgeAvailabilityData() {
        this.badgeAvailabilityPeriods = {
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
            }
        };
    }

    // 動的な入手可能性を判定する関数
    getBadgeAvailabilityStatus(badgeId) {
        const period = this.badgeAvailabilityPeriods[badgeId];
        if (!period) {
            return { status: 'unknown', message: '入手可能期間の情報がありません', isAvailable: false };
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

    init() {
        console.log('🎮 ストリーム配信ダッシュボードを初期化中...');
        this.loadData();
        // this.setupAutoRefresh(); // 自動更新を無効化
        this.setupEventListeners();
        
        // データ読み込み完了後に自動スクロール開始
        setTimeout(() => {
            this.setupAutoScroll();
        }, 2000);
    }

    async loadData() {
        try {
            await Promise.all([
                this.loadBadges(),
                this.loadEmotes()
            ]);
        } catch (error) {
            console.error('❌ ダッシュボードデータの読み込みに失敗:', error);
            this.showError('データの読み込みに失敗しました');
        }
    }

    async loadBadges() {
        try {
            const response = await fetch('/api/badges');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.badges = data.data || [];
            
            this.renderBadges();
            this.renderAvailableBadges();
            
            console.log(`✅ ${this.badges.length}個のバッジを読み込みました`);
        } catch (error) {
            console.error('❌ バッジの読み込みに失敗:', error);
            this.showLoadingError('badges-grid', 'バッジの読み込みに失敗しました');
            this.showLoadingError('available-badges-grid', '入手可能なバッジの読み込みに失敗しました');
        }
    }

    async loadEmotes() {
        try {
            const response = await fetch('/api/emotes');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.emotes = data.data || [];
            
            // デバッグ用：最初の数個のエモートの画像URLを確認
            if (this.emotes.length > 0) {
                console.log('エモートサンプル:', this.emotes.slice(0, 3).map(e => ({
                    name: e.name,
                    images: e.images
                })));
            }
            
            this.renderEmotes();
            
            console.log(`✅ ${this.emotes.length}個のエモートを読み込みました`);
        } catch (error) {
            console.error('❌ エモートの読み込みに失敗:', error);
            this.showLoadingError('emotes-grid', 'エモートの読み込みに失敗しました');
        }
    }

    renderBadges() {
        const container = document.getElementById('badges-grid');
        if (!container) return;

        if (this.badges.length === 0) {
            container.innerHTML = this.createEmptyState('バッジが見つかりません');
            return;
        }

        // 更新日でソート（最新順）
        const sortedBadges = [...this.badges].sort((a, b) => {
            const dateA = new Date(a.created_at || a.updated_at || 0);
            const dateB = new Date(b.created_at || b.updated_at || 0);
            return dateB - dateA;
        });

        const badgeElements = sortedBadges.map(badge => this.createBadgeElement(badge));
        container.innerHTML = badgeElements.join('');
        
        this.addAnimationDelay(container);
    }

    renderAvailableBadges() {
        const container = document.getElementById('available-badges-grid');
        if (!container) return;

        // 動的な入手可能性判定を使用してフィルタリング
        const availableBadges = this.badges.filter(badge => {
            const availability = this.getBadgeAvailabilityStatus(badge.set_id);
            return availability.isAvailable;
        });

        if (availableBadges.length === 0) {
            container.innerHTML = this.createEmptyState('現在入手可能なバッジはありません');
            return;
        }

        // 入手可能バッジの専用レイアウトを作成
        const badgeElements = availableBadges.map(badge => {
            const availability = this.getBadgeAvailabilityStatus(badge.set_id);
            return this.createAvailableBadgeCard(badge, availability);
        });
        container.innerHTML = badgeElements.join('');
        
        this.addAnimationDelay(container);
    }

    renderEmotes() {
        const container = document.getElementById('emotes-grid');
        if (!container) return;

        if (this.emotes.length === 0) {
            container.innerHTML = this.createEmptyState('エモートが見つかりません');
            return;
        }

        // 更新日でソート（最新順）
        const sortedEmotes = [...this.emotes].sort((a, b) => {
            const dateA = new Date(a.created_at || a.updated_at || 0);
            const dateB = new Date(b.created_at || b.updated_at || 0);
            return dateB - dateA;
        });

        const emoteElements = sortedEmotes.map(emote => this.createEmoteElement(emote));
        container.innerHTML = emoteElements.join('');
        
        this.addAnimationDelay(container);
    }

    createBadgeElement(badge, isAvailable = false, availability = null) {
        const availableClass = isAvailable ? 'available' : '';
        
        // バッジの構造から正しいデータを取得（versions配列から）
        const version = badge.versions && badge.versions[0] ? badge.versions[0] : badge;
        const badgeTitle = version.title || badge.set_id;
        const badgeDescription = version.description || badge.description;
        
        // API経由で取得した画像URLの優先順位付き取得（高解像度優先）
        let imageUrl = null;
        if (version.image_url_4x) {
            imageUrl = version.image_url_4x;
        } else if (version.image_url_2x) {
            imageUrl = version.image_url_2x;
        } else if (version.image_url_1x) {
            imageUrl = version.image_url_1x;
        }
        
        // フォールバック用のSVGアイコン（紫ベース）
        const fallbackIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iNCIgZmlsbD0iIzJhMmEyZCIvPgo8cGF0aCBkPSJNMTggMTBMMjAgMTZIMjZMMjEgMjBMMjMgMjZIMTggMjJMMTMgMjZMMTUgMjBMMTAgMTZIMTZMMTggMTBaIiBmaWxsPSIjOTM0MkZGIi8+Cjwvc3ZnPgo=';
        
        // 画像の複数フォールバック処理を改善
        const imageErrorHandler = `
            const currentSrc = this.src;
            if (currentSrc === '${version.image_url_4x || ''}' && '${version.image_url_2x || ''}') {
                this.src = '${version.image_url_2x}';
            } else if (currentSrc === '${version.image_url_2x || ''}' && '${version.image_url_1x || ''}') {
                this.src = '${version.image_url_1x}';
            } else {
                this.src = '${fallbackIcon}';
            }
        `;
        
        // 入手可能性情報の表示
        let availabilityInfo = '';
        if (availability && isAvailable) {
            const statusClass = availability.status === 'limited' ? 'limited-time' : 'ongoing';
            availabilityInfo = `<div class="availability-status ${statusClass}">${this.escapeHtml(availability.message)}</div>`;
        }
        
        // 追加日の表示
        let addedDateInfo = '';
        if (badge.created_at && badge.has_real_timestamp) {
            const addedDate = new Date(badge.created_at);
            const formattedDate = addedDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            addedDateInfo = `<div class="badge-added-date">追加日: ${formattedDate}</div>`;
        } else {
            addedDateInfo = '<div class="badge-added-date">追加日: 不明</div>';
        }
        
        return `
            <div class="badge-item ${availableClass}" data-badge-id="${version.id || badge.set_id}" title="${this.escapeHtml(badgeDescription || badgeTitle)}">
                <img src="${imageUrl || fallbackIcon}" alt="${this.escapeHtml(badgeTitle)}" 
                     onerror="${imageErrorHandler}"
                     loading="lazy"
                     data-badge-id="${version.id || badge.set_id}">
                <div class="badge-info">
                    <div class="badge-name">${this.escapeHtml(badgeTitle)}</div>
                    ${addedDateInfo}
                    ${availabilityInfo}
                </div>
            </div>
        `;
    }

    createAvailableBadgeCard(badge, availability) {
        // バッジの構造から正しいデータを取得（versions配列から）
        const version = badge.versions && badge.versions[0] ? badge.versions[0] : badge;
        const badgeTitle = version.title || badge.set_id;
        const badgeDescription = version.description || badge.description;
        
        // API経由で取得した高画質画像URLの取得（4x優先）
        let imageUrl = null;
        if (version.image_url_4x) {
            imageUrl = version.image_url_4x;
        } else if (version.image_url_2x) {
            imageUrl = version.image_url_2x;
        } else if (version.image_url_1x) {
            imageUrl = version.image_url_1x;
        }
        
        // フォールバック用のSVGアイコン（入手可能バッジ用大サイズ）
        const fallbackIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjcyIiByeD0iOCIgZmlsbD0iIzJhMmEyZCIvPgo8cGF0aCBkPSJNMzYgMjBMNDAgMzJINTJMNDIgNDBMNDYgNTJMMzYgNDRMMjYgNTJMMzAgNDBMMjAgMzJIMzJMMzYgMjBaIiBmaWxsPSIjOTM0MkZGIi8+Cjwvc3ZnPgo=';
        
        // 大型バッジ用の改良されたフォールバック処理
        const largeImageErrorHandler = `
            const currentSrc = this.src;
            if (currentSrc === '${version.image_url_4x || ''}' && '${version.image_url_2x || ''}') {
                this.src = '${version.image_url_2x}';
            } else if (currentSrc === '${version.image_url_2x || ''}' && '${version.image_url_1x || ''}') {
                this.src = '${version.image_url_1x}';
            } else {
                this.src = '${fallbackIcon}';
            }
        `;
        
        // 入手方法の情報を生成
        const obtainMethod = this.getBadgeObtainMethod(badge.set_id, availability);
        
        // 期間情報の生成
        const periodInfo = this.getBadgePeriodInfo(availability);
        
        // ステータスの色を決定
        const statusColorClass = availability.status === 'limited' ? 'urgent' : 'available';
        
        return `
            <div class="available-badge-card" data-badge-id="${version.id || badge.set_id}">
                <div class="badge-image-section">
                    <img src="${imageUrl || fallbackIcon}" alt="${this.escapeHtml(badgeTitle)}" 
                         onerror="${largeImageErrorHandler}"
                         loading="lazy"
                         class="large-badge-image"
                         data-badge-id="${version.id || badge.set_id}">
                </div>
                <div class="badge-info-section">
                    <h3 class="badge-title">${this.escapeHtml(badgeTitle)}</h3>
                    
                    <div class="badge-status ${statusColorClass}">
                        <span class="status-indicator"></span>
                        <span class="status-text">${this.escapeHtml(availability.message)}</span>
                    </div>
                    
                    <div class="badge-method">
                        <strong>入手方法:</strong>
                        <div style="margin-top: 0.5rem;">${obtainMethod}</div>
                    </div>
                    
                    ${periodInfo ? `<div class="badge-period">
                        <strong>期間:</strong>
                        <div style="margin-top: 0.5rem;">${this.escapeHtml(periodInfo)}</div>
                    </div>` : ''}
                    
                    <div class="badge-description-full">
                        <strong>詳細:</strong>
                        <div style="margin-top: 0.5rem;">${this.getBadgeDetailsInJapanese(badge.set_id, availability)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    getBadgeObtainMethod(badgeId, availability) {
        // 動的な期間情報を生成
        const getDynamicPeriodText = (availability) => {
            if (!availability || !availability.startDate || !availability.endDate) {
                return 'イベント期間中';
            }
            
            const startDate = new Date(availability.startDate);
            const endDate = new Date(availability.endDate);
            
            // 日本語の日付フォーマット
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}年${month}月${day}日`;
            };
            
            // 開始日と終了日が同じ場合
            if (startDate.toDateString() === endDate.toDateString()) {
                return `${formatDate(startDate)}のイベント期間中`;
            }
            
            // 異なる場合
            return `${formatDate(startDate)} - ${formatDate(endDate)}の期間内`;
        };
        
        // バッジIDに基づいて詳細な入手方法を返す（動的期間対応）
        const badgeObtainMethods = {
            'legendus': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}に参加`,
                        'fps_shakaまたはlegendus_shakaの配信を視聴',
                        '最低30分間の継続視聴が必要',
                        'Twitchアカウントでログイン済み'
                    ]
                }
            },
            'marathon-reveal-runner': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}`,
                        'Marathonディレクトリ内のチャンネルに新規購読',
                        'ギフト購読でも獲得可能',
                        'Prime購読は対象外'
                    ]
                }
            },
            'gone-bananas': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}のApril Foolsイベント`,
                        'April Foolsイベント参加配信を視聴',
                        '特別なイベントアクティビティに参加',
                        'イベント期間中にログインが必要'
                    ]
                }
            },
            'elden-ring-wylder': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}`,
                        'Elden Ring Nightreignのクリップを作成または共有',
                        'FromSoftwareの公式イベントに参加',
                        'Elden Ringカテゴリの配信でアクティブ'
                    ]
                }
            },
            'elden-ring-recluse': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}`,
                        'Elden Ring SuperFanイベントに参加',
                        'FromSoftwareの公式配信を視聴',
                        'イベント期間中にElden Ring配信でアクティブ'
                    ]
                }
            },
            'league-of-legends-mid-season-invitational-2025---grey': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}`,
                        'League of Legendsカテゴリのストリーマーに購読',
                        'ギフト購読でも獲得可能',
                        'Prime購読は対象外',
                        'TwitchとRiotアカウントの連携が必要'
                    ]
                }
            },
            'league-of-legends-mid-season-invitational-2025---purple': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}`,
                        'Riot Gamesチャンネルに購読またはギフト購読',
                        'Prime購読は対象外',
                        'TwitchとRiotアカウントの連携が必要'
                    ]
                }
            },
            'league-of-legends-mid-season-invitational-2025---blue': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}`,
                        'Riot Gamesチャンネルに購読またはギフト購読',
                        'Prime購読は対象外',
                        'TwitchとRiotアカウントの連携が必要'
                    ]
                }
            },
            'borderlands-4-badge---ripper': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}のBorderlands 4 Fan Fest`,
                        'Borderlands 4関連の配信を視聴',
                        'Gearbox公式イベントに参加',
                        'Borderlands 4カテゴリでアクティブ'
                    ]
                }
            },
            'borderlands-4-badge---vault-symbol': {
                ja: {
                    requirements: [
                        `${getDynamicPeriodText(availability)}のBorderlands 4 Fan Fest`,
                        'Borderlands 4関連の配信を視聴',
                        'Gearbox公式イベントに参加',
                        'Borderlands 4カテゴリでアクティブ'
                    ]
                }
            }
        };
        
        const badgeMethod = badgeObtainMethods[badgeId];
        if (badgeMethod && badgeMethod.ja && badgeMethod.ja.requirements) {
            // 箇条書きのHTMLリストを作成
            const requirementsList = badgeMethod.ja.requirements.map(req => `<li>${this.escapeHtml(req)}</li>`).join('');
            return `<ul style="margin: 0; padding-left: 1.2rem; line-height: 1.4;">${requirementsList}</ul>`;
        }
        
        return '詳細な入手方法は公式サイトをご確認ください';
    }

    getBadgeDetailsInJapanese(badgeId, availability) {
        // バッジの詳細情報を日本語で生成
        const details = {
            'legendus': 'LEGENDUS ITADAKI イベントでfps_shakaまたはlegendus_shakaの配信を30分間視聴することで入手可能でした。期間限定で現在は入手できません。',
            'marathon-reveal-runner': 'Bungie の Marathon Reveal イベント期間中に Marathon カテゴリのクリエイターに新規購読することで入手可能でした。Prime購読は対象外で、現在は入手できません。',
            'gone-bananas': 'April Fools 2025 イベント期間中に特別なイベント配信を視聴することで入手可能でした。現在は入手できません。',
            'elden-ring-wylder': 'Elden Ring Nightreign の発表イベント期間中にクリップを作成・共有することで入手可能でした。現在は入手できません。',
            'elden-ring-recluse': 'Elden Ring SuperFan イベント期間中にFromSoftware公式配信を視聴することで入手可能でした。現在は入手できません。',
            'league-of-legends-mid-season-invitational-2025---grey': 'MSI 2025 期間中に League of Legends カテゴリのストリーマーに購読することで入手可能です。ギフト購読でも獲得可能で、Prime購読は対象外で、TwitchとRiotアカウントの連携が必要です。',
            'league-of-legends-mid-season-invitational-2025---purple': 'MSI 2025 期間中に Riot Games チャンネルに購読またはギフト購読することで入手可能です。Prime購読は対象外で、TwitchとRiotアカウントの連携が必要です。',
            'league-of-legends-mid-season-invitational-2025---blue': 'MSI 2025 期間中に Riot Games チャンネルに購読またはギフト購読することで入手可能です。Prime購読は対象外で、TwitchとRiotアカウントの連携が必要です。',
            'borderlands-4-badge---ripper': 'Borderlands 4 Fan Fest イベントでBorderlands 4 関連の配信を視聴することで入手可能でした。現在は入手できません。',
            'borderlands-4-badge---vault-symbol': 'Borderlands 4 Fan Fest イベントでBorderlands 4 関連の配信を視聴することで入手可能でした。現在は入手できません。'
        };

        let detail = details[badgeId] || 'このバッジの詳細情報は公式サイトをご確認ください。';
        
        // 期間限定バッジの場合、残り時間を追加
        if (availability && availability.status === 'limited' && availability.endDate) {
            const now = new Date();
            const endDate = new Date(availability.endDate);
            const hoursRemaining = (endDate - now) / (1000 * 60 * 60);
            
            if (hoursRemaining > 0) {
                if (hoursRemaining < 24) {
                    const hours = Math.ceil(hoursRemaining);
                    detail += ` あと${hours}時間で入手期間が終了します。`;
                } else {
                    const daysRemaining = Math.floor(hoursRemaining / 24);
                    if (daysRemaining === 0) {
                        detail += ` 本日で入手期間が終了します。`;
                    } else {
                        detail += ` あと${daysRemaining}日で入手期間が終了します。`;
                    }
                }
            }
        }
        
        return detail;
    }

    getBadgePeriodInfo(availability) {
        if (availability.status === 'ongoing') {
            return '継続中';
        } else if (availability.status === 'limited' && availability.startDate && availability.endDate) {
            const start = new Date(availability.startDate).toLocaleDateString('ja-JP');
            const end = new Date(availability.endDate).toLocaleDateString('ja-JP');
            return `${start} ～ ${end}`;
        }
        return null;
    }

    createEmoteElement(emote) {
        // エモート画像URLの取得（静的画像を優先してエラーを減らす）
        let imageUrl = null;
        if (emote.images) {
            // 静的画像を優先的に使用（404エラーを減らすため）
            if (emote.images.url_4x) {
                imageUrl = emote.images.url_4x;
            } else if (emote.images.url_2x) {
                imageUrl = emote.images.url_2x;
            } else if (emote.images.url_1x) {
                imageUrl = emote.images.url_1x;
            } 
            // 静的画像がない場合のみアニメーション版を使用
            else if (emote.images.animated_url_2x) {
                imageUrl = emote.images.animated_url_2x;
            } else if (emote.images.animated_url_1x) {
                imageUrl = emote.images.animated_url_1x;
            } else if (emote.images.animated_url_4x) {
                imageUrl = emote.images.animated_url_4x;
            }
        }
        
        // フォールバック用のSVGアイコン（エモート用）
        const fallbackIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iMTgiIGZpbGw9IiMyYTJhMmQiLz4KPGNpcmNsZSBjeD0iMTMiIGN5PSIxNCIgcj0iMiIgZmlsbD0iIzkzNDJGRiIvPgo8Y2lyY2xlIGN4PSIyMyIgY3k9IjE0IiByPSIyIiBmaWxsPSIjOTM0MkZGIi8+CjxwYXRoIGQ9Ik0xMiAyMkgyNEMyMi44OTU0IDI0IDIxLjEwNDYgMjQgMjAgMjJIMTJaIiBmaWxsPSIjOTM0MkZGIi8+Cjwvc3ZnPgo=';
        
        // 改良されたフォールバック処理
        const fallbackHandlers = `
            console.log('エモート画像の読み込みに失敗:', this.src);
            const currentSrc = this.src;
            
            // アニメーション版からスタティック版に変更
            if (currentSrc.includes('/animated/')) {
                const staticUrl = currentSrc.replace('/animated/', '/static/');
                console.log('スタティック版に変更:', staticUrl);
                this.src = staticUrl;
            } 
            // 4x解像度から2x解像度に変更
            else if (currentSrc.includes('/4.0')) {
                const url2x = currentSrc.replace('/4.0', '/2.0');
                console.log('2x解像度に変更:', url2x);
                this.src = url2x;
            }
            // 2x解像度から1x解像度に変更
            else if (currentSrc.includes('/2.0')) {
                const url1x = currentSrc.replace('/2.0', '/1.0');
                console.log('1x解像度に変更:', url1x);
                this.src = url1x;
            }
            // 他のAPI URLがある場合はそれを試す
            else if ('${emote.images && emote.images.url_2x || ''}' && currentSrc !== '${emote.images.url_2x || ''}') {
                console.log('静的2x画像に変更:', '${emote.images.url_2x || ''}');
                this.src = '${emote.images.url_2x || ''}';
            }
            else if ('${emote.images && emote.images.url_1x || ''}' && currentSrc !== '${emote.images.url_1x || ''}') {
                console.log('静的1x画像に変更:', '${emote.images.url_1x || ''}');
                this.src = '${emote.images.url_1x || ''}';
            }
            // 最終的にフォールバックアイコンに変更
            else {
                console.log('フォールバックアイコンに変更');
                this.src = '${fallbackIcon}';
                this.style.opacity = '0.5';
            }
        `;
        
        return `
            <div class="emote-item" data-emote-id="${emote.id}" title="${this.escapeHtml(emote.name)}">
                <img src="${imageUrl || fallbackIcon}" alt="${emote.name}" 
                     onerror="${fallbackHandlers}"
                     loading="lazy">
                <div class="emote-name">${this.escapeHtml(emote.name)}</div>
            </div>
        `;
    }

    createEmptyState(message) {
        return `
            <div class="loading-state">
                <div class="cyber-loader"></div>
                <p>${message}</p>
            </div>
        `;
    }

    showLoadingError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="loading-state">
                <div style="color: var(--warning-color); font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                <p>${message}</p>
                <button onclick="streamDashboard.loadData()" style="
                    background: var(--primary-color);
                    color: var(--text-primary);
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    margin-top: 1rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">再試行</button>
            </div>
        `;
    }

    showError(message) {
        console.error('ダッシュボードエラー:', message);
        
        // 非侵入的なエラー通知を表示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--warning-color), #ef4444);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    addAnimationDelay(container) {
        const items = container.querySelectorAll('.badge-item, .emote-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.animation = 'fadeInUp 0.5s ease forwards';
        });
    }

    setupAutoRefresh() {
        // 自動更新を無効化（画面のフラッシュを防ぐため）
        // setInterval(() => {
        //     console.log('🔄 データを自動更新中...');
        //     this.loadData();
        // }, this.updateInterval);
    }

    setupAutoScroll() {
        // 各コンテナの自動スクロール設定
        const containers = [
            { id: 'badges-grid', scrollDistance: 300, shortPause: 5000, longPause: 15000 },
            { id: 'available-badges-grid', scrollDistance: 400, shortPause: 5000, longPause: 15000 },
            { id: 'emotes-grid', scrollDistance: 300, shortPause: 5000, longPause: 15000 }
        ];

        containers.forEach(containerConfig => {
            this.startAutoScroll(containerConfig.id, containerConfig.scrollDistance, containerConfig.shortPause, containerConfig.longPause);
        });
    }

    startAutoScroll(containerId, scrollDistance, shortPause, longPause) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const scrollableParent = container.closest('.scrollable-content');
        if (!scrollableParent) return;

        let scrollDirection = 1; // 1: 下向き, -1: 上向き
        let isPaused = false;
        let pauseTimeout;
        let scrollCount = 0;

        const performScroll = () => {
            if (isPaused) return;

            const maxScroll = scrollableParent.scrollHeight - scrollableParent.clientHeight;
            
            // スクロール可能な内容がない場合は何もしない
            if (maxScroll <= 0) return;

            const currentScroll = scrollableParent.scrollTop;
            let targetScroll = currentScroll + (scrollDistance * scrollDirection);

            // 端を超える場合は調整
            if (targetScroll >= maxScroll) {
                targetScroll = maxScroll;
                scrollDirection = -1;
            } else if (targetScroll <= 0) {
                targetScroll = 0;
                scrollDirection = 1;
            }

            // スムーズスクロール
            scrollableParent.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });

            // スクロール後の一時停止
            scrollCount++;
            isPaused = true;
            
            // 5秒停止と15秒停止を交互に
            const pauseDuration = scrollCount % 2 === 1 ? shortPause : longPause;
            
            pauseTimeout = setTimeout(() => {
                isPaused = false;
                performScroll();
            }, pauseDuration);
        };

        // マウスオーバーで一時停止
        scrollableParent.addEventListener('mouseenter', () => {
            isPaused = true;
            if (pauseTimeout) {
                clearTimeout(pauseTimeout);
                pauseTimeout = null;
            }
        });

        // マウスアウトで再開
        scrollableParent.addEventListener('mouseleave', () => {
            if (!pauseTimeout) {
                isPaused = false;
                pauseTimeout = setTimeout(() => {
                    performScroll();
                }, 2000); // 2秒後に再開
            }
        });

        // 初回スクロール開始（5秒後）
        pauseTimeout = setTimeout(() => {
            performScroll();
        }, 5000);

        // コンテナが削除された場合はクリーンアップ
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && !document.contains(container)) {
                    if (pauseTimeout) clearTimeout(pauseTimeout);
                    observer.disconnect();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupEventListeners() {
        // バッジ・エモートクリックハンドラー
        document.addEventListener('click', (e) => {
            if (e.target.closest('.badge-item')) {
                const badgeItem = e.target.closest('.badge-item');
                const badgeId = badgeItem.dataset.badgeId;
                this.onBadgeClick(badgeId, badgeItem);
            }
            
            if (e.target.closest('.emote-item')) {
                const emoteItem = e.target.closest('.emote-item');
                const emoteId = emoteItem.dataset.emoteId;
                this.onEmoteClick(emoteId, emoteItem);
            }
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.loadData();
                }
            }
        });

        // タブの可視性変更ハンドラー（タブがアクティブになった時に更新）
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadData();
            }
        });
    }

    onBadgeClick(badgeId, element) {
        console.log(`🏆 バッジがクリックされました: ${badgeId}`);
        
        // クリック効果
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
        
        // 追加のインタラクションロジックをここに追加可能
    }

    onEmoteClick(emoteId, element) {
        console.log(`😀 エモートがクリックされました: ${emoteId}`);
        
        // クリック効果
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
        
        // 追加のインタラクションロジックをここに追加可能
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// グローバル変数
let streamDashboard;

// DOM読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', () => {
    // フェードインアニメーション用のCSS追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes fireworkExpand {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            50% {
                transform: scale(2);
                opacity: 1;
            }
            100% {
                transform: scale(3);
                opacity: 0;
            }
        }
        
        .firework-particle {
            pointer-events: none;
        }
        
        .firework-center {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
    
    // ダッシュボード初期化
    streamDashboard = new StreamDashboard();
    
    // 視覚効果の追加
    setTimeout(() => {
        createDataStreamEffects();
    }, 2000);
});

// 特別な視覚効果
function createDataStreamEffects() {
    const container = document.querySelector('.gaming-container');
    if (!container) return;
    
    // ランダムなデータストリーム効果を作成
    setInterval(() => {
        if (Math.random() < 0.7) { // 70%の確率に増加
            const stream = document.createElement('div');
            stream.className = 'data-stream';
            stream.style.left = Math.random() * 100 + '%';
            stream.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(stream);
            
            setTimeout(() => stream.remove(), 3000);
        }
    }, 800); // 0.8秒ごとに生成
    
    // 花火エフェクトを追加
    setInterval(() => {
        createFirework(); // 100%の確率で花火を発生
    }, 2500); // 2.5秒ごとに花火
}

// 花火エフェクトを作成
function createFirework() {
    const container = document.querySelector('.gaming-container');
    if (!container) return;
    
    const x = Math.random() * 80 + 10; // 10-90%の範囲
    const y = Math.random() * 60 + 10; // 10-70%の範囲
    
    // 花火のカラーテーマを選択
    const colorThemes = [
        // 紫系
        {
            center: '#9342FF',
            particles: ['#9342FF', '#a855f7', '#7c3aed', '#c084fc', '#e9d5ff']
        },
        // 赤系
        {
            center: '#ff4757',
            particles: ['#ff4757', '#ff6b81', '#ee5a6f', '#ff7979', '#ff8fab']
        },
        // 青系
        {
            center: '#3498db',
            particles: ['#3498db', '#54a0ff', '#2e86de', '#74b9ff', '#a0c4ff']
        },
        // 緑系
        {
            center: '#2ecc71',
            particles: ['#2ecc71', '#55efc4', '#00b894', '#81ecec', '#74b9ff']
        },
        // 金色系
        {
            center: '#f1c40f',
            particles: ['#f1c40f', '#fdcb6e', '#ffeaa7', '#fab1a0', '#ffd93d']
        },
        // ピンク系
        {
            center: '#fd79a8',
            particles: ['#fd79a8', '#e84393', '#ff7675', '#fab1a0', '#ffeaa7']
        },
        // 虹色系（レインボー）
        {
            center: '#fff',
            particles: ['#ff4757', '#f1c40f', '#2ecc71', '#3498db', '#9342FF', '#fd79a8']
        }
    ];
    
    const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
    
    // 花火の中心
    const firework = document.createElement('div');
    firework.className = 'firework-center';
    firework.style.cssText = `
        position: fixed;
        left: ${x}%;
        top: ${y}%;
        width: 10px;
        height: 10px;
        background: ${theme.center};
        border-radius: 50%;
        animation: fireworkExpand 0.5s ease-out forwards;
        z-index: 10000;
    `;
    document.body.appendChild(firework);
    
    // 花火の粒子を作成
    const particleCount = 12 + Math.floor(Math.random() * 8); // 12-20個の粒子
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        const angle = (i / particleCount) * 360;
        const distance = 50 + Math.random() * 100; // 50-150pxの距離
        
        // テーマから色を選択
        const color = theme.particles[Math.floor(Math.random() * theme.particles.length)];
        
        // 角度をラジアンに変換
        const angleRad = (angle * Math.PI) / 180;
        const dx = Math.cos(angleRad) * distance;
        const dy = Math.sin(angleRad) * distance;
        
        particle.style.cssText = `
            position: fixed;
            left: ${x}%;
            top: ${y}%;
            width: 6px;
            height: 6px;
            background: ${color};
            border-radius: 50%;
            box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
            z-index: 9999;
            pointer-events: none;
            animation: fireworkParticle${i} 1.5s ease-out forwards;
        `;
        
        // 各粒子用の個別アニメーションを追加
        const particleStyle = document.createElement('style');
        particleStyle.textContent = `
            @keyframes fireworkParticle${i} {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(${dx}px, ${dy}px) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(particleStyle);
        
        setTimeout(() => {
            particleStyle.remove();
        }, 1600);
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1500);
    }
    
    setTimeout(() => firework.remove(), 500);
}

// グローバルエラーハンドラー
window.addEventListener('error', (e) => {
    console.error('グローバルエラー:', e.error);
    if (streamDashboard) {
        streamDashboard.showError('予期しないエラーが発生しました');
    }
});

// サービスワーカー登録は削除（不要なファイルの404エラーを防ぐため）