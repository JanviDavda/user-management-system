const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = (req, res) => {
    const {name, email, password, passwordConfirm} = req.body; //object destructuring
    
    db.query('SELECT email FROM users where email = ?', [email], async(error, results) => {
        if(error){
            console.log(error);
        }else if(results.length > 0){
            return res.render('register', {
                message: 'That Email is already in use.'
            })
        }else if ( password !== passwordConfirm){
            return res.render('register', {
                message: 'Passwords do not match.'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) => {
            if(error){
                console.log(error);
            } else {
                res.render('register', {
                    message : 'User Registered Successfully!'
                });
            }
        });
    });
}

exports.login = async(req, res) => {
    const {email, password} = req.body; //object destructuring

    db.query('Select * FROM users where email = ?',[email], (error, results) => {
        if(error){
            console.log(error);
        } else if ( results.length == 0){
            return res.render('login', {
                message: 'Enter correct credentials.'
            });
        }

        bcrypt.compare(password, results[0]['password'], (bcryptErr, bcryptRes) => {
            if(bcryptErr){
                return res.render('../views/login', {
                    message: 'Provide correct credentials.'
                });
            } else if(bcryptRes){
                const token = jwt.sign({id: results[0]['id']}, JWT_SECRET, {expiresIn: '1h'});
                
                res.cookie('jwt', token, {
                    httpOnly: true,
                });
                res.redirect('/dashboard');
            } else {
                return res.render('../views/login', {
                    message: 'Provide correct credentials.'
                });
            }
        });
    });
}

exports.logout = (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/login");
}
