var String = require('./scripts/sprintf.min.js');
var InsertLoanSQL = 'CALL insertLoan("%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s");';
var InsertLanguagesSQL = 'CALL insertLanguage("%s","%s");';
var SelectLoanInfoSQL = 'SELECT * FROM loanInfo LIMIT %s';
var SelectLanguagesSQL = 'SELECT loan_id, GROUP_CONCAT(language) AS langList FROM languageView WHERE loan_id IN (%s) GROUP BY loan_id;';

//set up mysql connection
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Passw0rd',
  database : 'kivadb'
});
connection.connect();

module.exports = {
	insertLoan: function(loan) {
		console.log("Inserting loan: " + loan.id);
		insertion(String.sprintf(InsertLoanSQL,loan.id, loan.activity, loan.basket_amount,
		 	loan.borrower_count, loan.funded_amount, loan.image.id, loan.image.template_id, 
		 	loan.loan_amount, loan.name, loan.partner_id, loan.planned_expiration_date, 
		 	loan.posted_date, loan.sector, loan.status, loan.use, loan.location.country, 
		 	loan.location.country_code, loan.location.town));	

		loan.description.languages.forEach(function(language) {
			insertion(String.sprintf(InsertLanguagesSQL, loan.id, language));
		});
	},

	queryLoans: function(limit, callback) {
		//Get newest 20 loans
		console.log("limit: " + limit);
		sqlQuery(String.sprintf(SelectLoanInfoSQL, limit), function(loanRows) {
			var loans = [];
			var rowIds = []
			loanRows.forEach(function(row){
				rowIds.push(row.id);
			});

			//Get lanuages associated with above loans grouped by loan id			
			sqlQuery(String.sprintf(SelectLanguagesSQL, rowIds.join(',')), function(languageRows){
				var languagesByLoanId = [];
				languageRows.forEach(function(languageRow){
					languagesByLoanId[languageRow.loan_id] = languageRow.langList;
				});

				loanRows.forEach(function(loanRow){
					loans.push(createLoanObj(loanRow, languagesByLoanId[loanRow.id]));
				});
				
				callback(loans);
			});
		});
	}
};

//this is kinda gross, but need to build up the description and location objects to match kiva's api
function createLoanObj(row, languages){
	var loanObj = new Object();
	loanObj.activity = row.activity;
	loanObj.basket_amount = row.basket_amount;
	loanObj.borrower_count = row.borrower_count;
	loanObj.description = new Object();
	loanObj.description.languages = new Object();
	loanObj.description.languages = languages.split(",");
	loanObj.funded_amount = row.funded_amount;
	loanObj.id = row.id;
	loanObj.image = new Object();
	loanObj.image.id = row.image_id;
	loanObj.image.template_id = row.image_template_id;
	loanObj.loan_amount = row.loan_amount;
	loanObj.location = new Object();
	loanObj.location.country = row.country;
	loanObj.location.country_code = row.country_code;
	loanObj.location.town = row.town;
	loanObj.name = row.name;
	loanObj.partner_id = row.partner_id;
	loanObj.planned_expiration_date = row.planned_expiration_date;
	loanObj.posted_date = row.posted_date;
	loanObj.sector = row.sector;
	loanObj.status = row.status;
	loanObj.use = row.use;
	return loanObj;
}

function insertion(insertString) {
	connection.query(insertString, function(error, rows){
		if (error == null){
			console.log("Insertion successfull: " + insertString);
		}
		else{
			if (error.code == "ER_DUP_ENTRY"){
				console.log("Ignoring dup");
			}
			else {
				console.error("Error inserting: " + insertString);
				console.error(error);
			}
		}
	});
}

function sqlQuery(queryString, callback) {
	connection.query(queryString, function(error, rows){
		if (error == null){
			console.log("Query successfull");
		}
		else{
			console.error("Error querying: " + queryString);
			console.error(error);
		}

		if (rows != null){
			callback(rows);
		}
	});
}

