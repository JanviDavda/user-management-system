const jsonwebtoken = require('jsonwebtoken');

exports.checkToken = (req, res, next) => {
    // Retrieve the token from the local storage
    var decoded;
    console.log("decoded",req.cookies.jwt);
    try{
        decoded = jsonwebtoken.verify(req.cookies.jwt, process.env.JWT_SECRET);
    } catch(error){
        console.log(error);
    }
    if (decoded?.['id'])
    {
        next();
    }
    else
    {
        res.redirect('/login');
    }
}