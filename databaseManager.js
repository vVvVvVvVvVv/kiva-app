var String = require('./scripts/sprintf.min.js');

//SQL strings
var InsertCountriesSQL = "INSERT INTO countries (country, country_code) VALUES ('%s','%s');";
var InsertTownsSQL = "INSERT INTO towns (town) VALUES ('%s');";
var InsertLanguagesSQL = "INSERT INTO languages (language) VALUES ('%s');";
var InsertLoanLanguagesSQL = "INSERT INTO loanLanguages (loan_id, language_id) VALUES ('%s', '%s');";
var InsertLoanSQL = "INSERT INTO loans values ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s');";

var SelectTownId = "SELECT id FROM towns WHERE town='%s'";
var SelectCountryId = "SELECT id from countries WHERE country_code='%s'";
var SelectLanguageId = "SELECT id from languages WHERE language='%s'";
//set up mysql connection
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Passw0rd',
  database : 'kivaapp'
});
connection.connect();

module.exports = {
	insertLoan: function(loan) {
		console.log("Inserting loan: " + loan.id);
		
		//add all foriegn key dependencies
		//ignore insertion of duplicates, mysql will just throw an error
		insertion(String.sprintf(InsertCountriesSQL, loan.location.country, loan.location.country_code));
		insertion(String.sprintf(InsertTownsSQL, loan.location.town));
				
		sqlQuery(String.sprintf(SelectTownId, loan.location.town), function(rows){
			var town_id = rows[0].id;
			
			sqlQuery(String.sprintf(SelectCountryId, loan.location.country_code), function(rows){
				var country_id = rows[0].id;

				insertion(String.sprintf(InsertLoanSQL,loan.id, loan.activity, loan.basket_amount,
				 	loan.borrower_count, loan.funded_amount, loan.image.id, loan.image.template_id, 
				 	loan.loan_amount, loan.name, loan.partner_id, loan.planned_expiration_date, 
				 	loan.posted_date, loan.sector, loan.status, loan.use, country_id, town_id));
			});
		});

		//deal with languags seperately
		loan.description.languages.forEach(function(language) {
			insertion(String.sprintf(InsertLanguagesSQL, language));
		});

		loan.description.languages.forEach(function(language) {
			sqlQuery(String.sprintf(SelectLanguageId, language), function(rows){
				var language_id = rows[0].id;
				insertion(String.sprintf(InsertLoanLanguagesSQL, loan.id, language_id));
			});
		});
	},

	queryLoans: function(callback) {
		sqlQuery("Select * from loanInfo", function(loanRows) {
			var loans = [];
			var rowIds = []
			loanRows.forEach(function(row){
				rowIds.push(row.id);
			})
			
			var query = "select * from languageView where loan_id in (" + rowIds.join(',') + ");"
			sqlQuery(query, function(languageRows){
				//should use a Dictionary here
				var languagesByLoanId = [];
				languageRows.forEach(function(languageRow){
					if (languagesByLoanId.hasOwnProperty(languageRow.loan_id)){
						languagesByLoanId[languageRow.loan_id].push(languageRow.language);
					}
					else
					{
						languagesByLoanId[languageRow.loan_id] = [languageRow.language];
					}
				});

				loanRows.forEach(function(loanRow){
					loans.push(createLoanObj(loanRow, languagesByLoanId[loanRow.id]));
				});
				
				callback(loans);
			});
		});
	}
};

//this is kinda gross, not sure how else to do it
function createLoanObj(row, languages){
	var loanObj = new Object();
	loanObj.activity = row.activity;
	loanObj.basket_amount = row.basket_amount;
	loanObj.borrower_count = row.borrower_count;
	loanObj.description = new Object();
	loanObj.description.languages = new Object();
	loanObj.description.languages = languages;
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
			console.error("Error querying: " + error);
		}

		if (rows != null){
			callback(rows);
		}
	});
}

