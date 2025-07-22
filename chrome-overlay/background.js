async function setVisible(tabId, visible) {
    await chrome.storage.session.set({ ['cct_visible_' + tabId]: visible });
}
async function getVisible(tabId) {
    const obj = await chrome.storage.session.get('cct_visible_' + tabId);
    return obj['cct_visible_' + tabId] === true;
}
async function setPos(tabId, pos) {
    await chrome.storage.session.set({ ['cct_pos_' + tabId]: pos });
}
async function getPos(tabId) {
    const obj = await chrome.storage.session.get('cct_pos_' + tabId);
    return obj['cct_pos_' + tabId] || null;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
        const tabId = sender.tab?.id;
        if (!tabId) return;
        if (msg.type === 'INIT_REQ') {
            sendResponse({
                visible: await getVisible(tabId),
                pos:     await getPos(tabId)
            });
        } else if (msg.type === 'SET_VISIBLE') {
            await setVisible(tabId, msg.visible);
            sendResponse({ ok: true });
        } else if (msg.type === 'SET_POS') {
            await setPos(tabId, msg.pos);
            sendResponse({ ok: true });
        }
    })();
    return true;
});

// タブが閉じられたら状態も削除
chrome.tabs.onRemoved.addListener(async (tabId) => {
    await chrome.storage.session.remove([
        'cct_visible_' + tabId,
        'cct_pos_'     + tabId
    ]);
});


chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_TIMER" });
});
chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "toggle-timer" && tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_TIMER" });
    }
});
