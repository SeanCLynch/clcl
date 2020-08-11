let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis();

let bcrypt = require('bcryptjs');

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

    // Check if username or email already exists. 
    let name_key = `users:${user_name}`;
    let name_key_check = await redis.exists(name_key);
    if (name_key_check) {
        res.render('signup', {
            'flashMsg': 'Username already taken, sorry!'
        });
        return;
    }

    let auth_key = `auth:${user_email}`;
    let auth_key_check = await redis.exists(auth_key);
    if (auth_key_check) {
        res.render('signup', {
            'flashMsg': 'Email already in use, sorry!'
        });
        return;
    }
    
    // Set cookie. 
    req.session.username = user_name;
    req.session.useremail = user_email;

    // Encrypt password.
    let bcrypt_salt = await bcrypt.genSalt(10);
    let bcrypt_hashed_pw = await bcrypt.hash(user_password, bcrypt_salt)
    
    redis.hset(name_key, 'email', user_email, function (err, result) {
        redis.hset(auth_key, 'password', bcrypt_hashed_pw, 'namekey', name_key, function (err2, result2) {
            res.redirect(`/u/${user_name}`);
        });
    });
});

// Delete user account and redirect to landing page. 
router.post('/delete', async (req, res) => {
    let user_name = req.body.userName;
    let user_email = req.body.userEmail;

    let name_key = `users:${user_name}`;
    let auth_key = `auth:${user_email}`;

    // Delete all of user's checklists.
    let match_string = `list:${user_name}:*`;
    redis.scan('0', 'match', match_string, function (err, result) {
        result[1].forEach(function (val, idx) {
            redis.del(val);
        });
    });

    // Delete user's auth and name keys. 
    redis.del(name_key);
    redis.del(auth_key);

    req.session = null;
    res.redirect('/');
});

// Logs in user, setting cookie or providing feedback. 
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

        // Decrypt password
        bcrypt.compare(user_password, result, function (err, pw_check) {
            if (err) {
                res.render('login', {
                    "flashMsg": "Login error!"
                });
                return;
            } else if (pw_check) {
                redis.hget(auth_key, 'namekey', function (err, result) {

                    // Set cookie.
                    let user_name = result.split(':')[1];
                    req.session.username = user_name;
                    req.session.useremail = user_email;
                    res.redirect(`/u/${user_name}`); 
                    return;
                    
                });
            } else {
                res.render('login', {
                    "flashMsg": "Bad password!"
                });
                return;
            }
        });
    });
});

// Log user out and redirect to '/'
router.get('/logout', async (req, res) => {
    req.session = null;
    res.redirect('/');
});

module.exports = router;