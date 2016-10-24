var port = chrome.runtime.connect({name: "idlestatus"});

port.postMessage({rq: "status"});
port.onMessage.addListener(function(msg) {
    window.postMessage({ type: "idlestatus", state: msg }, "*");
});
