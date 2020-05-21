'use strict'

const express = require('express');
const sessions = require('client-sessions');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const xssFilters = require('xss-filters');

const csp = require('helmet-csp');
const app = express();


//connect to database
const mysqlConn = mysql.createConnection({
    host: "localhost",
    user: "appaccount",
    password: "apppass",
    multipleStatements: true
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(csp({
    // Specify directives as normal.
    directives: {
      defaultSrc: ["'self'", ],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'"],
    }}))

app.use(sessions({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 3 * 60 * 1000,
    activeDuration: 3 * 60 * 1000,
}));

app.get("/", function(req, res){
    if(req.session.username){
        res.sendFile(__dirname + '/index.html');
    }
    else{
        res.sendFile(__dirname + '/index.html');
    }
});
app.post('/login', function(req,res){
    let username = xssFilters.inHTMLData(req.body.username);
    let password = xssFilters.inHTMLData(req.body.password);

    let query = "USE users; SELECT username, password from appusers where username='" + username + "' AND password='" + password + "'";

    mysqlConn.query('USE users; SELECT username,password from appusers where `username` = ? AND `password` = ?',[username,password],
     function(err,qResult){

        if(err) throw err;
        
        console.log('xss filtered username ' + username);
        let match = false;
        qResult[1].forEach(function(account){
            if(account['username'] == username && account['password'] == password){
                console.log("credentials matched");

                match = true
            }
        });

        if(match){
            req.session.username = username;
            res.sendFile(__dirname + '/dashboard.html');
        }
        else{
            res.send("<b>wrong credentials</b>");
        }

    });
});
app.post('/create', function(req, res){
    let firstname = xssFilters.inHTMLData(req.body.firstname);
    let lastname = xssFilters.inHTMLData(req.body.lastname);
    let username = xssFilters.inHTMLData(req.body.username);
    let password = xssFilters.inHTMLData(req.body.password);
    let passwordCheck = xssFilters.inHTMLData(req.body.passwordCheck);
    let address = xssFilters.inHTMLData(req.body.address);
    let accountBalance1 = 0;
    let accountBalance2 = -5;
    let accountBalance3 = -5;
   
    console.log(password.length);
    if (password != passwordCheck){
        res.sendFile(__dirname + '/index.html');
    }
    else {
        if (password.length > 7)
        {
            console.log("password length check");
            if ((password.match(/[a-z]/) && (password.match(/[A-Z]/))))
            {
                console.log("uppercase & lowercase check");
                if (password.match(/.[,!,@,#,$,%,^,&,*,?,_,~,-,(,)]/) && (password.match(/[0-9]/)))
                {
                    console.log("symbol & number check");
                    let query = "USE users; INSERT INTO appusers VALUES('" + firstname + "','" + lastname + "','" + username + "','" + password + "','" + address + "','" + accountBalance1 + "','" + accountBalance2 + "','" + accountBalance3 + "');";
                    console.log(query);

                        /*
                        'USE users; INSERT INTO appusers VALUES(`firstname` = ?, `lastname` = ?, `username` = ?, `password` = ?, `address` = ?, `accountBalance1` = ?, `accountBalance2` = ?, `accountBalance3`= ?)',
                        [firstname,lastname,username,password,address,accountBalance1,accountBalance2,accountBalance3]
                        */
                        // Inconsistent performances, removed due to random crash.
                        // Protecting the sql query using prepared statements to prevent malicious attacker from injecting their own queries.
                        mysqlConn.query(query,function(err, qResult){
                            if(err) throw err;
                        })
                        res.sendFile(__dirname + '/index.html');
                }
                else
                {
                    console.log("Invalid password no symbols/digits");
                    res.sendFile(__dirname + '/wrongCredentials.html');
                }
            }
            else
            {
                console.log("invalid password no upper/lowercase");
                res.sendFile(__dirname + '/wrongCredentials.html');
            }
        }
        else
        {
            console.log("INVALID PASSWORD");
            res.sendFile(__dirname + '/wrongCredentials.html');
        }
    }
    
});

app.post('/balanceRedirect', function(req,res){
    res.sendFile(__dirname + '/balance.html');
});

app.post('/balance', function(req,res){
    let username = xssFilters.inHTMLData(req.session.username);
    let accountNum = xssFilters.inHTMLData(req.body.accountNum);
    let accountBalance = -5;

    console.log(username);
    let query = "USE users;SELECT accountBalance"+ accountNum +" FROM appusers WHERE username= '" + username +"';";
    mysqlConn.query(query,
     function(err, qResult){
        if(err) throw err;
        else{
        
            let thisAccount = "accountBalance" + accountNum;
            qResult[1].forEach(function(account){
                accountBalance = account[thisAccount];
                if (accountBalance < 0){

                    res.sendFile(__dirname + '/noAccount.html');
                }
                else{

                    // Replace the newlines with HTML <br>

                    let pageStr = "	<!DOCTYPE html>";
                    pageStr += "	<html>";
                    pageStr += "	<head>";
                    pageStr += "		<title>Balance </title>";
                    pageStr += "	</head>";
                    pageStr += "	<body bgcolor=white>";
                    pageStr += "	   <h1>Your current Balance in account " + accountNum + ": " + accountBalance + "</h1><br>";
                    pageStr += "	    <form action='/return' method='post'>";
                    pageStr += "        	    <label for='comment'>Message:</label>";
                    pageStr += "        	    <input type='submit' value='Return' />";
                    pageStr += "	    </form>";
                    pageStr += "	</body>";
                    pageStr += "</html>	";

                    // Send the page
                    res.send(pageStr);
                }
            });
        }

    });
    console.log(req.session.accountBalance);
    


});
app.post('/depositRedirect', function(req,res){
    res.sendFile(__dirname + '/deposit.html');
});
app.post('/deposit', function(req,res){
    console.log("got to deposit");
    let username = xssFilters.inHTMLData(req.session.username);
    let amountAdd = xssFilters.inHTMLData(req.body.deposit);
    let accountNum = xssFilters.inHTMLData(req.body.accountNum);
    let accountBalance = -5;

    console.log("xss filtered username " + username );
    let query1 = "USE users;SELECT accountBalance"+ accountNum +" FROM appusers WHERE username= '" + username +"';";
    mysqlConn.query(query1, function(err, qResult){
        if(err) throw err;
        else{
            let thisAccount = "accountBalance" + accountNum;

            qResult[1].forEach(function(account){
                accountBalance = account[thisAccount];
                if (accountBalance < 0){
                    console.log("got to accountNotReal");

                    res.sendFile(__dirname + '/noAccount.html');
                }
                else{
                    if (amountAdd <= 0){
                        res.sendFile(__dirname + '/noNegNumbers.html');
                    }
                    else{
                        let query2 = "USE users; UPDATE appusers SET accountBalance" + accountNum + " = accountBalance" + accountNum + " + " + amountAdd + " WHERE username = '" + username + "';";

                        mysqlConn.query(query2, function(err, qResult){
                            if(err) throw err;

                        });

                        res.sendFile(__dirname + '/dashboard.html');
                    }
                }
            });
        }

    });
});

app.post('/withdrawRedirect', function(req,res){
    res.sendFile(__dirname + '/withdraw.html');
});
app.post('/withdraw', function(req,res){
    console.log("got to withdraw");
    let username = xssFilters.inHTMLData(req.session.username);
    let amountSub = xssFilters.inHTMLData(req.body.withdraw);
    let accountNum = xssFilters.inHTMLData(req.body.accountNum);
    let accountBalance = -5;

    let query1 = "USE users;SELECT accountBalance"+ accountNum +" FROM appusers WHERE username= '" + username +"';";
    mysqlConn.query(query1, function(err, qResult){
        if(err) throw err;
        else{
            console.log("xss filters for /withdraw");
            console.log("xss filter username: " +username);
            console.log("xss filter amountSub: " +amountSub);
            console.log("xss filter accountNum: " +accountNum);

            let thisAccount = "accountBalance" + accountNum;
            qResult[1].forEach(function(account){
                accountBalance = account[thisAccount];
                if (accountBalance < 0){
                    console.log("got to accountNotReal");

                    res.sendFile(__dirname + '/noAccount.html');
                }
                else{
                    if ((amountSub <= 0) || (amountSub > accountBalance)){
                        res.sendFile(__dirname + '/noNegNumbers.html');
                    }
                    else{
                        let query2 = "USE users; UPDATE appusers SET accountBalance" + accountNum + " = accountBalance" + accountNum + " - " + amountSub + " WHERE username = '" + username + "';";

                        mysqlConn.query(query2, function(err, qResult){
                            if(err) throw err;

                        });

                        res.sendFile(__dirname + '/dashboard.html');
                    }
                }
            });
        }

    });

});

app.post('/createAccountRedirect', function(req,res){
    res.sendFile(__dirname + '/createAccount.html');
});

app.post('/createAccount', function(req,res){
    let username = xssFilters.inHTMLData(req.session.username);
    let accountNum = xssFilters.inHTMLData(req.body.accountNum);
    let accountBalance = -5;
    let accountSetZero = 0;

    console.log(username);
    let query = "USE users;SELECT accountBalance"+ accountNum +" FROM appusers WHERE username= '" + username +"';";
    mysqlConn.query(query, function(err, qResult){
        if(err) throw err;
        else{
            let thisAccount = "accountBalance" + accountNum;
            qResult[1].forEach(function(account){
                accountBalance = account[thisAccount];
                console.log("xss Filtered username: " + username);
                console.log("xss Filtered accountNum: " + accountNum);

                if (accountBalance < 0){
                    let query2 = "USE users; UPDATE appusers SET accountBalance" + accountNum + " = " + accountSetZero + " WHERE username = '" + username + "';";
                    mysqlConn.query(query2, function(err, qResult){
                        if(err) throw err;
                    });
                    let pageStr = "	<!DOCTYPE html>";
                    pageStr += "	<html>";
                    pageStr += "	<head>";
                    pageStr += "		<title>Account Creation </title>";
                    pageStr += "	</head>";
                    pageStr += "	<body bgcolor=white>";
                    pageStr += "	   <h1>Your account " + accountNum + " is now created</h1><br>";
                    pageStr += "	    <form action='/return' method='post'>";
                    pageStr += "        	    <label for='comment'>Return to dashboard:</label>";
                    pageStr += "        	    <input type='submit' value='Return' />";
                    pageStr += "	    </form>";
                    pageStr += "	</body>";
                    pageStr += "</html>	";

                    // Send the page
                    res.send(pageStr);
                }
                else{

                    let pageStr = "	<!DOCTYPE html>";
                    pageStr += "	<html>";
                    pageStr += "	<head>";
                    pageStr += "		<title>Account Creation </title>";
                    pageStr += "	</head>";
                    pageStr += "	<body bgcolor=white>";
                    pageStr += "	   <h1>Your account " + accountNum + " already exists, try another</h1><br>";
                    pageStr += "	    <form action='/return' method='post'>";
                    pageStr += "        	    <label for='comment'>Return to dashboard:</label>";
                    pageStr += "        	    <input type='submit' value='Return' />";
                    pageStr += "	    </form>";
                    pageStr += "	</body>";
                    pageStr += "</html>	";

                    // Send the page
                    res.send(pageStr);
                }
            });
        }
    });
});

app.post('/deleteAccountRedirect', function(req,res){
    res.sendFile(__dirname + '/deleteAccount.html');
});

app.post('/deleteAccount', function(req,res){
    let username = xssFilters.inHTMLData(req.session.username);
    let accountNum = xssFilters.inHTMLData(req.body.accountNum);
    let accountBalance = -5;
    let accountSetNeg = -5;

    console.log(username);
    let query = "USE users;SELECT accountBalance"+ accountNum +" FROM appusers WHERE username= '" + username +"';";
    mysqlConn.query(query, function(err, qResult){
        if(err) throw err;
        else{
            console.log("Check /deleteAccount");
            console.log("xss filtered username " + username);
            console.log("xss filtered accountNum " + accountNum)
            console.log(qResult[1]);
            let thisAccount = "accountBalance" + accountNum;
            qResult[1].forEach(function(account){
                accountBalance = account[thisAccount];
                if (accountBalance >= 0){
                    console.log("got to exists");
                    let query2 = "USE users; UPDATE appusers SET accountBalance" + accountNum + " = " + accountSetNeg + " WHERE username = '" + username + "';";
                    mysqlConn.query(query2, function(err, qResult){
                        if(err) throw err;
                    });
                    let pageStr = "	<!DOCTYPE html>";
                    pageStr += "	<html>";
                    pageStr += "	<head>";
                    pageStr += "		<title>Account Deletion </title>";
                    pageStr += "	</head>";
                    pageStr += "	<body bgcolor=white>";
                    pageStr += "	   <h1>Your account " + accountNum + " is now deleted</h1><br>";
                    pageStr += "	    <form action='/return' method='post'>";
                    pageStr += "        	    <label for='comment'>Return to dashboard:</label>";
                    pageStr += "        	    <input type='submit' value='Return' />";
                    pageStr += "	    </form>";
                    pageStr += "	</body>";
                    pageStr += "</html>	";

                    // Send the page
                    res.send(pageStr);
                }
                else{

                    let pageStr = "	<!DOCTYPE html>";
                    pageStr += "	<html>";
                    pageStr += "	<head>";
                    pageStr += "		<title>Account Deletion </title>";
                    pageStr += "	</head>";
                    pageStr += "	<body bgcolor=white>";
                    pageStr += "	   <h1>Your account " + accountNum + " doesn't exist yet, try another</h1><br>";
                    pageStr += "	    <form action='/return' method='post'>";
                    pageStr += "        	    <label for='comment'>Return to dashboard:</label>";
                    pageStr += "        	    <input type='submit' value='Return' />";
                    pageStr += "	    </form>";
                    pageStr += "	</body>";
                    pageStr += "</html>	";

                    // Send the page
                    res.send(pageStr);
                }
            });
        }
    });
});

app.post('/transferRedirect', function(req,res){
    res.sendFile(__dirname + '/transfer.html');
});
app.post('/transfer', function(req,res){
    let username = xssFilters.inHTMLData(req.session.username);
    let amountTransfer = xssFilters.inHTMLData(req.body.transferAmount);
    let transferAccount1 = xssFilters.inHTMLData(req.body.accountNum1);
    let transferAccount2 = xssFilters.inHTMLData(req.body.accountNum2);
    let accountBalance1 = -5;
    let accountBalance2 = -5;

    if(transferAccount1 == transferAccount2) {
        let pageStr = "	<!DOCTYPE html>";
        pageStr += "	<html>";
        pageStr += "	<head>";
        pageStr += "		<title>Account Goof </title>";
        pageStr += "	</head>";
        pageStr += "	<body bgcolor=white>";
        pageStr += "	   <h1>You cannot use the same account for both! Try again</h1><br>";
        pageStr += "	    <form action='/return' method='post'>";
        pageStr += "        	    <label for='comment'>Return to dashboard:</label>";
        pageStr += "        	    <input type='submit' value='Return' />";
        pageStr += "	    </form>";
        pageStr += "	</body>";
        pageStr += "</html>	";

        // Send the page
        res.send(pageStr);
    }
    else {
        let query1 = "USE users;SELECT accountBalance"+ transferAccount1 +" FROM appusers WHERE username= '" + username +"';";
        mysqlConn.query(query1, function(err, qResult1){
            if(err) throw err;
            else{

                let thisAccount1 = "accountBalance" + transferAccount1;
                qResult1[1].forEach(function(account){
                    accountBalance1 = account[thisAccount1];
                    if (accountBalance1 < 0){
                        console.log("got to accountNotReal");
                        res.sendFile(__dirname + '/noAccount.html');
                    }
                    else{
                        if ((amountTransfer <= 0) || (amountTransfer > accountBalance1)){
                            res.sendFile(__dirname + '/noNegNumbers.html');
                        }
                        else{
                            let query2 = "USE users;SELECT accountBalance"+ transferAccount2 +" FROM appusers WHERE username= '" + username +"';";
                            mysqlConn.query(query2, function(err, qResult2){
                                if(err) throw err;
                                else{
                                    
                                    let thisAccount2 = "accountBalance" + transferAccount2;
                                    qResult2[1].forEach(function(account){
                                        accountBalance2 = account[thisAccount2];
                                        if (accountBalance2 < 0){
                                            console.log("got to accountNotReal");

                                            res.sendFile(__dirname + '/noAccount.html');
                                        }
                                        else{
                                            let query3 = "USE users; UPDATE appusers SET accountBalance" + transferAccount1 + " = accountBalance" + transferAccount1 + " - " + amountTransfer + " WHERE username = '" + username + "';";

                                            let query4 = "USE users; UPDATE appusers SET accountBalance" + transferAccount2 + " = accountBalance" + transferAccount2 + " + " + amountTransfer + " WHERE username = '" + username + "';";

                                            mysqlConn.query(query3, function(err, qResult){
                                                if(err) throw err;

                                            });

                                            mysqlConn.query(query4, function(err, qResult){
                                                if(err) throw err;

                                            });

                                            res.sendFile(__dirname + '/dashboard.html');
                                        }
                                    });
                                }

                            });

                        }
                    }
                });
            }

        });
    }
});

app.post('/return', function(req,res){
    res.sendFile(__dirname + '/dashboard.html');
});

app.get('/logout', function(req,res){
    req.session.reset();
    res.redirect('/');
});



app.listen(3000);