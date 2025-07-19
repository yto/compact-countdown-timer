chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_TIMER" });
});
chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "toggle-timer" && tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_TIMER" });
    }
});
