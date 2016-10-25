/*
 * Listen to idle events and forward to the configured webpage
 */


var idleTime = 60; // this is the default

chrome.storage.sync.get({
    enableOnUrl: 'https://*/*',
    idleTime: idleTime
}, function (items) {
    idleTime = items.idleTime;
    if (idleTime < 15) {
        idleTime = 15; // this is the min allowed by idle API
    }
    chrome.idle.setDetectionInterval(idleTime);
});

chrome.idle.onStateChanged.addListener(function (state) {
    console.log("New idle state is " + state);

    chrome.storage.sync.get({
        enableOnUrl: 'https://*/*'
    }, function (items) {
        var url = items.enableOnUrl;
        var msg = "{type: \"idlestatus\", state: \"" + state + "\"}";
        var code = "window.postMessage(" + msg + ", \"*\");";

        chrome.tabs.query({ url: url }, function (tabs) {
            tabs.forEach(function (tab) {
                chrome.tabs.executeScript(tab.id, { code: code });
            });
        });
    });
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.idle.setDetectionInterval(idleTime);
});
