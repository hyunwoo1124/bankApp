'use strict'

// Import express
const  express = require('express');

// Import client sessions
const sessions = require('client-sessions');

// The body parser
const bodyParser = require("body-parser");

// Instantiate an express app
const app = express();

// Set the view engine
app.set('view engine', 'ejs');



// Needed to parse the request body
// Note that in version 4 of express, express.bodyParser() was
// deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true }));

// The session settings middleware
app.use(sessions({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 3* 60 * 1000,
}));

// The default page
// @param req - the request
// @param res - the response
app.get("/", function(req, res){
    // if the user is logged in
    if(req.session.username)
    {
        res.redirect('/dashboard')
    }
    else
    {
        res.render('login')
    }


});

// The login page
// @param req - the request
// @param res - the response
app.get('/dashboard', function(req, res){



});

// The login script
// @param req - the request
// @param res - the response
app.post('/login', function(req, res) {
    let userName = req.body.username;
    let password = req.body.password;

    // this all depends on the database we use
    //let query = "WHERE `username`=? AND `password`=?";

    if(match)
    {
        res.redirect('/dashboard')
    }


});

// The logout function
// @param req - the request
// @param res - the response
app.get('/logout', function(req, res){

    // Kill the session
    req.session.reset();

    res.redirect('/');
});

app.listen(3000);


