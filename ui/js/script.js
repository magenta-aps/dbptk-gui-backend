$(".next").click(function(){
	var that = this;
	toggleNav(that);
});

$(".back").click(function(){
	var that = this;
	toggleNav(that);
});
function toggleNav(that) {
	var tab = $(that).attr("href");
	
	var pill = $("[href='" + tab + "']").parent();
	
	$("header li").removeClass("active");
	pill.addClass("active");
}

$("header li.active").nextAll().css("pointer-events", "none");

$(".coming-soon").click(function(){
	alert("Coming soon");
});

// TODO: Checkbox stuff: 
// - select all
$('#select-all').click(function() {   
	$(':checkbox').each(function() {
  	this.checked = true;
	});
});
// - select none
$('#select-none').click(function() {   
	$(':checkbox').each(function() {
  	this.checked = false;
	});
});
// - invert selection
$('#invert-selection').click(function() {
	// TODO check first child if all siblings checked too
	// TODO uncheck first child if 1 sibling unchecked	
	$('table :not(:first-child) :checkbox').each(function() {
		if(this.checked) {
			this.checked = false;
		} else {
			this.checked = true;
		}
	});
});
// - select/deselect table
$(".table-select-toggle").click(function(){
	// TODO check first child if all siblings checked too
	// TODO uncheck first child if 1 sibling unchecked	
	// $(':checkbox').each(function() {
  	// this.checked = true;
	// });
});


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