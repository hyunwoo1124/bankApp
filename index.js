'use strict'

const express = require('express');
const fs = require('fs');

const bodyParser = require("body-parser");
const app = express();


app.use(bodyParser.urlencoded({extended: true}));

function parseDB(dbFile){
    fs.readFile(dbFile, 'utf8', function(error,data){
        console.log(data);
        data.split(';');
    })
}

app.get("/", function(req,res){
    
    fs.readFile("db.txt","utf8", function(error, data){

        console.log(data);

        let tokenizedData= data.split("\n");
        console.log(tokenizedData);
        
        // some html here
        res.sendFile(__dirname+ '/index.html');  

        
    })
});
//when the user dont have an account and need to create one
app.post("/create", function(req, res){
    console.log(req.body);
    fs.appendFile("db.txt", req.body.username + ";" + req.body.password + "\n", function(err){
    });
    
    fs.appendFile("info.txt", req.body.lname + ";" + req.body.fname + ";" + req.body.address + "\n", function(err){
        res.send("Thank you for registering!");
    });
    
    parseDB('db.txt');
    parseDB('info.txt');
});


//when you already have an account
app.post("/login", function(req, res){
    console.log("User attempting to login");

    fs.readFile("db.txt","utf8", function(error,data){
        console.log("printing out users" + data);

        // res.sendFile(__dirname + '/dashboard.html');

        let tokenizedData = data.split("\n");
        console.log(tokenizedData);

        let credMatch = false;

        for(let i = 0; i < tokenizedData.length; i++){
            let userName = tokenizedData[i].split(";")[0];
            let password = tokenizedData[i].split(";")[1];

            if((req.body.username == userName) && (req.body.password == password)){
                credMatch = true;

            }


        }
       
        if(credMatch == false){
            console.log("Sorry didnt work");
            res.sendFile(__dirname + '/wrong.html');

        }


        res.sendFile(__dirname+ '/dashboard.html');  

    })
});



app.post("/balance", function(req, res){
    
});




app.post("/deposit", function(req,res){
    console.log("Got data: " + req.body.deposit)
   // console.log("Deposit amount: " + req.body.depositAmount)

    
    res.sendFile(__dirname + '/deposit.html');
});

app.post("/depositMath", function(req, res){

    console.log("Deposit amount: " + req.body.depositAmount);
    let depositAmount = req.body.depositAmount;
    
    res.sendFile(__dirname + '/dashboard.html');
});
app.listen(3000);

//yeah lets keep going for now