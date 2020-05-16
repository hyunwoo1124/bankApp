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

    let query = "USE users; INSERT INTO appusers VALUES('" + firstname + "','" + lastname + "','" + username + "','" + password + "','" + address + "');";
    console.log(query);

    mysqlConn.query(query, function(err, qResult){
        if(err) throw err;
    })
    res.sendFile(__dirname + '/login')
});

app.get('/logout', function(req,res){
    req.session.reset();
    res.redirect('/');
});

app.listen(3000);