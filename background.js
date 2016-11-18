/*
 * Listen to idle events and forward to the configured webpage
 */


var alarm_name = 'rocketchat-presence';
var idleTime = 60; // this is the default

var postMessageToTabs = function(url, msg) {
    chrome.tabs.query({url: url}, function (tabs) {
        tabs.forEach(function (tab) {
            var code = 'window.postMessage(' + msg + ', "*");';
            chrome.tabs.executeScript(tab.id, {code: code});
        });
    });
}

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name !== alarm_name) {
        return;
    }

    chrome.storage.sync.get({
        enableOnUrl: 'https://*/*'
    }, function (items) {
        var msg = "{name: 'rocketchat_presence', type: 'extension_enabled'}";
        postMessageToTabs(items.enableOnUrl, msg);
    });
});

chrome.storage.sync.get({
    enableOnUrl: 'https://*/*',
    idleTime: idleTime
}, function (items) {
    idleTime = items.idleTime;
    if (idleTime < 15) {
        idleTime = 15; // this is the min allowed by idle API
    }
    chrome.idle.setDetectionInterval(idleTime);
    chrome.alarms.create(alarm_name, { periodInMinutes: 1 });
});

chrome.idle.onStateChanged.addListener(function (state) {
    console.log("New idle state is " + state);

    chrome.storage.sync.get({
        enableOnUrl: 'https://*/*'
    }, function (items) {
        var msg = '{name: "rocketchat_presence",' +
                  ' type: "idlestatus", state: "' + state + '"}';
        postMessageToTabs(items.enableOnUrl, msg);
    });
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.idle.setDetectionInterval(idleTime);
});
