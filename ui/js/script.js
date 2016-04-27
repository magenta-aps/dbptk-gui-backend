// TODO: navigation, show the right tab
// detect targeted tab
// find header nav tag with same href?
// switch active class to right nav tag

// TODO: deactivate not reached steps in nav

$(".coming-soon").click(function(){
	alert("Coming soon");
});

// TODO: Checkbox stuff: 
// - select all
// - select none
// - invert selection
// - select/deselect table


// TODO: animate loading bar only when we get on this tab
var loadingProgress = 0;
function loadProgress() {
	if (loadingProgress < 100) {
		loadingProgress++;
		$(".progress-bar").attr("aria-valuenow", loadingProgress);
		$(".progress-bar").css("width", loadingProgress + "%");
		$(".loading-progress-status").text(loadingProgress + "%");
	}
};

var intervalLoading = setInterval(loadProgress, 1000);


// TODO later: (when database actually connected)
// - "Connect & Next" should only forward when connection worked 
// - animate loading bar according to process
// - Generate content dynamically

// Others:
// - Figure out what "Browse" does
// - Figure out if dowload destination folder somehow choosable
