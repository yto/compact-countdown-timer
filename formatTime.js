function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = formatTime;
} else {
  window.formatTime = formatTime;
}
