#Tables
CREATE TABLE countries (
id INT NOT NULL AUTO_INCREMENT,
country VARCHAR(255),
country_code VARCHAR(2),
PRIMARY KEY (id)
);

CREATE TABLE towns (
id INT NOT NULL AUTO_INCREMENT,
town VARCHAR(255),
PRIMARY KEY (id)
);

CREATE TABLE loans
(
id INT NOT NULL,
activity VARCHAR(255),
basket_amount INT,
borrower_count INT,
funded_amount INT,
image_id INT,
image_template_id INT,
loan_amount INT,
name VARCHAR(255),
partner_id INT,
planned_expiration_date DATETIME,
posted_date DATETIME,
sector VARCHAR(255),
status VARCHAR(255),
use_text VARCHAR(255),
country_id INT,
town_id INT,
PRIMARY KEY (id),
FOREIGN KEY (country_id) REFERENCES countries(id),
FOREIGN KEY (town_id) REFERENCES towns(id)
);

#Since there can be many langauges for one loan we need a seperate table to hold that info
CREATE TABLE loanLanguages (
loan_id INT,
language_id INT,
PRIMARY KEY (loan_id, language_id),
FOREIGN KEY (loan_id) REFERENCES loans(id),
FOREIGN KEY (language_id) REFERENCES languages(id)
);

CREATE TABLE languages (
id INT NOT NULL AUTO_INCREMENT,
language VARCHAR(255),
PRIMARY KEY (id)
);

#Views
CREATE VIEW loanInfo AS
SELECT activity, basket_amount, borrower_count, funded_amount, image_id, image_template_id, loans.id AS id, 
loan_amount, countries.country AS country, countries.country_code AS country_code, towns.town AS town, 
name, partner_id, planned_expiration_date, posted_date, sector, status, use_text AS 'use'
FROM loans 
INNER JOIN countries on (loans.country_id = countries.id)
INNER JOIN towns on (loans.town_id = towns.id)
ORDER BY posted_date DESC;

CREATE VIEW languageView AS
SELECT loanLanguages.loan_id, language FROM languages
INNER JOIN loanLanguages on (loanLanguages.language_id = languages.id);

#Functions
CREATE PROCEDURE insertLoan(loan_id INT, activity VARCHAR(255), basket_amount INT, borrower_count INT, 
funded_amount INT, image_id INT, image_template_id INT, loan_amount INT, name VARCHAR(255), 
partner_id INT, planned_expiration_date DATETIME, posted_date DATETIME, sector VARCHAR(255), 
status VARCHAR(255), use_text VARCHAR(255), country_name VARCHAR(255), country_code_name VARCHAR(2), 
town_name VARCHAR(255))
BEGIN
DECLARE country_index INT;
DECLARE town_index INT;
#Get id of exisiting country or insert a new one
SELECT id INTO country_index FROM countries WHERE country_code LIKE country_code_name;
IF country_index IS NULL THEN
INSERT INTO countries (country, country_code) VALUES (country_name, country_code_name);
SELECT id INTO country_index FROM countries WHERE country_code LIKE country_code_name;
END IF;
#Get id of exisiting town or insert a new one
SELECT id INTO town_index FROM towns WHERE town LIKE town_name;
IF town_index IS NULL THEN
INSERT INTO towns (town) VALUES (town_name);
SELECT id INTO town_index FROM towns WHERE town LIKE town_name;
END IF;
#Insert new loan
INSERT INTO loans VALUES(loan_id, activity, basket_amount, borrower_count, funded_amount, image_id, image_template_id, 
loan_amount, name, partner_id, planned_expiration_date, posted_date, sector, status, use_text, country_index,
town_index);
END//

CREATE PROCEDURE insertLanguage(loan_id INT, language_name VARCHAR(255))
BEGIN
DECLARE language_index INT;
SELECT id INTO language_index FROM languages WHERE language LIKE language_name;
IF language_index IS NULL THEN
INSERT INTO languages (language) VALUES (language_name);
SELECT id INTO language_index FROM languages WHERE language LIKE language_name;
END IF;
INSERT INTO loanLanguages VALUES (loan_id, language_index);
END//

#Indexes
CREATE INDEX townIndex ON towns (town);

CREATE INDEX countryIndex ON countries (country_code);

CREATE INDEX loanIndex ON loans (posted_date);

CREATE INDEX languageIndex on loanLanguages (loan_id);

#Interesting queries I used
select loan_id, group_concat(language) AS langList from languageView where loan_id in () group by loan_id;
