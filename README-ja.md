# Compact Countdown Timer Chrome 拡張機能

([英語](README.md)/日本語)

シンプルで軽量、かつ即座に調整可能なカウントダウンタイマーです。もともと独立した HTML ページとして開発されましたが、ブラウザのツールバーから直接呼び出せる Chrome 拡張機能としてパッケージ化しました。

## Chrome ウェブストア

Compact Countdown Timer - Chrome Web Store
https://chromewebstore.google.com/detail/compact-countdown-timer/gldacfngoojoejbpmibifoddkcmbhnil

## 機能

* **調整可能なタイマー**: スライダーをドラッグして任意のカウントダウン時間を設定
* **即時アラート**: カウントが00:00になるとアラーム音を再生
* **音量コントロール**: マウスオーバーで音量設定を表示
* **クリーンな UI**: Chrome ポップアップ内に収まるミニマルデザイン
* **設定の永続化**: 前回使用した時間や設定を記憶

## インストール手順

1. リポジトリをクローン

   ```bash
   git clone https://github.com/your-username/compact-countdown-timer.git
   cd compact-countdown-timer
   ```
2. Chrome に「パッケージ化されていない拡張機能」として読み込む

   * Chrome を開き、アドレスバーに `chrome://extensions/` を入力
   * 右上の **デベロッパーモード** を有効化
   * **パッケージ化されていない拡張機能を読み込む** をクリックし、`chrome` ディレクトリを選択
3. ツールバーのタイマーアイコンをクリックしてポップアップを開き、カウントダウンを開始

## 使い方

1. Chrome のツールバーにある拡張機能アイコンをクリック
2. スライダーでカウントダウン時間を設定
3. マウスオーバーで音量やその他設定を表示
4. 表示時間をクリックするか、スライダーを動かすことでカウントダウン開始。00:00 到達時に即座にアラームが鳴ります

## ライセンス

MIT ライセンスの下で公開しています。
