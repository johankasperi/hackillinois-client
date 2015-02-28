/*
 * Socket io
 */

 var socket = io.connect('http://localhost:3000/');

/*
 * Right-click function to create new post-it
 */

// Contectmenus listeners and functions
var clickedElement = null;
chrome.runtime.onInstalled.addListener(function() {
  var context = "all";
  var title = "Comment this";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts":[context],
    "id": "context" + context
  });
});

chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(info, tab) {
  socket.emit('create post-it', {
    dom: clickedElement,
    url: "www.hej.se"
  });
  sendPostit(clickedElement);
};

// Listen on the right-click event from rightclick.js
chrome.runtime.onMessage.addListener(function(message) {
  if(message.type == "click") {
    clickedElement = message.DOMstack;
  }
})

// Send the new post-it domstack to create_postit.js
function sendPostit(DOMstack) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "create-postit", DOMstack: DOMstack}, function(response) {
      console.log(response.farewell);
    });
  });
}

// Talk with the api

//$.post("")