$(document).ready(function(){
	var loans = [];

	$.get("http://api.kivaws.org/v1/loans/newest.json", function(data){
		loans = data.loans;
		console.log(loans);
		setupLoansTable(loans);
	});

	$('#save').click(function(){
		console.log("Saved loans to DB");

		$.ajax({
		    url: '/save/', 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify(loans)
		});
	});
});

function setupLoansTable(loans){
	var loanInfo = [];

	//Extract the loan information we want to display
	$.each(loans, function(i, loan) {
      loanInfo.push([
      	imageIdToImage(loan.image.id),
      	loan.name,
      	loan.activity,
      	loan.sector,
      	locationToString(loan.location),
      	loan.loan_amount,
      	loan.funded_amount,
      	loan.borrower_count,
      	loan.use]);
  	});

	//Create data table and add data
  	$('#loans-table').dataTable({
        "aaData": loanInfo,
        "aoColumns": [
          { "sTitle": ""},
          { "sTitle": "Name"},
          { "sTitle": "Activity"},
          { "sTitle": "Sector"},
          { "sTitle": "Location"},
          { "sTitle": "Loan Amount"},
          { "sTitle": "Funded Amount"},
          { "sTitle": "Borrower Count"},
          { "sTitle": "Use"},
	    ],
	    "bJQueryUI": true,
	    "sPaginationType": "full_numbers",
	    "bAutoWidth": false
     }, "json");

  	//add the array index to each table row so we can reference the loan table later (hacky)
    var row = 0;
    $('#loans-table tbody tr').each( function() {     
        this.setAttribute('row', row);
        $(this).css('cursor', 'pointer');
        row++;
    });

    //set up loan-view
    var width = $(window).width() * 0.80;
	var height = $(window).height() * 0.80;
	$("#loan-view").dialog({
		autoOpen: false,
	    modal: true,
	    height: height,
	    width: width
	  });

    // Add click event
	$('#loans-table tbody tr').click(function () {
		var row = this.getAttribute('row');
		console.log("Click: " + row);
		var loan = loans[row];
		console.log(loan);
		var html = compileHtml(loan, width, height);
		$("#loan-view").html(html).dialog("open");
	});
}

//Using handlebars for templating
function compileHtml(loan, width, height){
	var source   = $("#loan-template").html();
	var template = Handlebars.compile(source);
	var context = loan;
	context.location_text = locationToString(loan.location);
	context.description_text = descriptionToString(loan.description)
	context.imgwidth = Math.round(width * 0.45);
	context.imgheight = Math.round(height * 0.95);
	return template(context);
}

function imageIdToImage(id) {
	try {
		return "<img src='http://www.kiva.org/img/80x80/" + id + ".jpg'>";	
	}
	catch(error) {
		return "";
	}
}

function locationToString(location) {
	try {
		return location.town + ", " + location.country;
	}
	catch(error) {
		return "";
	}
}

function descriptionToString(description) {
	try {
		return description.languages.join(", ");
	}
	catch(error) {
		return "";
	}
}


window.alert = function(){return null;}; // disable alerts

