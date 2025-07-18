# Compact Countdown Timer Chrome Extension

(English/[Japanese](README-ja.md))

A simple and lightweight countdown timer that you can adjust on the fly. Originally developed as a standalone HTML page, now packaged as a Chrome extension for quick access directly from your browser toolbar.

## Chrome Web Store

Compact Countdown Timer - Chrome Web Store
https://chromewebstore.google.com/detail/compact-countdown-timer/gldacfngoojoejbpmibifoddkcmbhnil

## Features

* **Adjustable Timer**: Drag the slider to set your desired countdown duration.
* **Immediate Alert**: Plays an alarm sound at 00:00 without delay.
* **Volume Control**: Mouse-over to reveal volume settings.
* **Clean UI**: Minimalist design that fits within the Chrome popup.
* **Persistent Settings**: Remembers the last-used duration and settings.

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/compact-countdown-timer.git
   cd compact-countdown-timer
   ```
2. Package or load as an unpacked extension:

   * Open Chrome and go to `chrome://extensions/`.
   * Enable **Developer mode** (toggle in the top right).
   * Click **Load unpacked** and select the `chrome` directory.
3. Click the timer icon in the toolbar to open the popup and start using the countdown.

## Running Tests

Install dependencies and run Jest from the `chrome` folder:

```bash
cd chrome
npm install
npm test
```

## Usage

1. Click the extension icon in Chrome's toolbar.
2. Use the slider to set your countdown duration.
3. Mouse-over the timer to reveal volume and other settings.
4. Start the countdown by clicking the displayed time or moving the slider.  The alarm plays immediately when time reaches 00:00.

## License

This project is licensed under the MIT License.

