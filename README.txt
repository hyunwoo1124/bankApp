Authors

	Austin Thornton		austint22@csu.fullerton.edu
	Hyun Woo Kim		hyunwoo777@csu.fullerton.edu 
	Mike Cheng			mikecheng@csu.fullerton.edu
	Jason Eirich			Jeirich@csu.fullerton.edu 

Detailed Description


We utilized xssFilters and prepared statements to protect against xss attacks and sql injection. We followed Rule #1 of xss defence by encoding script tags and input filtering. SQL injection were safely defended by providing prepared statements, disallowing attacker to inject their own attacks.

XSS Defense

	Thoroughly defended against xss attacks in all front-end & back-end  form input requests by applying OWASP Rule #1.

	let username = xssFilters.inHTMLDATA(req.body.username);
	let password = xssFilters.inHTMLDATA(req.body.password);

xssFilters.inHTMLData(req.body.<variable>) provides entity encoding 
	&	&amp;
	<	&lt;
	>	&gt;
	“	&quot;
	‘	&#x27;
	/	&#x2F;

CSP Policy

	Content Security Policy was applied to our back-end to only allow “‘self’” sources provided by:


	app.use(csp({
		directives: {
			defaultSrc: [“‘self’”],
			scriptSrc: [“‘self’”],
			imgSrc: [“‘self’”],
	}}))




SQL Injection Defense

	Thoroughly defended against SQL injection by utilizing prepared statements by:

	mysqlConn.query(‘Use users; SELECT username, password from appusers where `username` = ? AND `password` = ?, [username, password],
	Since the query is provided, the attacker cannot input their own SQL query. 

OWASP Password Recommendations
	Password is required to be at least 8 characters with  combinations of at least 1 lowercase, uppercase, number, special character.
	We added if-statements to check if the conditions for the password were met.


How to execute your program

Steps and Instructions for installing packages
	-Must have node installed
	npm install express
	npm install client-sessions
	npm install body-parser
	npm install xss-filters
	npm install helmet-csp

Steps to communicate and setting up databases
	1)sudo apt-get install mariadb-server
	2)sudo mysql_secure_installation
		(Enter your root privileges)
		(provide new root password)
	3)sudo mysql -u root -p
		(provide root password)
	4)Create a database called “users”
		CREATE DATABASE users;
	5)Create a table “appusers”
		CREATE TABLE appusers ( firstname VARCHAR(255),  lastname VARCHAR(255), username VARCHAR(255), password VARCHAR(255), address VARCHAR(255), accountBalance1 FLOAT(255,2), accountBalance2 FLOAT(255,2), accountBalance3 FLOAT(255,2));
	6)Grant privilege on users “appaccount” with password “apppass”
		GRANT ALL PRIVILEGES ON users. * to ‘appaccount’@’localhost’ IDENTIFIED BY ‘apppass’;
	7)Exit the prompt
		exit
	8)Login from command line as “appaccount” 
		mysql -u appaccount -p
			(password is “apppass”)
	9)How to use database “users”
		USE users;
	10)Display the  “appusers” table
		SELECT * FROM appusers;
	11)The database is connected to the web app by:
		const mysqlConn = mysql.createConnection({
		host: “localhost”,
		user: “appaccount”,
		password: “apppass”,
		multipleStatements: true
		});


Extra Credit

	No extra credit.

Special Information
	-When a new account is created, it will only have one balance account activated, the other accounts can be activated from the "create account" button from the dashboard

	-One of our team members had issues with the application crashing randomly, but the rest of the team did not have this problem.
