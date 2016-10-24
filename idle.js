var port = chrome.runtime.connect({name: "idlestatus"});

console.log("got a port");

port.postMessage({rq: "status"});
port.onMessage.addListener(function(msg) {
    window.postMessage({ type: "idlestatus", state: msg }, "*");
    console.log(msg);
});
