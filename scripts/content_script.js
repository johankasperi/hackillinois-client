var backendUrl = "http://localhost:8080/"

/*
 * Auth
 */

var currentUser = null;

function handleAuth(authToken, uid) {
	console.log(uid)
	if(uid !== null && uid !== '') {
		$.get(backendUrl+"api/users/"+uid, function(){})
		.done(function(data){
			currentUser = data;
			init(currentUser);
			console.log(currentUser.groups);
			chrome.runtime.sendMessage({
				type: "usergroups",
				groups: currentUser.groups
			}, function(response) {
				console.log(response.farewell);
			})
		})
		.fail(function(err) {
			chrome.storage.local.remove(['firebaseAuthToken', 'firebaseUid']);
			chrome.runtime.sendMessage({
				type: "open-tab",
				url: backendUrl
			}, function(response) {
				console.log(response.farewell);
			})
		})
	}
	else {
		chrome.storage.local.remove(['firebaseAuthToken', 'firebaseUid']);
		chrome.runtime.sendMessage({
			type: "open-tab",
			url: backendUrl
		}, function(response) {
			console.log(response.farewell);
		})
	}
}

chrome.storage.local.get(['firebaseAuthToken', 'firebaseUid'], function(items) {
	var authToken = items.firebaseAuthToken || null;
	var uid = items.firebaseUid || null;
	handleAuth(authToken, uid);
});
/*
 * Socket io
 */

var socket = io.connect(backendUrl);

// Listeners
function initSocket() {
	socket.on("connect", function() {
		for(var group in currentUser.groups) {
			console.log(group);
			socket.emit("joinRoom", { url: window.location.href, groupId: group });
		}

		socket.on("NewPostItCreated", function(data) {
			var post = {
				groupId: data.groupId,
				post: data
			};
			console.log("emit")
			createPostIt(post);
		})
		socket.on("NewCommentCreated", function(data) {
			console.log("commentemit")
			createComment(data.comment.comment, data.comment.username, data.comment.date, data.postId);
		})
	})
}


/*
 * Get all postits when entering url
 */

function getAllPostIts() {
	for(var group in currentUser.groups) {
		$.get(backendUrl+"api/post-it", { url: window.location.href, groupId: group }, function(data) {
			$.each(data, function(i, data) {
				var post = {
					groupId: group,
					post: data
				};
				createPostIt(post);
			});
		});
	}
}

/*
 * Creation of postit
 */

var posts = []; // array to save all postits at certain url

// Create the postit at the position of the clicked element
function createPostIt(data) {
	var post = data.post;
  	posts.push(post);
  	// Build postit
	var offset = $(post.post.domElement).offset();
	var domId = "comment-plugin-"+post.id;
	var wrapper = $("<div></div>").attr("id", domId).addClass("comment-plugin").css({
		position: "absolute",
		top: offset.top,
		left: offset.left
	});
	var dragIcon = $("<div></div>").addClass("comment-dragicon").html("Drag me");
	var title = $("<div></div>").addClass("comment-title").html("Comment this!");
	var comments = $("<div></div>").addClass("comment-comments");
	var formWrapper = $("<div></div>").addClass("comment-formWrap");
	var form = $("<form></form>").attr("id", "comment-form");
	var inputComment = $('<input type="text" name="comment" class="input-comment" placeholder="Write comment here"></input>');
	var inputUser = $('<input type="text" name="user" class="input-user" placeholder="Your name"></input>');
	var button = $('<button></button>').html("Submit");

	form.append(inputComment).append(inputUser).append(button);
	formWrapper.append(form);
	wrapper.append(dragIcon).append(title).append(comments).append(formWrapper);
	$("body").append(wrapper);

	// Submit comment form event
	$("#" + domId + " form#comment-form").submit(function(e) {
		e.preventDefault();
		var comment = $("#" + domId + " .input-comment").val();
		$("#" + domId + " .input-comment").val('');
		var user = $("#" + domId + " .input-user").val();
		$("#" + domId + " .input-user").val('');
		var group = $("#" + domId + " .group-select").val();
		submitComment(comment, user, data.groupId, post.id);
	});

	// Insert all comments
	if(post.post.comments) {
		$.each(post.post.comments, function(i, comment) {
			createComment(comment.comment, comment.username, comment.date, post.id);
		})
	}

	// Make draggable
	$("#"+domId).draggable({handle: ".comment-dragicon"});
}

// Move postits on window resize
function windowResize() {
	$(window).resize(function() {
		$.each(posts, function(index, obj) {
			var offset = $(obj.domElement).offset();
			$("#comment-plugin-"+obj.postId).css({
				top: offset.top,
				left: offset.left
			})
		})
	})
}

/*
 * Comment handling
 */

function createComment(comment, user, unix_timestamp, postId) {
	var comment = $("<div></div>").addClass("comment-row")
		.append('<div class="message">'+comment+"</div>")
		.append('<div class="date">'+$.timeago(new Date(unix_timestamp))+'</div>')
		.append('<div class="user">'+user+"</div>");
	$("#comment-plugin-"+postId+" .comment-comments").append(comment);
}

function submitComment(comment, user, group, postId) {
	$.post(backendUrl+"api/comment/", {
		username: user,
		comment: comment,
		groupId: group,
		postId: postId
	})
}

/*
 * Right-click events
 */
$(document).on("contextmenu", function(e) {
	if(currentUser == null) {
		chrome.runtime.sendMessage({
			type: "click-without-login"
		}, function(response) {
			console.log(response.farewell);
		})
	}
	else {
		getDom(e.target, "", function(domElement) {
			chrome.runtime.sendMessage({
				type: "click",
				domElement: domElement
			}, function(response) {
				console.log(response.farewell);
			})
		});
	}
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
 * Init
 */
function init() {
	if(currentUser == null) {
		return;
	}

	getAllPostIts();
	windowResize();
	initSocket();
}