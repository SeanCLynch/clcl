let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis();

// Redirect to '/u'
router.post('/create', async (req, res) => {
    let user_email = req.body.userEmail;
    let user_password = req.body.userPassword;

    // Set cookie. 
    req.session.username = user_email;

    // TODO: Encrypt password & store it. 
    redis.hset(user_email, 'password', user_password, function (err, result) {
        res.redirect('/u');
    });
});

// TODO: Redirect to '/u'
router.post('/login', async (req, res) => {
    let user_email = req.body.userEmail;
    let user_password = req.body.userPassword;

    redis.hget(user_email, 'password', function (err, result) {

        if (!result) { 
            res.render('login', {
                "flashMsg": "No such user exists!"
            });
            return;
        } 

        if (result === user_password) { 

            // Set cookie.
            req.session.username = user_email;
            res.redirect('/u'); 
            return;

        } else {
            res.render('login', {
                "flashMsg": "Bad password!"
            });
            return;
        }
        
    });
});

// Log user out and redirect to '/'
router.get('/logout', async (req, res) => {
    req.session = null;
    res.redirect('/');
});

module.exports = router;