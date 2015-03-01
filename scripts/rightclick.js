// Right-click events and helper functions

$(document).on("contextmenu", function(e) {
	getDom(e.target, "", function(DOMstack) {
		chrome.runtime.sendMessage({
			type: "click",
			DOMstack: DOMstack.trim()
		}, function(response) {
			console.log(response.farewell);
		})
	});
})

function getDom(element, DOMstack, callback) {
	if($(element).attr("id")) {
		return callback("#" + $(element).attr("id").split(" ")[0] + " " + DOMstack);
	}
	if($(element).attr("class")) {
		return getDom($(element).parent(), "." + $(element).attr("class").split(" ").join(".") + " " + DOMstack, callback);
	}
	getDom($(element).parent(), $(element).prop("tagName").toLowerCase() + " " + DOMstack, callback);
}