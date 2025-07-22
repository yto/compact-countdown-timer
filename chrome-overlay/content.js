// ====== State ======
let timerInterval = null;
let remaining = 0;
let maxTime = 30 * 60; // 30min default
let volume = 0.5;

// Host/shadow refs for cleanup
let hostRef = null;
let shadow = null;

// ====== Reload & ページ遷移 追随 ======
// ファイル冒頭あたりで
chrome.runtime.sendMessage({ type: 'INIT_REQ' }, (res) => {
    if (res?.visible) {
        injectTimerBox(res.pos); // 自動再表示
    }
});


// ====== Message Listener ======
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "TOGGLE_TIMER") toggleTimerBox();
});

// ====== Toggle Overlay ======
function toggleTimerBox() {
    if (hostRef && document.body.contains(hostRef)) {
        cleanupAndRemove();
        chrome.runtime.sendMessage({ type: 'SET_VISIBLE', visible: false });
    } else {
        injectTimerBox();
        chrome.runtime.sendMessage({ type: 'SET_VISIBLE', visible: true });
    }
}

function cleanupAndRemove() {
    clearInterval(timerInterval);
    timerInterval = null;

    // detach global drag listeners if any
    if (hostRef && hostRef._cleanupDrag) {
        hostRef._cleanupDrag();
    }

    hostRef.remove();
    hostRef = null;
    shadow = null;
}

// ====== Inject Overlay (Shadow DOM) ======
function injectTimerBox(pos = null) {
    // 1) Host element + shadow root
    hostRef = document.createElement("div");
    hostRef.id = "cct-host";
    Object.assign(hostRef.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: "999999"
    });
    shadow = hostRef.attachShadow({ mode: "open" });
    document.body.appendChild(hostRef);

    // 2) Styles (scoped in shadow)
    const styleEl = document.createElement("style");
    styleEl.textContent = `
  :host {
    all: initial;                  /* ここでほぼ全リセット */
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 999999;
    font-family: sans-serif;
    line-height: 1.2;
    color: #000;
  }
  :host *, :host *::before, :host *::after {
    box-sizing: border-box;
  }

    #compact-timer {
      width: 180px;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      padding: 10px;
      display: flex;
      flex-direction: column;
      font-family: sans-serif;
    }
    .header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      cursor: move;
    }
    #timerDisplay {
      font-weight: bold;
      font-size: 48px;
      margin-bottom: 10px;
      text-align: center;
      cursor: pointer;
    }
    #timerDisplay.running { color: #000; }
    #timerDisplay.paused  { color: #999; }

    input[type="range"] {
      width: 100%;
      margin: 4px 0 10px 0;
      accent-color: #555;
    }

    details {
      margin-top: 8px;
      font-size: 14px;
    }
    summary {
      width: 100%;
      list-style: none;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      user-select: none;
    }
    /* Hide default markers */
    summary::-webkit-details-marker { display: none; }
    summary::marker { display: none; }

    .setting {
      display: flex;
      flex-direction: column;
      margin: 8px 0 0 0;
    }
    .setting label {
      font-size: 13px;
      margin-bottom: 2px;
    }
  `;
    shadow.appendChild(styleEl);

    // 3) UI elements inside shadow
    const container = document.createElement("div");
    container.id = "compact-timer";

    // Header
    const header = document.createElement("div");
    header.className = "header";
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✖️";
    closeBtn.style = "background:none;border:none;font-size:16px;cursor:pointer;";
    closeBtn.addEventListener("click", toggleTimerBox);
    header.appendChild(closeBtn);
    container.appendChild(header);

    // Display
    const disp = document.createElement("div");
    disp.id = "timerDisplay";
    disp.className = "paused";
    disp.textContent = "00:00";
    container.appendChild(disp);

    // Slider (remaining seconds)
    const slider = document.createElement("input");
    slider.id = "timerSlider";
    slider.type = "range";
    slider.min = "0";
    slider.step = "1";
    container.appendChild(slider);

    // details/summary for settings
    const details = document.createElement("details");
    details.style.marginTop = "8px";
    const summary = document.createElement("summary");
    summary.textContent = "⚙️ ";
    details.appendChild(summary);

    // Volume setting
    const volSet = document.createElement("div");
    volSet.className = "setting";
    const volLabel = document.createElement("label");
    volLabel.textContent = "Volume: ";
    const volValue = document.createElement("span");
    volValue.id = "volumeValue";
    volValue.textContent = "50%";
    volLabel.appendChild(volValue);
    volSet.appendChild(volLabel);
    const volSlider = document.createElement("input");
    volSlider.type = "range";
    volSlider.id = "volumeSlider";
    volSlider.min = "0";
    volSlider.max = "1";
    volSlider.step = "0.05";
    volSet.appendChild(volSlider);

    // Max time setting
    const maxSet = document.createElement("div");
    maxSet.className = "setting";
    const maxLabel = document.createElement("label");
    maxLabel.textContent = "Max Time: ";
    const maxValue = document.createElement("span");
    maxValue.id = "maxTimeValue";
    maxValue.textContent = "30";
    maxLabel.appendChild(maxValue);
    maxLabel.appendChild(document.createTextNode(" min"));
    maxSet.appendChild(maxLabel);
    const maxSlider = document.createElement("input");
    maxSlider.type = "range";
    maxSlider.id = "maxTimeSlider";
    maxSlider.min = "1";
    maxSlider.max = "60";
    maxSlider.step = "1";
    maxSet.appendChild(maxSlider);

    details.appendChild(volSet);
    details.appendChild(maxSet);
    container.appendChild(details);

    shadow.appendChild(container);

    // ===== Helpers =====
    const $ = (sel) => shadow.querySelector(sel);

    // ===== Event bindings =====
    slider.addEventListener("input", (e) => {
        remaining = Number(e.target.value);
        updateDisplay();
        chrome.storage.local.set({ savedRemaining: remaining });
    });

    slider.addEventListener("change", () => {
        if (remaining > 0) startTimer();
    });

    disp.addEventListener("click", () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            disp.classList.remove("running");
            disp.classList.add("paused");
        } else if (remaining > 0) {
            startTimer();
        }
        updateDisplay();
    });

    volSlider.addEventListener("input", () => {
        volume = parseFloat(volSlider.value);
        volValue.textContent = Math.round(volume * 100) + "%";
        // 再生確認用：音量調整時のプチ音が不要ならコメントアウト
        playChime(0.15); // 短めの確認音
        chrome.storage.local.set({ savedVolume: volume });
    });

    maxSlider.addEventListener("input", () => {
        const minutes = parseInt(maxSlider.value, 10);
        maxTime = minutes * 60;
        maxValue.textContent = String(minutes);
        slider.max = maxTime;
        if (remaining > maxTime) {
            remaining = maxTime;
            chrome.storage.local.set({ savedRemaining: remaining });
            updateDisplay();
        }
        chrome.storage.local.set({ savedMaxTime: maxTime });
    });

    // ===== Load saved settings =====
    chrome.storage.local.get(
        ["savedRemaining", "savedMaxTime", "savedVolume"],
        (res) => {
            if (res.savedMaxTime != null) {
                maxTime = res.savedMaxTime;
                maxSlider.value = Math.floor(maxTime / 60);
                maxValue.textContent = String(Math.floor(maxTime / 60));
                slider.max = maxTime;
            } else {
                slider.max = maxTime;
                maxSlider.value = 30;
            }

            if (res.savedRemaining != null) {
                remaining = res.savedRemaining;
            } else {
                remaining = maxTime;
            }

            if (res.savedVolume != null) {
                volume = res.savedVolume;
                volSlider.value = volume;
                volValue.textContent = Math.round(volume * 100) + "%";
            } else {
                volSlider.value = 0.5;
            }

            slider.value = remaining;
            updateDisplay();
        }
    );


    // host の初期位置
    if (pos && typeof pos.top === 'number' && typeof pos.left === 'number') {
        hostRef.style.top  = pos.top  + 'px';
        hostRef.style.left = pos.left + 'px';
        hostRef.style.right = 'auto';
    } else {
        // 初回：見た目上は右上に出すが、保存するのは left/top
        const defaultTop  = 10;
        const width       = 180; // タイマーボックス幅
        const defaultLeft = window.innerWidth - width - 30;
        hostRef.style.top  = defaultTop  + 'px';
        hostRef.style.left = defaultLeft + 'px';
        hostRef.style.right = 'auto';
        chrome.runtime.sendMessage({
            type: 'SET_POS',
            pos: { top: defaultTop, left: defaultLeft }
        });
    }

    // Draggable
    makeDraggable(hostRef, header);
}

// ====== Timer / Display / Audio ======
function updateDisplay() {
    if (!shadow) return;
    const disp = shadow.getElementById("timerDisplay");
    if (disp) disp.textContent = formatTime(remaining);
    const sliderEl = shadow.getElementById("timerSlider");
    if (sliderEl) sliderEl.value = remaining;
}

function startTimer() {
    if (!shadow) return;
    const disp = shadow.getElementById("timerDisplay");
    disp.classList.remove("paused");
    disp.classList.add("running");

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        updateDisplay();
        chrome.storage.local.set({ savedRemaining: remaining });
        if (remaining === 0) {
            chrome.storage.local.remove("savedRemaining");
            playChime(3); // 本番用 3秒
            clearInterval(timerInterval);
            timerInterval = null;
            disp.classList.remove("running");
            disp.classList.add("paused");
        }
    }, 1000);
}

/**
 * Play a 1kHz chime for `sec` seconds with exponential fade-out.
 */
function playChime(sec = 3) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    gain.gain.value = volume;

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + sec);

    setTimeout(() => {
        osc.stop();
        ctx.close();
    }, sec * 1000);
}

// ====== Dragging ======
function makeDraggable(host, handle) {
    let offsetX = 0, offsetY = 0, dragging = false;

    const onDown = (e) => {
        dragging = true;
        const rect = host.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        e.preventDefault();
    };
    const onMove = (e) => {
        if (!dragging) return;
        host.style.left = e.clientX - offsetX + "px";
        host.style.top = e.clientY - offsetY + "px";
        host.style.right = "auto";
    };
    const onUp = () => {
        if (!dragging) return;
        dragging = false;
        // 位置保存（px→numberに変換）
        const top  = parseInt(host.style.top, 10)  || 0;
        const left = parseInt(host.style.left, 10) || 0;
        chrome.runtime.sendMessage({ type: 'SET_POS', pos: { top, left } });
    };

    handle.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    host._cleanupDrag = () => {
        handle.removeEventListener("mousedown", onDown);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
    };
}
