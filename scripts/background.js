var backendUrl = 'https://dry-brook-1207.herokuapp.com/'
var userGroups = []

/*
 * Right-click function to create new post-it
 */
var clickedElement = null;
var clickedWithoutLogin = false;

// Contextmenus listeners and functions

chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(info, tab) {
  if(clickedWithoutLogin == true) {
    chrome.tabs.create({url: backendUrl+"login"});
    return;
  }
  console.log("hejj");
  console.log(userGroups);
  for(var i = 0; i<userGroups.length;i++) {
    if(info.menuItemId === userGroups[i].name) {
      var selectedGroup = userGroups[i].id;
    }
  }
  console.log(selectedGroup);
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    createPostIt({
      dom: clickedElement,
      groupId: selectedGroup,
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
  else if(message.type == "usergroups") {
    var groups = message.groups;
    iterateGroups(0, groups);
  }
})

function iterateGroups(i, groups) {
  if(i == Object.keys(groups).length) {
    return;
  }
  console.log(groups);
  var group = Object.keys(groups)[i];
  console.log(group);
  $.get(backendUrl+"api/group/"+(group), { }, function(data) {
    console.log("hej");
    userGroups.push({
      id: group,
      name: data.name
    });
    chrome.contextMenus.create({
      "title": data.name,
      "contexts":["all"],
      "id": data.name
    });
    console.log(Object.keys(groups).length)
    iterateGroups(i+1, groups);
  });
}

// Talk with the api

function createPostIt(data) {
  $.post(backendUrl+"api/post-it/", data);
}