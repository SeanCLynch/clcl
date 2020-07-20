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
// TODO: once there are enough lists, add randomization on iterator & such.
router.get('/random', async (req, res) => {
    redis.scan('0', 'match', '*:*', function (err, result) {
        let ran_key = Math.floor(Math.random() * result[1].length);
        let ran_list = result[1][ran_key].split(':');
        res.redirect(`/cl/${ran_list[0]}/${ran_list[1]}/`);
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

    // Redirect if not signed in.
    if (!req.session.username) res.redirect('/login');

    // Assemble list of checklists. 
    redis.keys(`${req.session.username}:*`, function (err, result) {
        console.log(req.session.username, err, result);
        res.render('dashboard', {
            "user": req.session.username
        });
    });
});

module.exports = router;