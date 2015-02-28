/*
 * Socket io
 */

 var socket = io.connect('https://dry-brook-1207.herokuapp.com/');

/*
 * Get all postits when entering url
 */

$(document).ready(function() {
	console.log(window.location.href);
	socket.emit("GetAllPostItUrl", { url: window.location.href });
});

socket.on("GetAllPostItUrl", function(data) {
	console.log(data);
	$.each(data, function(i, obj) {
		createPostIt(obj.domElement);
	})
})


/*
 * Creation of postit
 */

var posts = []; // array to save all postits at certain url
var id = 0; // id to increment for each postit and certain url

// Create the postit at the position of the clicked element
function createPostIt(domElement) {
	var post = {
  		id: id,
  		domElement: domElement,
  	};
  	posts.push(post);
  	id++;
	console.log(post.domElement);
	var offset = $(post.domElement).offset();
	var wrapper = $("<div></div>").attr("id", "comment-plugin-"+post.id).addClass("comment-plugin").css({
		position: "absolute",
		top: offset.top,
		left: offset.left
	});
	var title = $("<div></div>").addClass("comment-title").html("Comment this!");
	var formWrapper = $("<div></div>").addClass("comment-formWrap");
	var form = $("<form></form>").attr("id", "comment-form");
	var input = $('<input type="text" name="input" placeholder="Write comment here"></input>');
	var button = $('<button></button>').html("Submit");
	form.append(input).append(button);
	formWrapper.append(form);
	wrapper.append(title).append(formWrapper);
	$("body").append(wrapper);
}

// Move postits on window resize
$(window).resize(function() {
	$.each(posts, function(index, obj) {
		console.log(obj);
		var offset = $(obj.domElement).offset();
		$("#comment-plugin-"+obj.id).css({
			top: offset.top,
			left: offset.left
		})
	})
})

/*
 * Right-click events
 */
$(document).on("contextmenu", function(e) {
	getDom(e.target, "", function(domElement) {
		chrome.runtime.sendMessage({
			type: "click",
			domElement: domElement.trim()
		}, function(response) {
			console.log(response.farewell);
		})
	});
})

function getDom(element, domElement, callback) {
	if($(element).attr("id")) {
		return callback("#" + $(element).attr("id").split(" ")[0] + " " + domElement);
	}
	if($(element).attr("class")) {
		return getDom($(element).parent(), "." + $(element).attr("class").split(" ").join(".") + " " + domElement, callback);
	}
	getDom($(element).parent(), $(element).prop("tagName").toLowerCase() + " " + domElement, callback);
}

/*
 * Listen on the background.js
 */
chrome.runtime.onMessage.addListener(function(message) {
  if(message.type == "create-postit") {
    createPostIt(message.domElement);
  }
})