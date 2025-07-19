// Dynamic UI assembly with original styles and behavior
let timerInterval = null;
let remaining = 0;
let maxTime = 30 * 60;
let volume = 0.5;

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "TOGGLE_TIMER") toggleTimerBox();
});

function toggleTimerBox() {
    const existing = document.getElementById("compact-timer");
    if (existing) {
        existing.remove();
        const styleEl = document.getElementById("compact-timer-style");
        if (styleEl) styleEl.remove();
        clearInterval(timerInterval);
    } else {
        injectTimerBox();
    }
}

function injectTimerBox() {
    // Inject styles
    const style = document.createElement("style");
    style.id = "compact-timer-style";
    style.textContent = `
#compact-timer {
  width: 180px;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 999999;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  padding: 10px;
  display: flex;
  flex-direction: column;
}
#compact-timer .header {
  display: flex; justify-content: flex-end; align-items: center; cursor: move;
}
#compact-timer #timerDisplay {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  cursor: pointer;
  font-family: sans-serif;
  line-height: 1.2em;
}
#compact-timer #timerDisplay.running { color: #000; }
#compact-timer #timerDisplay.paused { color: #999; }
#compact-timer #timerSlider {
  margin-bottom: 10px; accent-color: #555;
}
#compact-timer .setting {
  display: flex; flex-direction: column; margin-bottom: 8px; margin-top: 8px;
}
#compact-timer .setting label {
  font-size: 14px; font-family: sans-serif;
  line-height: 1.2em;
}
#compact-timer .setting input[type=range] {
  margin-top: 4px; accent-color: #555;
}
#compact-timer summary {
  list-style: none;           /* Firefox 用 */
  -webkit-appearance: none;   /* Safari/Chrome 用 */
  appearance: none;
  cursor: pointer;
}
#compact-timer summary::-webkit-details-marker { display: none; }
#compact-timer summary::marker { display: none; } /* Firefox */
`;
    document.head.appendChild(style);

    // Container
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

    // Slider
    const slider = document.createElement("input");
    slider.id = "timerSlider";
    slider.type = "range";
    slider.min = "0";
    slider.step = "1";
    container.appendChild(slider);

    // Settings
    const volSet = document.createElement("div");
    volSet.className = "setting";
    const volLabel = document.createElement("label");
    volLabel.textContent = "Volume: ";
    const volVal = document.createElement("span");
    volVal.id = "volumeValue"; volVal.textContent = "50%";
    volLabel.appendChild(volVal);
    volSet.appendChild(volLabel);
    const volSlider = document.createElement("input");
    volSlider.type = "range"; volSlider.id = "volumeSlider";
    volSlider.min = "0"; volSlider.max = "1"; volSlider.step = "0.05";
    volSet.appendChild(volSlider);
    const maxSet = document.createElement("div");
    maxSet.className = "setting";
    const maxLabel = document.createElement("label");
    maxLabel.textContent = "Max Time: ";
    const maxVal = document.createElement("span");
    maxVal.id = "maxTimeValue"; maxVal.textContent = "30";
    maxLabel.appendChild(maxVal);
    maxLabel.appendChild(document.createTextNode("分"));
    maxSet.appendChild(maxLabel);
    const maxSlider = document.createElement("input");
    maxSlider.type = "range"; maxSlider.id = "maxTimeSlider";
    maxSlider.min = "1"; maxSlider.max = "60"; maxSlider.step = "1";
    maxSet.appendChild(maxSlider);
    
    // Wrap settings in details
    const details = document.createElement('details');
    details.style.marginTop = '8px';
    const summary = document.createElement('summary');
    summary.textContent = '⚙️';
    summary.style.cursor = 'pointer';
    details.appendChild(summary);
    details.appendChild(volSet);
    details.appendChild(maxSet);
    container.appendChild(details);

    document.body.appendChild(container);

    // Events
    slider.addEventListener("input", e => {
        remaining = Number(e.target.value);
        updateDisplay();
        chrome.storage.local.set({ savedRemaining: remaining });
    });
    slider.addEventListener("change", () => {
        if (remaining > 0) startTimer();
    });
    disp.addEventListener("click", () => {
        if (timerInterval) {
            clearInterval(timerInterval); timerInterval = null;
            disp.classList.remove("running"); disp.classList.add("paused");
        } else if (remaining > 0) startTimer();
        updateDisplay();
    });
    volSlider.addEventListener("input", () => {
        volume = parseFloat(volSlider.value);
        document.getElementById("volumeValue").textContent = Math.round(volume*100)+"%";
        playChime();
        chrome.storage.local.set({ savedVolume: volume });
    });
    maxSlider.addEventListener("input", () => {
        const m = parseInt(maxSlider.value,10);
        maxTime = m*60; document.getElementById("maxTimeValue").textContent = String(m);
        slider.max = maxTime;
        if (remaining>maxTime) remaining=maxTime, chrome.storage.local.set({ savedRemaining:remaining }), updateDisplay();
        chrome.storage.local.set({ savedMaxTime: maxTime });
    });

    // Load settings
    chrome.storage.local.get(["savedRemaining","savedMaxTime","savedVolume"], res => {
        if (res.savedMaxTime!=null) {
            maxTime=res.savedMaxTime; maxSlider.value=Math.floor(maxTime/60);
            document.getElementById("maxTimeValue").textContent=String(Math.floor(maxTime/60));
            slider.max=maxTime;
        }
        if (res.savedRemaining!=null) remaining=res.savedRemaining; else remaining=maxTime;
        if (res.savedVolume!=null) {
            volume=res.savedVolume; volSlider.value=volume;
            document.getElementById("volumeValue").textContent=Math.round(volume*100)+"%";
        }
        slider.value=remaining;
        updateDisplay();
    });

    makeDraggable(container, header);
}

// Functions
function updateDisplay() {
    const disp = document.getElementById("timerDisplay");
    if (disp) disp.textContent = formatTime(remaining);
    const sliderEl = document.getElementById("timerSlider");
    if (sliderEl) sliderEl.value = remaining;
}

function startTimer() {
    const disp = document.getElementById("timerDisplay");
    disp.classList.remove("paused"); disp.classList.add("running");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remaining = Math.max(0, remaining-1);
        updateDisplay();
        chrome.storage.local.set({ savedRemaining: remaining });
        if (remaining===0) {
            chrome.storage.local.remove("savedRemaining");
            playChime(); clearInterval(timerInterval); timerInterval=null;
            disp.classList.remove("running"); disp.classList.add("paused");
        }
    },1000);
}

function playChime() {
    const ctx = new (AudioContext||webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value=1000; gain.gain.value=volume;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+3);
    setTimeout(()=>{ osc.stop(); ctx.close(); }, 3000);
}

function makeDraggable(el, handle) {
    let offX=0, offY=0, drag=false;
    handle.addEventListener("mousedown", e=>{ drag=true; const r=el.getBoundingClientRect(); offX=e.clientX-r.left; offY=e.clientY-r.top; e.preventDefault(); });
    document.addEventListener("mousemove", e=>{ if(!drag)return; el.style.left=(e.clientX-offX)+"px"; el.style.top=(e.clientY-offY)+"px"; el.style.right="auto"; });
    document.addEventListener("mouseup", ()=>{ drag=false; });
}
