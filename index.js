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
        res.send("Thank you for registerin!");
    });

    parseDB('db.txt');
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

            if(req.body.userName== userName && req.body.password == password){
                credMatch =true;
            }

            console.log(tokenizedData[i]);

        }
        if(credMatch == false){
            
            res.sendFile(__dirname + '/login.html');
        }
    })
});

app.listen(3000);

//yeah lets keep going for now