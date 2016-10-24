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

        chrome.tabs.query({ url: url }, function (tabs) {
            tabs.forEach(function (tab) {
                chrome.tabs.executeScript(tab.id, { file: "/idle.js" });
            });
        });
    });
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.idle.setDetectionInterval(idleTime);
});

chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name == "idlestatus");
    port.onMessage.addListener(function (msg) {
        if (msg.rq == "status") {
            chrome.idle.queryState(idleTime, function (state) {
                port.postMessage({ state: state });
            });
        }
    });
});
