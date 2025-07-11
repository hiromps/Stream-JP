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

// バッジの入手可能期間データベース
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
        'app.title': 'Stream JP',
        'badge.detail.subtitle': 'バッジ詳細',
        'loading.message': 'バッジを読み込み中...',
        'footer.copyright': '© 2025 Stream JP.',
        'footer.description': 'Twitch APIを使用して最新のグローバルバッジを表示しています。',
        'error.loading': 'バッジの読み込みに失敗しました',
        'error.notfound': 'バッジが見つかりませんでした。',
        'badge.setId': 'セットID',
        'badge.addedDate': '追加日',
        'badge.title': 'タイトル',
        'badge.variations': 'バリエーション',
        'badge.back': '戻る',
        'nav.badges': 'バッジページ',
        'nav.emotes': 'エモートページ',
        'badge.howToObtain': '入手方法',
        'badge.requirements': '必要条件',
        'badge.availability': '利用可能性',
        'availability.available': '利用可能',
        'availability.limited': '期間限定',
        'availability.unavailable': '入手不可',
        'badge.moreInfo': '詳細情報'
    },
    en: {
        'app.title': 'Stream JP',
        'badge.detail.subtitle': 'Badge Details',
        'loading.message': 'Loading badge...',
        'footer.copyright': '© 2025 Stream JP.',
        'footer.description': 'Displaying the latest global badges using the Twitch API.',
        'error.loading': 'Failed to load badge',
        'error.notfound': 'Badge not found.',
        'badge.setId': 'Set ID',
        'badge.addedDate': 'Added Date',
        'badge.title': 'Title',
        'badge.variations': 'Variations',
        'badge.back': 'Back',
        'nav.badges': 'Badges Page',
        'nav.emotes': 'Emotes Page',
        'badge.howToObtain': 'How to Obtain',
        'badge.requirements': 'Requirements',
        'badge.availability': 'Availability',
        'availability.available': 'Available',
        'availability.limited': 'Limited Time',
        'availability.unavailable': 'Unavailable',
        'badge.moreInfo': 'More Info'
    }
};

// 現在の言語
let currentLanguage = 'ja';

// 現在のバッジデータ
let currentBadgeSet = null;
let currentVersionId = null;

// バッジ入手方法データベース
const badgeObtainMethods = {
    // 2025年のバッジ
    'legendus': {
        ja: {
            title: 'LEGENDUS ITADAKI イベント参加',
            description: 'LEGENDUS ITADAKI イベント期間中（2025年6月28-29日）にfps_shakaまたはlegendus_shakaの配信を30分間視聴することで入手できました。',
            requirements: [
                '2025年6月28-29日のイベント期間中に参加',
                'fps_shakaまたはlegendus_shakaの配信を視聴',
                '最低30分間の継続視聴が必要',
                'Twitchアカウントでログイン済み'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/legendus/1'
        },
        en: {
            title: 'LEGENDUS ITADAKI Event Participation',
            description: 'Obtained by watching fps_shaka or legendus_shaka streams for 30 minutes during the LEGENDUS ITADAKI event (June 28-29, 2025).',
            requirements: [
                'Participate during June 28-29, 2025 event period',
                'Watch fps_shaka or legendus_shaka channels',
                'Minimum 30 minutes continuous viewing required',
                'Must be logged in with Twitch account'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/legendus/1'
        }
    },
    'marathon-reveal-runner': {
        ja: {
            title: 'Marathon Reveal ストリーム購読',
            description: 'Bungie の Marathon Reveal ストリーム期間中（2025年4月11-12日）に Marathonディレクトリ内のクリエイターに購読することで入手できました。',
            requirements: [
                '2025年4月11日7:45 AM PT - 4月12日4:00 PM PTの期間内',
                'Marathonディレクトリ内のチャンネルに新規購読',
                'ギフト購読でも獲得可能',
                'Prime購読は対象外'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/marathon-reveal-runner/1'
        },
        en: {
            title: 'Marathon Reveal Stream Subscription',
            description: 'Obtained by subscribing to creators in the Marathon directory during Bungie\'s Marathon reveal stream (April 11-12, 2025).',
            requirements: [
                'Subscribe during April 11 7:45 AM PT - April 12 4:00 PM PT',
                'Subscribe to channels in Marathon directory',
                'Gift subscriptions also count',
                'Prime subscriptions do NOT count'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/marathon-reveal-runner/1'
        }
    },
    'minecraft-15th-anniversary-celebration': {
        ja: {
            title: 'Minecraft 15周年記念バッジ',
            description: 'Minecraft 15周年記念イベント期間中（2024年5月25-31日）にMinecraft配信を視聴し、専用エモートをチャットで使用することで入手できました。',
            requirements: [
                '2024年5月25-31日に5分間Minecraft配信を視聴',
                '専用エモート (:ssssssplode:) を獲得',
                '2024年5月28-31日にチャットでエモートを使用',
                'Minecraft 15周年記念タグ付き配信が対象'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2024/05/15/celebrating-15-years-of-minecraft-on-twitch/'
        },
        en: {
            title: 'Minecraft 15th Anniversary Badge',
            description: 'Obtained during Minecraft\'s 15th anniversary celebration (May 25-31, 2024) by watching Minecraft streams and using a special emote in chat.',
            requirements: [
                'Watch Minecraft streams for 5 minutes (May 25-31, 2024)',
                'Unlock the exclusive :ssssssplode: emote',
                'Use the emote in chat (May 28-31, 2024)',
                'Only tagged anniversary streams counted'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2024/05/15/celebrating-15-years-of-minecraft-on-twitch/'
        }
    },
    'league-of-legends-mid-season-invitational-2025---grey': {
        ja: {
            title: 'LoL MSI 2025 ストリーマーサポートバッジ',
            description: 'MSI 2025期間中（2024年6月24日 - 7月12日）にLeague of Legendsカテゴリのストリーマーに購読することで入手できました。',
            requirements: [
                '2024年6月24日 - 7月12日8:59 AM (GMT+2)の期間内',
                'League of Legendsカテゴリのストリーマーに購読',
                'ギフト購読でも獲得可能',
                'Prime購読は対象外',
                'TwitchとRiotアカウントの連携が必要'
            ],
            availability: 'unavailable',
            url: 'https://esports.gg/news/league-of-legends/msi-2025-twitch-subs-gifted-subs-and-perks-explained/'
        },
        en: {
            title: 'LoL MSI 2025 Support a Streamer Badge',
            description: 'Obtained by subscribing to streamers in League of Legends category during MSI 2025 (June 24 - July 12, 2025).',
            requirements: [
                'Subscribe during June 24 - July 12, 8:59 AM (GMT+2)',
                'Subscribe to League of Legends category streamers',
                'Gift subscriptions also count',
                'Prime subscriptions do NOT count',
                'Twitch and Riot account linking required'
            ],
            availability: 'unavailable',
            url: 'https://esports.gg/news/league-of-legends/msi-2025-twitch-subs-gifted-subs-and-perks-explained/'
        }
    },
    'league-of-legends-mid-season-invitational-2025---purple': {
        ja: {
            title: 'LoL MSI 2025 eスポーツバッジ',
            description: 'MSI 2025期間中（2024年6月24日 - 7月12日）にLoL eスポーツチャンネルに購読することで入手できました。',
            requirements: [
                '2024年6月24日 - 7月12日8:59 AM (GMT+2)の期間内',
                'Riot Gamesまたは公式LoL eスポーツチャンネルに購読',
                'LCK、lolesportstw、LeagueofLegendsJPなどが対象',
                'Prime購読は対象外',
                'TwitchとRiotアカウントの連携が必要'
            ],
            availability: 'unavailable',
            url: 'https://esports.gg/news/league-of-legends/msi-2025-twitch-subs-gifted-subs-and-perks-explained/'
        },
        en: {
            title: 'LoL MSI 2025 Esports Badge',
            description: 'Obtained by subscribing to LoL Esports channels during MSI 2025 (June 24 - July 12, 2025).',
            requirements: [
                'Subscribe during June 24 - July 12, 8:59 AM (GMT+2)',
                'Subscribe to Riot Games or official LoL Esports channels',
                'Eligible channels: LCK, lolesportstw, LeagueofLegendsJP, etc.',
                'Prime subscriptions do NOT count',
                'Twitch and Riot account linking required'
            ],
            availability: 'unavailable',
            url: 'https://esports.gg/news/league-of-legends/msi-2025-twitch-subs-gifted-subs-and-perks-explained/'
        }
    },
    'league-of-legends-mid-season-invitational-2025---blue': {
        ja: {
            title: 'LoL MSI 2025 ブルーバッジ',
            description: 'MSI 2025期間中（2024年6月24日 - 7月12日）に特定の条件を満たすことで入手できました。詳細な入手方法についてはイベント固有の要件があります。',
            requirements: [
                '2024年6月24日 - 7月12日8:59 AM (GMT+2)の期間内',
                'MSI 2025イベント特定の条件を満たす',
                'TwitchとRiotアカウントの連携が必要'
            ],
            availability: 'unavailable',
            url: 'https://esports.gg/news/league-of-legends/msi-2025-twitch-subs-gifted-subs-and-perks-explained/'
        },
        en: {
            title: 'LoL MSI 2025 Blue Badge',
            description: 'Obtained by meeting specific conditions during MSI 2025 (June 24 - July 12, 2025). Detailed requirements were event-specific.',
            requirements: [
                'Meet requirements during June 24 - July 12, 8:59 AM (GMT+2)',
                'Complete MSI 2025 event-specific conditions',
                'Twitch and Riot account linking required'
            ],
            availability: 'unavailable',
            url: 'https://esports.gg/news/league-of-legends/msi-2025-twitch-subs-gifted-subs-and-perks-explained/'
        }
    },
    'gone-bananas': {
        ja: {
            title: 'Gone Bananas エイプリルフール 2025',
            description: 'エイプリルフール週間（2025年4月1-4日）に面白いクリップをソーシャルメディアでシェアすることで入手できました。',
            requirements: [
                '2025年4月1-4日の期間内',
                'エイプリルフール特別カテゴリからクリップを作成/シェア',
                'TikTok、YouTube、Instagramのいずれかでシェア',
                '通常のクリップは対象外',
                'Twitchアカウントでログイン済み'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2025/04/01/april-fools-day/'
        },
        en: {
            title: 'Gone Bananas April Fools 2025',
            description: 'Obtained by sharing funny clips on social media during April Fool\'s week (April 1-4, 2025).',
            requirements: [
                'Share clips during April 1-4, 2025',
                'Clips must be from official April Fools categories',
                'Share on TikTok, YouTube, or Instagram',
                'Regular clips do not count',
                'Must be logged in with Twitch account'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2025/04/01/april-fools-day/'
        }
    },
    'elden-ring-wylder': {
        ja: {
            title: 'Elden Ring Nightreign クリップ共有',
            description: 'Elden Ring: Nightreign イベント期間中（2025年5月29日 - 6月3日）にElden Ringのクリップをダウンロード・共有することで入手できました。',
            requirements: [
                '2025年5月29日 - 6月3日の期間内',
                'Elden Ring: Nightreignカテゴリのクリップを作成・ダウンロード',
                'YouTube、TikTok、Instagramのいずれかでクリップを共有',
                'バッジ付与まで最大72時間要する場合あり'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2025/05/29/elden-ring-nightreign-awaits/'
        },
        en: {
            title: 'Elden Ring Nightreign Clip Sharing',
            description: 'Obtained by downloading and sharing Elden Ring clips during the Nightreign event (May 29 - June 3, 2025).',
            requirements: [
                'Download/share clips during May 29 - June 3, 2025',
                'Create clips from "Elden Ring: Nightreign" category',
                'Share on YouTube, TikTok, or Instagram',
                'Badge delivery may take up to 72 hours'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2025/05/29/elden-ring-nightreign-awaits/'
        }
    },
    'elden-ring-recluse': {
        ja: {
            title: 'Elden Ring SuperFan Recluse',
            description: 'Elden Ring: Nightreign の協力配信イベント（2025年5月29日午前12時 - 5月30日正午PT）でStream Togetherを使用した配信を15分間視聴/配信することで入手できました。',
            requirements: [
                '2025年5月29日午前12時PT - 5月30日正午PTの期間内',
                'Stream Together機能を使用したElden Ring配信を15分間視聴',
                'または自分でStream Togetherを使ってElden Ring配信を15分間実施',
                'Elden Ring: Nightreignカテゴリが対象'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2025/05/29/elden-ring-nightreign-awaits/'
        },
        en: {
            title: 'Elden Ring SuperFan Recluse',
            description: 'Obtained by watching or streaming Elden Ring content using Stream Together for 15 minutes during the Nightreign collaboration event (May 29 12 AM PT - May 30 Noon PT, 2025).',
            requirements: [
                'Participate during May 29 12 AM PT - May 30 Noon PT, 2025',
                'Watch 15 minutes of Elden Ring streams using Stream Together',
                'Or stream Elden Ring content using Stream Together for 15 minutes',
                'Must be in "Elden Ring: Nightreign" category'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2025/05/29/elden-ring-nightreign-awaits/'
        }
    },
    'clip-the-halls': {
        ja: {
            title: 'Clip the Halls ホリデー2024',
            description: 'Twitch Holiday Hoopla 2024期間中（2024年12月2-13日）にクリップをTikTokまたはYouTubeにシェアすることで入手できました。',
            requirements: [
                '2024年12月2-13日のHoliday Hoopla期間内',
                'クリップマネージャーからクリップをシェア',
                'TikTokまたはYouTubeにシェア',
                'バッジは数営業日以内に付与'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2024/12/02/twitch-holiday-hoopla/'
        },
        en: {
            title: 'Clip the Halls Holiday 2024',
            description: 'Obtained by sharing holiday clips to TikTok or YouTube during Twitch Holiday Hoopla 2024 (December 2-13, 2024).',
            requirements: [
                'Share clips during December 2-13, 2024 Holiday Hoopla',
                'Use Clip Manager to share clips',
                'Share to TikTok or YouTube',
                'Badge delivered within a few business days'
            ],
            availability: 'unavailable',
            url: 'https://blog.twitch.tv/en/2024/12/02/twitch-holiday-hoopla/'
        }
    },
    'borderlands-4-badge---ripper': {
        ja: {
            title: 'Borderlands 4 Ripper',
            description: 'Borderlands 4 Fan Fest イベント期間中（2025年6月21日）にBorderlands 4カテゴリの配信者に購読することで入手できました。',
            requirements: [
                '2025年6月21日11:00 AM ET - 8:00 PM ETの期間内',
                'Borderlands 4カテゴリで配信中のチャンネルに新規購読',
                'ギフト購読でも獲得可能',
                'Prime購読は対象外'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/borderlands-4-badge---ripper/1'
        },
        en: {
            title: 'Borderlands 4 Ripper',
            description: 'Obtained by purchasing a new subscription or gifting a subscription to participating Borderlands 4 streamers during Fan Fest (June 21, 2025).',
            requirements: [
                'Subscribe during June 21, 2025 11:00 AM ET - 8:00 PM ET',
                'Subscribe to channels streaming in Borderlands 4 category',
                'Gift subscriptions also count',
                'Prime subscriptions do NOT count'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/borderlands-4-badge---ripper/1'
        }
    },
    'borderlands-4-badge---vault-symbol': {
        ja: {
            title: 'Borderlands 4 Vault Symbol',
            description: 'Borderlands 4 Fan Fest イベント期間中（2025年6月21日）に公式Borderlandsチャンネルまたはパートナーチャンネルのイベント配信を30分間視聴することで入手できました。',
            requirements: [
                '2025年6月21日11:00 AM ET - 8:00 PM ETの期間内',
                '公式Borderlandsチャンネルまたはパートナーチャンネルを視聴',
                'イベント配信を30分間以上継続視聴',
                'Twitchアカウントでログイン済み'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/borderlands-4-badge---vault-symbol/1'
        },
        en: {
            title: 'Borderlands 4 Vault Symbol',
            description: 'Obtained by watching 30+ minutes of the official Borderlands channel or partnered channels during Fan Fest event (June 21, 2025).',
            requirements: [
                'Watch during June 21, 2025 11:00 AM ET - 8:00 PM ET',
                'Watch official Borderlands channel or partnered channels',
                'Minimum 30 minutes continuous viewing',
                'Must be logged in with Twitch account'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/borderlands-4-badge---vault-symbol/1'
        }
    },
    'gold-pixel-heart---together-for-good-24': {
        ja: {
            title: 'Gold Pixel Heart - Together For Good 2024',
            description: 'Twitch Together for Good 2024チャリティイベント期間中（2024年12月3-15日）にTwitchチャリティツールを通じて累計50ドル以上寄付することで入手できました。',
            requirements: [
                '2024年12月3-15日のTogether for Good期間内',
                'Twitchチャリティツールを通じて累計50ドル以上寄付',
                '複数のチャンネルでの寄付も累計に含まれる',
                'バッジは寄付後72時間以内に付与（週末除く）'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/gold-pixel-heart---together-for-good-24/1'
        },
        en: {
            title: 'Gold Pixel Heart - Together For Good 2024',
            description: 'Obtained by donating $50+ cumulatively through the Twitch Charity tool during Together for Good 2024 (December 3-15, 2024).',
            requirements: [
                'Donate during December 3-15, 2024 Together for Good event',
                'Cumulative donations of $50+ through Twitch Charity tool',
                'Donations across multiple channels count toward total',
                'Badge delivered within 72 hours (weekends excluded)'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/gold-pixel-heart---together-for-good-24/1'
        }
    },
    'gold-pixel-heart': {
        ja: {
            title: 'Gold Pixel Heart - 通常版',
            description: 'Twitch Together for Good 2024チャリティイベント期間中（2024年12月3-15日）にTwitchチャリティツールを通じて累計50ドル以上寄付することで入手できました。',
            requirements: [
                '2024年12月3-15日のTogether for Good期間内',
                'Twitchチャリティツールを通じて累計50ドル以上寄付',
                '複数のチャンネルでの寄付も累計に含まれる',
                'バッジは寄付後72時間以内に付与（週末除く）'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/gold-pixel-heart/1'
        },
        en: {
            title: 'Gold Pixel Heart - Standard',
            description: 'Obtained by donating $50+ cumulatively through the Twitch Charity tool during Together for Good 2024 (December 3-15, 2024).',
            requirements: [
                'Donate during December 3-15, 2024 Together for Good event',
                'Cumulative donations of $50+ through Twitch Charity tool',
                'Donations across multiple channels count toward total',
                'Badge delivered within 72 hours (weekends excluded)'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/gold-pixel-heart/1'
        }
    },
    'arcane-season-2-premiere': {
        ja: {
            title: 'Arcane Season 2 Premiere',
            description: 'Arcane Season 2 プレミア配信（2024年11月8-9日）でエピソード1を15分間視聴することで入手できました。',
            requirements: [
                '2024年11月8日11:00 PM PT - 11月9日12:00 AM PTの配信時間',
                'Arcane Season 2 エピソード1を15分間視聴',
                'Riot Games公式Twitchチャンネルまたは許可されたコーストリーム',
                'RiotアカウントとTwitchアカウントの連携が必要'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/arcane-season-2-premiere/1'
        },
        en: {
            title: 'Arcane Season 2 Premiere',
            description: 'Obtained by watching 15 minutes of Arcane Season 2 Episode 1 during the premiere broadcast (November 8-9, 2024).',
            requirements: [
                'Watch during November 8 11:00 PM PT - November 9 12:00 AM PT',
                'Watch 15 minutes of Arcane Season 2 Episode 1',
                'Official Riot Games Twitch channel or authorized co-streams',
                'Riot and Twitch account linking required'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/arcane-season-2-premiere/1'
        }
    },
    'dreamcon-2024': {
        ja: {
            title: 'DreamCon 2024',
            description: 'DreamCon 2024イベント（2024年7月26-28日）のライブ配信を視聴するか、イベント後のフィードバック調査を完了することで入手できました。',
            requirements: [
                '2024年7月26-28日のDreamCon 2024ライブ配信を視聴',
                'または2024年8月30日までにイベントフィードバック調査を完了',
                'トラブルシューティングは2024年9月6日まで対応',
                'info@dreamconvention.com への問い合わせが必要な場合あり'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/dreamcon-2024/1'
        },
        en: {
            title: 'DreamCon 2024',
            description: 'Obtained by watching DreamCon 2024 live (July 26-28, 2024) or completing the post-event feedback survey.',
            requirements: [
                'Watch DreamCon 2024 livestream during July 26-28, 2024',
                'Or complete event feedback survey by August 30, 2024',
                'Troubleshooting available until September 6, 2024',
                'Contact info@dreamconvention.com if needed'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/dreamcon-2024/1'
        }
    },
    'destiny-2-the-final-shape-streamer': {
        ja: {
            title: 'Destiny 2: The Final Shape Streamer',
            description: 'Destiny 2 Final Shape レイドレース期間中（2024年6月7-9日）にDestiny 2を30分間配信することで入手できました。',
            requirements: [
                '2024年6月7日9:30 AM PT - 6月9日9:30 AM PTの期間内',
                'Destiny 2を30分間配信',
                'The Final Shape レイドレースイベント期間中',
                'Scanning Ghost Chat Badge として付与'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/destiny-2-the-final-shape-streamer/1'
        },
        en: {
            title: 'Destiny 2: The Final Shape Streamer',
            description: 'Obtained by streaming Destiny 2 for 30 minutes during The Final Shape raid race (June 7-9, 2024).',
            requirements: [
                'Stream during June 7 9:30 AM PT - June 9 9:30 AM PT',
                'Stream Destiny 2 for 30 minutes',
                'During The Final Shape raid race event',
                'Awarded as Scanning Ghost Chat Badge'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/destiny-2-the-final-shape-streamer/1'
        }
    },
    'destiny-2-final-shape-raid-race': {
        ja: {
            title: 'Destiny 2: The Final Shape Raid Race',
            description: 'Destiny 2 Final Shape レイドレース期間中（2024年6月7-9日）にSalvation\'s Edge レイドを15分間視聴することで入手できました。',
            requirements: [
                '2024年6月7日9:30 AM PT - 6月9日9:30 AM PTの期間内',
                'The Final Shape レイドを15分間視聴',
                'Twitch Rivals配信または参加クリエイターの配信',
                'Ghost Chat Badge として付与'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/destiny-2-final-shape-raid-race/1'
        },
        en: {
            title: 'Destiny 2: The Final Shape Raid Race',
            description: 'Obtained by watching 15 minutes of The Final Shape raid during the raid race (June 7-9, 2024).',
            requirements: [
                'Watch during June 7 9:30 AM PT - June 9 9:30 AM PT',
                'Watch The Final Shape raid for 15 minutes',
                'Twitch Rivals stream or participating creators',
                'Awarded as Ghost Chat Badge'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/destiny-2-final-shape-raid-race/1'
        }
    },
    'bot-badge': {
        ja: {
            title: 'Bot Badge',
            description: 'サードパーティのチャットボットを識別するためのバッジです。2025年6月9日にTwitchのシステムに追加されましたが、現在はまだ使用されていません。',
            requirements: [
                'Twitchによる公式な配布方法は未発表',
                'バッジは追加されているが、まだ使用されていない',
                'Bot開発者向けのAPI端点やアプリケーションプロセスは未実装',
                '今後のTwitchからの公式発表を待つ必要がある'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/bot-badge/1'
        },
        en: {
            title: 'Bot Badge',
            description: 'A badge designed to distinguish third-party chatbots. Added to Twitch\'s system on June 9, 2025, but not yet in use.',
            requirements: [
                'Official distribution method not yet announced by Twitch',
                'Badge exists in system but is not currently distributed',
                'No API endpoint or application process for developers yet',
                'Waiting for official announcement from Twitch'
            ],
            availability: 'unavailable',
            url: 'https://www.streamdatabase.com/twitch/global-badges/bot-badge/1'
        }
    },
    'clips-leader': {
        ja: {
            title: 'Clips Leader',
            description: '2025年4月11日にリリースされたクリップリーダーボード機能で、チャンネル内でクリップの視聴数が上位3位以内に入ることで入手できます。',
            requirements: [
                'クリップリーダーボード機能が有効なチャンネルで参加',
                'ストリーマーが設定した期間内にクリップを作成',
                'クリップの視聴数で上位3位以内に入る',
                '1位: Clips Leader 1、2位: Clips Leader 2、3位: Clips Leader 3',
                'チャンネル固有のバッジ（そのチャンネルでのみ表示）'
            ],
            availability: 'available',
            url: 'https://www.streamdatabase.com/twitch/global-badges/clips-leader/1'
        },
        en: {
            title: 'Clips Leader',
            description: 'Obtained by ranking in the top 3 clippers in a channel through the Clips Leaderboard feature released on April 11, 2025.',
            requirements: [
                'Participate in channels with Clips Leaderboard feature enabled',
                'Create clips during the time frame selected by the streamer',
                'Rank in top 3 based on clip views',
                '1st place: Clips Leader 1, 2nd: Clips Leader 2, 3rd: Clips Leader 3',
                'Channel-specific badge (only displays in that channel)'
            ],
            availability: 'available',
            url: 'https://www.streamdatabase.com/twitch/global-badges/clips-leader/1'
        }
    },
    // デフォルトの入手方法（不明なバッジ用）
    'default': {
        ja: {
            title: '特別イベント参加',
            description: 'このバッジは特定のイベントやキャンペーン期間中に入手可能でした。詳細な入手方法については公式情報をご確認ください。',
            requirements: [
                '特定のイベント期間中に参加',
                '対象配信の視聴または特定アクティビティへの参加',
                'Twitchアカウントでのログインが必要'
            ],
            availability: 'unavailable'
        },
        en: {
            title: 'Special Event Participation',
            description: 'This badge was obtainable during specific events or campaign periods. Please check official information for detailed obtaining methods.',
            requirements: [
                'Participate during specific event periods',
                'Watch eligible streams or participate in specific activities',
                'Must be logged in with Twitch account'
            ],
            availability: 'unavailable'
        }
    }
};

// URLパラメータを取得
function getUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        badge: urlParams.get('badge'),
        version: urlParams.get('version')
    };
}

// バッジデータを取得
async function loadBadgeDetail() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const detailContainer = document.getElementById('badge-detail-container');
    
    const params = getUrlParameters();
    
    if (!params.badge) {
        showError('バッジIDが指定されていません');
        return;
    }
    
    try {
        // バックエンドAPIからバッジデータを取得
        const response = await fetch(`${BASE_URL}/api/badges`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // 指定されたバッジを検索
        const badgeSet = data.data.find(badge => badge.set_id === params.badge);
        
        if (!badgeSet) {
            throw new Error('指定されたバッジが見つかりません');
        }
        
        currentBadgeSet = badgeSet;
        currentVersionId = params.version || badgeSet.versions[0]?.id || '1';
        
        // ローディング表示を非表示
        loadingElement.style.display = 'none';
        
        // バッジ詳細を表示
        displayBadgeDetail(badgeSet, currentVersionId);
        detailContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading badge detail:', error);
        showError(error.message);
    }
}

// エラー表示
function showError(message) {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    
    loadingElement.style.display = 'none';
    errorElement.textContent = `${t('error.loading')}: ${message}`;
    errorElement.style.display = 'block';
}

// バッジ詳細を表示
function displayBadgeDetail(badgeSet, versionId) {
    const currentVersion = badgeSet.versions.find(v => v.id === versionId) || badgeSet.versions[0];
    
    // バッジタイトル
    document.getElementById('badge-title').textContent = formatBadgeSetId(badgeSet.set_id);
    
    // メタ情報
    document.getElementById('badge-set-id').textContent = badgeSet.set_id;
    
    // タイトルがある場合
    if (currentVersion.title) {
        document.getElementById('badge-title-meta').style.display = 'flex';
        document.getElementById('badge-title-value').textContent = currentVersion.title;
    }
    
    // 追加日がある場合
    if (badgeSet.created_at && badgeSet.has_real_timestamp) {
        const addedDate = new Date(badgeSet.created_at);
        const formattedDate = addedDate.toLocaleDateString(
            currentLanguage === 'ja' ? 'ja-JP' : 'en-US'
        );
        document.getElementById('badge-added-date-container').style.display = 'flex';
        document.getElementById('badge-added-date').textContent = formattedDate;
    }
    
    // バッジ画像を更新
    updateBadgeImage(currentVersion, '4x');
    
    // 入手方法を表示（追加日がある場合のみ）
    if (badgeSet.created_at && badgeSet.has_real_timestamp) {
        displayObtainMethod(badgeSet);
    }
    
    // バリエーションを表示
    displayVariations(badgeSet, currentVersion.id);
    
    // 解像度ボタンのイベントリスナー
    setupResolutionButtons(currentVersion);
}

// バッジ画像を更新
function updateBadgeImage(version, resolution) {
    const mainImage = document.getElementById('badge-main-image');
    
    let imageUrl;
    switch (resolution) {
        case '1x':
            imageUrl = version.image_url_1x;
            break;
        case '2x':
            imageUrl = version.image_url_2x || version.image_url_1x;
            break;
        case '4x':
        default:
            imageUrl = version.image_url_4x || version.image_url_2x || version.image_url_1x;
            break;
    }
    
    mainImage.src = imageUrl;
    mainImage.alt = version.title || version.id;
    
    // アクティブボタンを更新
    document.querySelectorAll('.resolution-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.resolution === resolution) {
            btn.classList.add('active');
        }
    });
}

// 解像度ボタンの設定
function setupResolutionButtons(version) {
    document.querySelectorAll('.resolution-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateBadgeImage(version, btn.dataset.resolution);
        });
    });
}

// 入手方法を表示
function displayObtainMethod(badgeSet) {
    const obtainSection = document.getElementById('badge-obtain-section');
    const obtainMethod = badgeObtainMethods[badgeSet.set_id] || badgeObtainMethods['default'];
    const langData = obtainMethod[currentLanguage];
    
    // タイトル
    document.getElementById('obtain-title').textContent = langData.title;
    
    // 説明
    document.getElementById('obtain-description').textContent = langData.description;
    
    // 必要条件
    const requirementsList = document.getElementById('requirements-list');
    requirementsList.innerHTML = '';
    langData.requirements.forEach(req => {
        const li = document.createElement('li');
        li.textContent = req;
        requirementsList.appendChild(li);
    });
    document.getElementById('obtain-requirements').style.display = 'block';
    
    // 利用可能性（動的判定）
    const availabilityInfo = getBadgeAvailabilityStatus(badgeSet.set_id);
    const availabilityStatus = document.getElementById('availability-status');
    
    // 状態に応じたスタイルクラスを設定
    let statusClass = '';
    switch (availabilityInfo.status) {
        case 'available':
            statusClass = 'available';
            break;
        case 'limited':
            statusClass = 'limited';
            break;
        case 'upcoming':
            statusClass = 'upcoming';
            break;
        case 'expired':
            statusClass = 'unavailable';
            break;
        case 'future':
            statusClass = 'future';
            break;
        default:
            statusClass = 'unknown';
    }
    
    availabilityStatus.className = `availability-status ${statusClass}`;
    availabilityStatus.textContent = availabilityInfo.message;
    document.getElementById('obtain-availability').style.display = 'flex';
    
    // 期間情報を表示（期間限定の場合）
    if (availabilityInfo.startDate && availabilityInfo.endDate) {
        const periodInfo = document.createElement('div');
        periodInfo.className = 'availability-period';
        const startDateStr = availabilityInfo.startDate.toLocaleDateString('ja-JP');
        const endDateStr = availabilityInfo.endDate.toLocaleDateString('ja-JP');
        periodInfo.textContent = `期間: ${startDateStr} - ${endDateStr}`;
        
        const availabilityContainer = document.getElementById('obtain-availability');
        availabilityContainer.appendChild(periodInfo);
    }
    
    // 詳細情報URL
    if (langData.url) {
        const obtainLink = document.getElementById('obtain-link');
        obtainLink.href = langData.url;
        obtainLink.textContent = t('badge.moreInfo');
        document.getElementById('obtain-url').style.display = 'block';
    }
    
    // セクションを表示
    obtainSection.style.display = 'block';
}

// バリエーションを表示
function displayVariations(badgeSet, currentVersionId) {
    if (badgeSet.versions.length <= 1) {
        return; // バリエーションが1つ以下の場合は表示しない
    }
    
    const variationsSection = document.getElementById('badge-variations-section');
    const variationsGrid = document.getElementById('badge-variations-grid');
    
    variationsGrid.innerHTML = '';
    
    badgeSet.versions.forEach(version => {
        const variationItem = createVariationItem(version, version.id === currentVersionId);
        variationItem.addEventListener('click', () => {
            selectVariation(badgeSet, version.id);
        });
        variationsGrid.appendChild(variationItem);
    });
    
    variationsSection.style.display = 'block';
}

// バリエーションアイテムを作成
function createVariationItem(version, isActive) {
    const item = document.createElement('div');
    item.className = `variation-item ${isActive ? 'active' : ''}`;
    
    const image = document.createElement('img');
    image.className = 'variation-image';
    image.src = version.image_url_4x || version.image_url_2x || version.image_url_1x;
    image.alt = version.title || version.id;
    image.loading = 'lazy';
    
    const id = document.createElement('div');
    id.className = 'variation-id';
    id.textContent = `ID: ${version.id}`;
    
    item.appendChild(image);
    item.appendChild(id);
    
    if (version.title) {
        const title = document.createElement('div');
        title.className = 'variation-title';
        title.textContent = version.title;
        item.appendChild(title);
    }
    
    return item;
}

// バリエーションを選択
function selectVariation(badgeSet, versionId) {
    currentVersionId = versionId;
    
    // URLを更新
    const newUrl = `badge-detail.html?badge=${encodeURIComponent(badgeSet.set_id)}&version=${encodeURIComponent(versionId)}`;
    window.history.replaceState({}, '', newUrl);
    
    // 表示を更新
    displayBadgeDetail(badgeSet, versionId);
}

// バッジセットIDをフォーマット
function formatBadgeSetId(setId) {
    if (currentLanguage === 'en') {
        return setId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // 日本語の翻訳は簡易版（main script.jsから必要に応じて移植）
    const translations = {
        'legendus': 'LEGENDUS',
        'minecraft-15th-anniversary-celebration': 'Minecraft 15周年記念',
        'marathon-reveal-runner': 'Marathon Reveal Runner',
        'league-of-legends-mid-season-invitational-2025---grey': 'League of Legends MSI 2025 - グレー',
        'league-of-legends-mid-season-invitational-2025---purple': 'League of Legends MSI 2025 - パープル',
        'league-of-legends-mid-season-invitational-2025---blue': 'League of Legends MSI 2025 - ブルー'
    };
    
    return translations[setId] || setId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// 言語を設定
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageTranslations();
    updateLanguageButtons();
    
    // バッジ詳細を再表示（言語に応じた表示のため）
    if (currentBadgeSet) {
        displayBadgeDetail(currentBadgeSet, currentVersionId);
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
    
    // バッジ詳細を読み込む
    loadBadgeDetail();
});