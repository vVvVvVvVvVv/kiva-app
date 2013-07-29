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
		var country = loan.location.country.toString();
		var country_code = loan.location.country_code.toString();
		var town = loan.location.town.toString();
		console.log(country + country_code + town);
		//ignoring insertion of duplicates, mysql will just throw an error
		insertion("INSERT INTO countries (country, country_code) values ('"
				+ country + "','"
				+ country_code
				+ "');"
			);

		insertion("INSERT INTO towns (town) values ('"
				+ town
				+ "');"
			);
		sqlQuery("SELECT id from towns WHERE town='" + loan.location.town +"'", function(rows){
			console.log("rows: " + rows);
			var town_id = rows[0].id;
			
			sqlQuery("SELECT id from countries WHERE country_code='" + loan.location.country_code +"'", function(rows){
				var country_id = rows[0].id;

				insertion("INSERT INTO loans values ('"
					+ loan.id + "','"
					+ loan.activity + "','"
					+ loan.basket_amount + "','"
					+ loan.borrower_count + "','"
					+ loan.funded_amount + "','"
					+ loan.loan_amount + "','"
					+ loan.name + "','"
					+ loan.partner_id + "','"
					+ loan.planned_expiration_date + "','"
					+ loan.posted_date + "','"
					+ loan.sector + "','"
					+ loan.status + "','"
					+ loan.use + "','"
					+ country_id + "','"
					+ town_id
					+ "');"
					);
			});
		});
	},

	queryLoans: function(callback) {
		sqlQuery("Select * from loanInfo", callback);
	}
};

function insertion(insertString) {
	connection.query(insertString, function(error, rows){
		if (error == null){
			console.log("Insertion successfull: " + insertString);
		}
		else{
			console.error("Error inserting: " + insertString);
			console.error(error);
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