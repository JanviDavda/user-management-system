const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config({path : './.env'});

const app = express();

app.use(cookieParser()); //cookie parser middleware

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

app.use(express.urlencoded({extended: false})); // parse url encoded bodies as sent by html forms
app.use(express.json()); // parsse json body as sent by client API

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.set('view engine', 'hbs');

db.connect( (error) => {
    if(error) {
        console.log(error);
    }else{
        console.log("MySQL Connected");
    }
})

//define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'))

app.listen(5000, ()=> {
    console.log("Server started on port 5000");
});