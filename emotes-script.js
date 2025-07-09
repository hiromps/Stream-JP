// エモートデータを保存するグローバル変数
let allEmotes = [];
let currentSortOrder = 'newest';
let filteredEmotes = [];

// グローバルエモートを取得して表示する
async function loadGlobalEmotes() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');
    const emoteContainer = document.getElementById('emote-container');
    
    try {
        // バックエンドAPIにリクエスト
        const response = await fetch('/api/emotes');
        
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
        
        // エモートデータに追加時刻と実際の作成日を記録
        const timestamp = Date.now();
        allEmotes = data.data.map((emote, index) => {
            // APIから取得した実際の作成日を使用
            let createdDate = null;
            if (emote.created_at) {
                createdDate = new Date(emote.created_at);
            }
            
            return {
                ...emote,
                addedAt: timestamp + index,
                originalIndex: index,
                createdDate: createdDate,
                hasRealTimestamp: !!emote.created_at
            };
        });
        
        // 初期表示（デフォルトで最新順ソート）
        filteredEmotes = [...allEmotes];
        displayEmotes(filteredEmotes);
        
        // 最新順でソートを適用
        sortEmotes('newest');
        
        // 検索・ソートコントロールを表示
        document.getElementById('sort-controls').style.display = 'flex';
        document.getElementById('search-container').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading emotes:', error);
        
        // ローディング表示を非表示
        loadingElement.style.display = 'none';
        
        // エラーメッセージを表示
        errorElement.textContent = `エモートの読み込みに失敗しました: ${error.message}`;
        errorElement.style.display = 'block';
    }
}

// エモートデータをHTMLとして表示
function displayEmotes(emoteData) {
    const emoteContainer = document.getElementById('emote-container');
    
    // エモートデータが空の場合
    if (!emoteData || emoteData.length === 0) {
        emoteContainer.innerHTML = '<p class="no-results">エモートが見つかりませんでした。</p>';
        return;
    }
    
    // コンテナをクリア
    emoteContainer.innerHTML = '';
    
    // 各エモートについて処理
    emoteData.forEach(emote => {
        const emoteCard = createEmoteCard(emote);
        emoteContainer.appendChild(emoteCard);
    });
}

// エモートカードを作成
function createEmoteCard(emote) {
    const card = document.createElement('div');
    card.className = 'emote-card';
    
    // エモート画像
    const img = document.createElement('img');
    img.className = 'emote-image';
    img.src = emote.images.url_2x || emote.images.url_1x;
    img.alt = emote.name;
    img.loading = 'lazy';
    
    // エモート名
    const name = document.createElement('div');
    name.className = 'emote-name';
    name.textContent = emote.name;
    
    // 追加日情報を表示（Stream Databaseから取得した正確な情報のみ）
    if (emote.createdDate) {
        const dateInfo = document.createElement('div');
        dateInfo.className = 'emote-date-info';
        
        const formattedDate = emote.createdDate.toLocaleDateString('ja-JP');
        dateInfo.textContent = `追加日: ${formattedDate}`;
        dateInfo.style.color = '#4ecdc4'; // 正確な追加日は青緑色
        
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(dateInfo);
    } else {
        card.appendChild(img);
        card.appendChild(name);
    }
    
    return card;
}

// エモートをソート
function sortEmotes(order) {
    let sortedEmotes = [...filteredEmotes];
    
    switch (order) {
        case 'newest':
            // 新しい順：正確な追加日のあるエモートを優先し、その後createdDateの新しい順
            sortedEmotes.sort((a, b) => {
                // 正確な追加日があるエモートを優先
                if (a.hasRealTimestamp && !b.hasRealTimestamp) return -1;
                if (!a.hasRealTimestamp && b.hasRealTimestamp) return 1;
                
                // 両方に正確な追加日がある場合は日付で比較
                if (a.hasRealTimestamp && b.hasRealTimestamp) {
                    return b.createdDate - a.createdDate;
                }
                
                // 両方とも追加日不明の場合は元の順序を維持
                return a.originalIndex - b.originalIndex;
            });
            break;
        case 'oldest':
            // 古い順：正確な追加日のあるエモートを優先し、その後createdDateの古い順
            sortedEmotes.sort((a, b) => {
                // 正確な追加日があるエモートを優先
                if (a.hasRealTimestamp && !b.hasRealTimestamp) return -1;
                if (!a.hasRealTimestamp && b.hasRealTimestamp) return 1;
                
                // 両方に正確な追加日がある場合は日付で比較
                if (a.hasRealTimestamp && b.hasRealTimestamp) {
                    return a.createdDate - b.createdDate;
                }
                
                // 両方とも追加日不明の場合は元の順序を維持
                return a.originalIndex - b.originalIndex;
            });
            break;
    }
    
    displayEmotes(sortedEmotes);
}

// 検索機能
function searchEmotes(query) {
    if (!query.trim()) {
        filteredEmotes = [...allEmotes];
    } else {
        filteredEmotes = allEmotes.filter(emote => 
            emote.name.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    sortEmotes(currentSortOrder);
}

// イベントリスナーを設定
function setupEventListeners() {
    // 検索機能
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchEmotes(e.target.value);
    });
    
    // ソート機能
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        sortEmotes(currentSortOrder);
    });
}


// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalEmotes();
    setupEventListeners();
});