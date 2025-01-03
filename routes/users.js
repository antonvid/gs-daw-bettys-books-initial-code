// Create a new router
const express = require("express")
const bcrypt = require("bcrypt")
const router = express.Router()
const { check, validationResult, checkSchema } = require('express-validator')

const saltRounds = 10

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/register', function(req, res, next) {
    res.render('register.ejs')                                                               
})    

router.post('/registered',
    checkSchema({
        email: { isEmail: true },
        password: { isLength: { options: { min: 8 }}},
        username: { isLength: { options: { min: 4 }}},
        first: { isLength: { options: { min: 1 }}},
        last: { isLength: { options: { min: 1 }}}
    }),
    function(req, res, next) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors)
            res.redirect('./register');
        } else {
            // saving data in database
            const plainPassword = req.body.password
            let sqlquery = "INSERT INTO users (first, last, email, username, password) VALUES (?,?,?,?,?)"
            
            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                // catch error
                if(err) {
                    next(err)
                }
                // Store hashed password in your database.
                let newrecord = [req.sanitize(req.body.first), req.sanitize(req.body.last), req.body.email, req.sanitize(req.body.username), hashedPassword]
                // execute sql query
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        next(err)
                    } else {
                        result = 'Hello '+ req.sanitize(req.body.first) + ' '+ req.sanitize(req.body.last) +' you are now registered!  We will send an email to you at ' + req.sanitize(req.body.email)
                        result += 'Your password is: '+ req.sanitize(req.body.password) +' and your hashed password is: '+ hashedPassword
                        res.send(result)
                    }
                })
            })
        }
})

router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT username FROM users"

    db.query(sqlquery, (err, result) => {
        if(err) {
            next(err)
        }
        res.render("listUsers.ejs", {users:result})
    })
})

router.get('/login', function(req, res, next) {
    res.render('login.ejs')
})
router.post('/login', function(req, res, next) {
    res.render('login.ejs')
})


router.post('/loggedin', function(req, res, next) {
    let sqlquery = "SELECT password FROM users WHERE username='"+req.body.username+"';"
    
    db.query(sqlquery, (err, result) => {
        if(err){
            next(err)
        } else {
            try {
                hashedPassword = result[0].password
            } catch (error) {
                res.send("incorrect username")
            }
            bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                if (err) {
                    next(err)
                }
                else if (result == true) {
                    res.send("login successful")
                }
                else {
                    res.send("incorrect password")
                }
            })
        }
    })
    // Save user session here, when login is successful
    req.session.userId = req.body.username;
})

// Export the router object so index.js can access it
module.exports = router