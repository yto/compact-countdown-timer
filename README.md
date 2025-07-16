# Compact Countdown Timer Chrome Extension

A simple and lightweight countdown timer that you can adjust on the fly. Originally developed as a standalone HTML page, now packaged as a Chrome extension for quick access directly from your browser toolbar.

## Features

* **Adjustable Timer**: Drag the slider or click preset buttons to set your desired countdown duration.
* **Immediate Alert**: Plays an alarm sound at 00:00 without delay.
* **Volume Control**: Mouse-over to reveal volume settings.
* **Clean UI**: Minimalist design that fits within the Chrome popup.
* **Persistent Settings** (coming soon): Option to remember your last-used duration.

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/compact-countdown-extension.git
   cd compact-countdown-extension
   ```
2. Package or load as an unpacked extension:

   * Open Chrome and go to `chrome://extensions/`.
   * Enable **Developer mode** (toggle in the top right).
   * Click **Load unpacked** and select this directory.
3. Click the timer icon in the toolbar to open the popup and start using the countdown.

## Usage

1. Click the extension icon in Chrome's toolbar.
2. Use the slider to set your countdown duration.
3. Mouse-over the timer to reveal volume and other settings.
4. Click **Start** to begin the countdown. The alarm plays immediately when time reaches 00:00.

## File Structure

```
compact-countdown-extension/
├── manifest.json        # Chrome Extension manifest (MV3)
├── popup.html           # HTML for the popup UI
├── popup.css            # Styles for the popup
├── popup.js             # Logic for timer and settings
└── icons/               # Extension icons
    ├── icon16.png       # 16×16 px icon
    ├── icon48.png       # 48×48 px icon
    └── icon128.png      # 128×128 px icon
```

## License

This project is licensed under the MIT License.
