let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis();

// Display homepage.
router.get('/', async (req, res) => {
    res.render('home', {
        "user": req.session.username
    });
});

// Display the signup page for new users. 
router.get('/signup', async (req, res) => {
    res.render('signup');
});

// Display login page. 
router.get('/login', async (req, res) => {
    res.render('login');
});

// Fetches a random list from the current db.
router.get('/random', async (req, res) => {
    redis.randomkey(function (err, result) {
        let random_key = result.split(':');
        res.redirect(`/cl/${random_key[0]}/${random_key[1]}/`);
    });
});

// Display query-param specified list. 
router.get('/cl/:username/:listname', async (req, res) => {
    redis.lrange(`${req.params.username}:${req.params.listname}`, 0, -1, function (err, result) {
        if (result.length == 0) {
            res.send("Sorry, no such list exists!");
        } else {
            res.render('list', {
                "user": req.session.username,
                "list": result,
                "username": req.params.username,
                "listname": req.params.listname
            });
        }
        
    });
});

// User's Homepage/Dashboard.
router.get('/u', async (req, res) => {
    if (!req.session.username) res.redirect('/login');
    res.render('dashboard', {
        "user": req.session.username
    });
});

module.exports = router;