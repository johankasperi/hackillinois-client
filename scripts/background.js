var backendUrl = 'https://dry-brook-1207.herokuapp.com/'

/*
 * Right-click function to create new post-it
 */
var clickedElement = null;
var clickedWithoutLogin = false;

// Contextmenus listeners and functions
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
  if(clickedWithoutLogin == true) {
    chrome.tabs.create({url: backendUrl+"login"});
    return;
  }
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    createPostIt({
      dom: clickedElement,
      url: tabs[0].url,
    });
  });
};

// Listen on the right-click event from rightclick.js
chrome.runtime.onMessage.addListener(function(message) {
  if(message.type == "click") {
    clickedWithoutLogin = false;
    clickedElement = message.domElement;
  }
  else if(message.type == "click-without-login") {
    clickedWithoutLogin = true;
  }
  else if(message.type == "open-tab") {
    chrome.tabs.create({url: message.url});
  }
})

// Talk with the api

function createPostIt(data) {
  console.log("create post it")
  $.post(backendUrl+"api/post-it/", data);
}