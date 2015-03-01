var backendUrl = "https://dry-brook-1207.herokuapp.com/"

/*
 * Socket io
 */

 var socket = io.connect(backendUrl);

// Listeners
socket.on("connect", function() {
	socket.emit("joinRoom", { url: window.location.href });
	socket.on("NewPostItCreated", function(data) {
		console.log("apppa");
		createPostIt(data.newPostIt.domElement, data.postId);
	})
	socket.on("NewCommentCreated", function(data) {
		console.log("aoid")
		createComment(data.comment.comment, data.comment.username, data.postId);
	})
})

/*
 * Get all postits when entering url
 */

$(window).load(function() {
	$.get(backendUrl+"api/post-it", { url: window.location.href }, function(data) {
		$.each(data, function(i, obj) {
			createPostIt(obj.domElement, obj.id);
		});
	});
});

/*
 * Creation of postit
 */

var posts = []; // array to save all postits at certain url

// Create the postit at the position of the clicked element
function createPostIt(domElement, id) {
	var post = {
  		id: id,
  		domElement: domElement,
  	};
  	posts.push(post);
	
	var offset = $(post.domElement).offset();
	var domId = "comment-plugin-"+post.id;
	var wrapper = $("<div></div>").attr("id", domId).addClass("comment-plugin").css({
		position: "absolute",
		top: offset.top,
		left: offset.left
	});
	var title = $("<div></div>").addClass("comment-title").html("Comment this!");
	var comments = $("<div></div>").addClass("comment-comments");
	var formWrapper = $("<div></div>").addClass("comment-formWrap");
	var form = $("<form></form>").attr("id", "comment-form");
	var inputComment = $('<input type="text" name="comment" class="input-comment" placeholder="Write comment here"></input>');
	var inputUser = $('<input type="text" name="user" class="input-user" placeholder="Your name"></input>');
	var button = $('<button></button>').html("Submit");
	
	form.append(inputComment).append(inputUser).append(button);
	formWrapper.append(form);
	wrapper.append(title).append(comments).append(formWrapper);
	$("body").append(wrapper);

	$("#" + domId + " form#comment-form").submit(function(e) {
		e.preventDefault();
		var comment = $("#" + domId + " .input-comment").val();
		$("#" + domId + " .input-comment").val('');
		var user = $("#" + domId + " .input-user").val();
		$("#" + domId + " .input-user").val('');
		submitComment(comment, user, post.id);
	});
}

// Move postits on window resize
$(window).resize(function() {
	$.each(posts, function(index, obj) {
		var offset = $(obj.domElement).offset();
		$("#comment-plugin-"+obj.id).css({
			top: offset.top,
			left: offset.left
		})
	})
})

/*
 * Comment handling
 */

function createComment(comment, user, postId) {
	console.log("createComment")
	var comment = $("<div></div>").addClass("comment-row")
		.append("<span>"+comment+"</span>")
		.append("<span>"+user+"</span>");
	console.log($("#comment-plugin-"+postId+" .comment-comments"));
	$("#comment-plugin-"+postId+" .comment-comments").append(comment);
}

function submitComment(comment, user, postId) {
	$.post(backendUrl+"api/comment/", {
		username: user,
		comment: comment,
		postId: postId
	})
}

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

})