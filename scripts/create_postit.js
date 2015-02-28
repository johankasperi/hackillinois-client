var posts = []; // array to save all postits at certain url
var id = 0; // id to increment for each postit and certain url

// Create the postit at the position of the clicked element
function createPostit(post) {
	var offset = $(post.DOMstack).offset();
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
		var offset = $(obj.DOMstack).offset();
		$("#comment-plugin-"+obj.id).css({
			top: offset.top,
			left: offset.left
		})
	})
})

// Listen on when we should create postits
chrome.runtime.onMessage.addListener(function(message) {
  console.log(message);
  if(message.type == "create-postit") {
  	var post = {
  		id: id,
  		DOMstack: message.DOMstack,
  	};
  	posts.push(post)
    createPostit(post);
    id++;
  }
})