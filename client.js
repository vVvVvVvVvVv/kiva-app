//start off just grabbing newest loans and logging them
$(document).ready(function(){
	$.get("http://api.kivaws.org/v1/loans/newest.json", function(data){
		console.log(data.loans);
	});
});