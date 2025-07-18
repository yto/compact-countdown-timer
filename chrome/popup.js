(function() {
    let maxTime = 30 * 60;
    let remaining = 0;
    let timer = null;

    const display = document.getElementById('timerDisplay');
    const slider = document.getElementById('timerSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const maxTimeSlider = document.getElementById('maxTimeSlider');
    const maxTimeValue = document.getElementById('maxTimeValue');

    function playChime() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const chimeDuration = 3;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 1000;
        gain.gain.value = volumeSlider.value;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + chimeDuration);
        setTimeout(() => {
            osc.stop();
            ctx.close();
        }, chimeDuration * 1000);
    }

    function updateDisplay() {
        display.textContent = formatTime(remaining);
        slider.value = remaining;
        if (timer && remaining > 0) {
            display.classList.add('running');
            display.classList.remove('paused');
        } else {
            display.classList.add('paused');
            display.classList.remove('running');
        }
    }

    // ── ① tick(): 1秒ごとの共通処理をまとめる ──
    function tick() {
        // 残り時間を 1 秒減らし、表示を更新
        remaining = Math.max(0, remaining - 1);
        updateDisplay();
        // chrome.storage に残り時間を保存
        chrome.storage.local.set({ savedRemaining: remaining });
        // 0 秒になったらチャイム再生＆タイマークリア
        if (remaining === 0) {
            chrome.storage.local.remove('savedRemaining');
            playChime();
            clearInterval(timer);
            timer = null;
        }
    }
    // ── ② startTimer(): setInterval の呼び出しを一元管理 ──
    function startTimer() {
        if (timer !== null) return;  // すでに動作中なら何もしない
        // 1 秒ごとに tick() を呼び出す
        timer = setInterval(tick, 1000);
    }

    // Slider input: update remaining time and display
    slider.addEventListener('input', (e) => {
        clearInterval(timer);
        timer = null;
        remaining = parseInt(e.target.value, 10);
        updateDisplay();
        chrome.storage.local.set({ savedRemaining: remaining });
    });

    // Slider change: start countdown
    slider.addEventListener('change', (e) => {
        if (remaining > 0) {
            startTimer();
        }
    });

    // Display click: toggle pause/restart
    display.addEventListener('click', () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
            updateDisplay();
        } else if (remaining > 0) {
            startTimer();
        }
        updateDisplay();
    });

    // Volume slider
    volumeSlider.addEventListener('input', () => {
        const vol = parseFloat(volumeSlider.value);
        volumeValue.textContent = Math.round(vol * 100) + '%';
        playChime();
        chrome.storage.local.set({ savedVolume: vol });
    });

    // Max time slider
    maxTimeSlider.addEventListener('input', () => {
        const newMax = parseInt(maxTimeSlider.value, 10) * 60;
        maxTime = newMax;
        maxTimeValue.textContent = maxTimeSlider.value;
        slider.max = maxTime;
        if (remaining > maxTime) {
            remaining = maxTime;
            chrome.storage.local.set({ savedRemaining: remaining });
            updateDisplay();
        }
        chrome.storage.local.set({ savedMaxTime: maxTime });
    });


    // ポップアップ表示時に前回設定を読み込み＆初期化
    document.addEventListener('DOMContentLoaded', () => {
        chrome.storage.local.get(
            {
                savedVolume: 0.5,
                savedMaxTime: maxTime,
                savedRemaining: null
            },
            items => {
                // ボリューム復元
                volumeSlider.value = items.savedVolume;
                volumeValue.textContent = Math.round(items.savedVolume * 100) + '%';

                // 最大時間復元
                maxTime = items.savedMaxTime;
                maxTimeSlider.value = Math.floor(items.savedMaxTime / 60);
                maxTimeValue.textContent = String(Math.floor(items.savedMaxTime / 60));

                // 残り時間の復元
                if (items.savedRemaining != null) {
                    remaining = items.savedRemaining;
                } else {
                    remaining = maxTime;
                }

                // スライダー初期化
                slider.min = 0;
                slider.max = maxTime;
                slider.value = remaining;

                updateDisplay();
            }
        );
    });

})();
