var backendUrl = 'https://dry-brook-1207.herokuapp.com/'

/*
 * Right-click function to create new post-it
 */
var clickedElement = null;

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
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    console.log("hej")
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
  console.log("create post it")
  $.post(backendUrl+"api/post-it/", data);
}

//AUTHENTICATION

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://docs.google.com/feeds/',
  'app_name': 'My Google Docs Extension'
});