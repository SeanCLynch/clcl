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
    res.send('login user');
});

// Log user out and redirect to '/'
router.get('/logout', async (req, res) => {
    req.session = null;
    res.redirect('/');
});

module.exports = router;