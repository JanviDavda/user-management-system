const express= require('express');
const { checkToken } = require('../middleware/auth');
const multer = require('multer');
const mysql = require('mysql');
const jsonwebtoken = require('jsonwebtoken');
const sharp = require('sharp');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const storage = multer.diskStorage({
    destination: './public/images', 
    filename: (req, file, cb) => {
      //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // Set the filename to a unique name to avoid overwriting
      const filename = file.originalname;
      cb(null, filename);
    },
});
  
const upload = multer({ storage });

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/dashboard', checkToken, (req, res) => {
    res.render('dashboard');
});

router.post('/dashboard', upload.single('image'), (req, res) => {
    if (!req.file) {
      res.status(400).send('No image file selected');
      return;
    }


    var decoded;
    console.log("decoded",req.cookies.jwt);
    try{
        decoded = jsonwebtoken.verify(req.cookies.jwt, process.env.JWT_SECRET);
    } catch(error){
        console.log(error);
    }
    const id = decoded?.['id'];
    // Save the uploaded file information to the database
    const image = {
      image: req.file.originalname
    };
    const sql = 'UPDATE users SET ? WHERE id = ?';
    db.query(sql, [image, id], (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      } else {
        res.render('../views/dashboard',{
            message: "Image Uploaded Successfully!!!",
            uploaded : true
        });
      }
    });
});  

router.get('/updatedImage', upload.single('image'), (req, res) => {
    try{
        decoded = jsonwebtoken.verify(req.cookies.jwt, process.env.JWT_SECRET);
    } catch(error){
        console.log(error);
    }
    const id = decoded?.['id'];
    const sql = 'SELECT image FROM users WHERE id = ?';
    db.query(sql, [id], (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      } else {
        let image
        const imageName = result[0].image;

        console.log("imageName", imageName);
        console.log(process.env.UPLOADS_FOLDER_PATH + `/${imageName}`);
        sharp(process.env.UPLOADS_FOLDER_PATH + `/${imageName}`)
            .resize(100)
            .toBuffer()
            .then(data => {
                image = data.toString('base64');;
                console.log(image);
                res.render('dashboard', {
                    updatedImage: image
                });
            })
            .catch(error => {
                console.error(error);
                res.status(500).send('Internal Server Error');
            });
        }
    });
});  

module.exports = router;