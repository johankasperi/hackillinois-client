var firebaseAuthToken = "";
var firebaseUid = "";
var intervalId = null;
var checker = function() {
  firebaseAuthToken = $('#firebaseAuthToken').text();
  firebaseUid = $('#firebaseUid').text();
  console.log("checker");
  if(firebaseAuthToken != '') {
    console.log('set to local storage', {firebaseAuthToken: firebaseAuthToken, firebaseUid: firebaseUid});
    chrome.storage.local.set({firebaseAuthToken: firebaseAuthToken, firebaseUid: firebaseUid, });
    clearTimeout(intervalId);
  }
};

intervalId = setTimeout(checker, 100);