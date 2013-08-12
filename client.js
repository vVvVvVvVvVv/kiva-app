$(document).ready(function(){
	var loans = [];
	
	$.get("http://api.kivaws.org/v1/loans/newest.json", function(data){
		loans = data.loans;
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
	var loanDictionary = [];
	
	//populate loan dictionary with loan id as the key
	$.each(loans, function(i, loan){
			loanDictionary[loan.id] = loan;
		});

	//Extract the loan information we want to display
	$.each(loans, function(i, loan) {
      loanInfo.push([
      	imageIdToImage(loan.image.id),
      	loan.id,
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
  	var dataTable = $('#loans-table').dataTable({
        "aaData": loanInfo,
        "aoColumns": [
          { "sTitle": ""},
          { "sTitle": "Id"},
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

    //set up loan-view
    var width = $(window).width() * 0.80;
	var height = $(window).height() * 0.80;
	$("#loan-view").dialog({
		autoOpen: false,
	    modal: true,
	    height: height,
	    width: width
	  });

    //To get table row event binding to work, datatables suggests using the live function
    //Unfortunately jquery 1.9 deprecated 'live' for 'on' and datatables has yet to update
    //their functions (planned for datatables 1.10). While I wait for them, using jquery 1.8
	$('#loans-table tbody tr').live('click', function () {
		var tRow = $('td', this);
		var id = $(tRow[1]).text();
		var loan = loanDictionary[id];
		var html = compileHtml(loan, width, height);
		$("#loan-view").html(html).dialog("open");
	});

	//Make rows look clickable
  	dataTable.$('tr').css('cursor', 'pointer');
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
	context.percentage = Math.round(loan.funded_amount * 100 / loan.loan_amount);
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

