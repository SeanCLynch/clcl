let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis();

/*
    Users are stored in two parts.

    1) The Auth Key
    "auth:<email_address>" is a hash used for authorization (currently only login). 
        * password
        * namekey

    2) The Name Key
    "users:<username>" is a hash used to store misc info about the user.
        * email
        
*/

// Redirect to '/u'
router.post('/create', async (req, res) => {
    let user_name = req.body.userName;
    let user_email = req.body.userEmail;
    let user_password = req.body.userPassword;

    // Set cookie. 
    req.session.username = user_email;

    // TODO: Encrypt password & store it. 
    let name_key = `users:${user_name}`;
    let auth_key = `auth:${user_email}`;
    redis.hset(name_key, 'email', user_email, function (err, result) {
        redis.hset(auth_key, 'password', user_password, 'namekey', name_key, function (err2, result2) {
            res.redirect('/u');
        });
    });
});

// TODO: Unencrypt password.
router.post('/login', async (req, res) => {
    let user_email = req.body.userEmail;
    let auth_key = `auth:${user_email}`;
    let user_password = req.body.userPassword;

    redis.hget(auth_key, 'password', function (err, result) {

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