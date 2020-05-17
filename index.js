'use strict'

const express = require('express');
const sessions = require('client-sessions');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();


//connect to database
const mysqlConn = mysql.createConnection({
    host: "localhost",
    user: "appaccount",
    password: "apppass",
    multipleStatements: true
});

app.use(bodyParser.urlencoded({extended: true}));

app.use(sessions({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

app.get("/", function(req, res){
    if(req.session.username){
        res.sendFile(__dirname + '/index.html');
    }
    else{
        res.sendFile(__dirname + '/index.html')
    }
});
/*
app.get('/index.html', function(req, res){
    if(req.session.username){
        //res.render('dashboard', {username: req.session.username});
        console("Your name: " + req.session.username);
    }
    else{
        res.redirect('/');
    }
});
*/
app.post('/login', function(req,res){
    let username = req.body.username;
    let password = req.body.password;

    let query = "USE users; SELECT username, password from appusers where username='" + username + "' AND password='" + password + "'";
    console.log(query);

    mysqlConn.query(query, function(err,qResult){

        if(err) throw err;
        console.log("1. Check");
        console.log(qResult[0]);
        console.log(qResult[1]);

        let match = false;
        qResult[1].forEach(function(account){
            if(account['username'] == username && account['password'] == password){
                console.log("credentials matched");

                match = true
            }
        });

        if(match){
            req.session.username = username;
            console.log(username);
            //res.redirect('/dashboard');
            res.sendFile(__dirname + '/dashboard.html');
        }
        else{
            res.send("<b>wrong credentials</b>");
        }

    });
});

app.post('/create', function(req, res){
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let password = req.body.password;
    let address = req.body.address;
    let accountBalance = 0;

    let query = "USE users; INSERT INTO appusers VALUES('" + firstname + "','" + lastname + "','" + username + "','" + password + "','" + address + "','" + accountBalance + "');";
    console.log(query);

    mysqlConn.query(query, function(err, qResult){
        if(err) throw err;
    })
    res.sendFile(__dirname + '/index.html')
});
function replaceAll(src, search, replacement) {
    
    return src.replace(new RegExp(search, 'g'), replacement);
};

app.post('/balance', function(req,res){
    //let username = req.body.username;
    //let password = req.body.password;
    //let  accountBalance = 0;

    //let query = "USE users; SELECT username, password, accountBalance from appusers where username='" + username + "' AND password='" + password + "' AND accountBalance='" + accountBalance +"');";
    console.log(req.session.username);

    let username = req.session.username;
    let accountBalance;

    console.log(username);
    let query = "USE users;SELECT accountBalance FROM appusers WHERE username= '" + username +"';";
    console.log("pay attention here");
    console.log(query);
    console.log(accountBalance);
    console.log(req.session.accountBalance);
    mysqlConn.query(query, function(err, qResult){
        if(err) throw err;
        else{
        console.log("1. Check");
        console.log(qResult[1]);
        qResult[1].forEach(function(account){
            accountBalance = account['accountBalance'];
            //console.log(accountBalance);
            req.session.accountBalance = accountBalance;
            let commentsData = "";

            // Replace the newlines with HTML <br>
            commentsData = replaceAll(commentsData, "\n", "<br>");
            
            let pageStr = "	<!DOCTYPE html>";
            pageStr += "	<html>";
            pageStr += "	<head>";
            pageStr += "		<title>Balance </title>";
            pageStr += "	</head>";
            pageStr += "	<body bgcolor=white>";
            pageStr += "	   <h1>Your current Balance: " + accountBalance + "</h1><br>";
            pageStr += commentsData;
            pageStr += "	    <form action='/return' method='post'>";
            pageStr += "        	    <label for='comment'>Message:</label>"; 
            pageStr += "        	    <input type='submit' value='Return' />";
            pageStr += "	    </form>";
            pageStr += "	</body>";
            pageStr += "</html>	";
                
            // Send the page
            res.send(pageStr);	
        });
        }
        
    });
    console.log(req.session.accountBalance);
    //res.sendFile(__dirname + '/dashboard.html')
    //console.log(accountBalance);
    

});
app.post('/depositRedirect', function(req,res){
    res.sendFile(__dirname + '/deposit.html');
});
app.post('/deposit', function(req,res){
    console.log("got to deposite");
    let username = req.session.username;
    console.log(username);
    let amountAdd = req.body.deposit;
    if (amountAdd < 0){
        res.sendFile(__dirname + '/deposit.html');
    }
    else{
        let query = "USE users; UPDATE appusers SET accountBalance = accountBalance + " + amountAdd + " WHERE username = '" + username + "';";

        mysqlConn.query(query, function(err, qResult){
            if(err) throw err;
        
        });

       res.sendFile(__dirname + '/dashboard.html');
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
