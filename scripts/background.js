/*
 * Socket io
 */

 var socket = io.connect('https://dry-brook-1207.herokuapp.com/');

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
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    createPostIt({
      dom: clickedElement,
      url: tabs[0].url,
    });
  });
  sendPostIt(clickedElement);
};

// Listen on the right-click event from rightclick.js
chrome.runtime.onMessage.addListener(function(message) {
  if(message.type == "click") {
    clickedElement = message.domElement;
  }
})

// Send the new post-it domElement to create_postit.js
function sendPostIt(domElement) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "create-postit", domElement: domElement}, function(response) {
      console.log(response.farewell);
    });
  });
}

// Talk with the api

function createPostIt(data) {
  socket.emit("CreatePostIt", data);
}

socket.on("GetPostIt", function(data) {
  sendPostIt(data.domElement);
})