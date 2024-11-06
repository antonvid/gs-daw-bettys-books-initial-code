// Create a new router
const express = require("express")
const router = express.Router()
const request = require('request')

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
})

router.get('/about',function(req, res, next){
    res.render('about.ejs')
})

router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
})

router.get('/weather', (req,res) => {
    res.render('weather.ejs')
})

router.post('/weather', (req,res) => {
    let apiKey = 'f83778b7043e654d25042e529b2fa0b9'
    let city = req.body.city
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
                   
    request(url, function (err, response, body) {
        if(err){
            next(err)
        } else {
            console.log(body);
            var weather = JSON.parse(body)
            if(weather!==undefined && weather.main!==undefined){
                var wmsg = 'It is '+ weather.main.temp + 
                ' degrees in '+ weather.name +
                '! <br> The humidity now is: ' + 
                ' <br> Wind: ' + weather.wind.speed
                weather.main.humidity;
                res.send (wmsg);
            }else{
                res.send('No data found')
            }
        } 
    });
})

// Export the router object so index.js can access it
module.exports = router