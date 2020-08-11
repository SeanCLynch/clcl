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

    // Redirect if logged in.
    if (req.session.username) return res.redirect(`/u/${req.session.username}`);

    res.render('signup');
});

// Display login page. 
router.get('/login', async (req, res) => {

    // Redirect if logged in.
    if (req.session.username) return res.redirect(`/u/${req.session.username}`);
    
    res.render('login');
});

// Fetches a random list from the current db.
router.get('/random', async (req, res) => {

    let coin_flip = function () {
        return Math.floor(Math.random() * Math.floor(2));
    };

    let random_scan = async function (iter) {
        redis.scan(iter, 'match', 'list:*:*', function (err, result) {
            if (result[0] == '0') {
                // reached end, pick a list
                let ran_key = Math.floor(Math.random() * result[1].length);
                let ran_list = result[1][ran_key].split(':');
                res.redirect(`/cl/${ran_list[1]}/${ran_list[2]}/`);
            } else if (coin_flip() == 1) {
                // pick a list
                let ran_key = Math.floor(Math.random() * result[1].length);
                let ran_list = result[1][ran_key].split(':');
                res.redirect(`/cl/${ran_list[1]}/${ran_list[2]}/`);
            } else {
                // iterate again
                random_scan(result[0]);
            }
        });
    }
    random_scan('0');
});

// Display query-param specified list. 
router.get('/cl/:username/:listname', async (req, res) => {
    redis.lrange(`list:${req.params.username}:${req.params.listname}`, 0, -1, function (err, result) {
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
// TODO: Add iterator and further randomization.
router.get('/u/:username', async (req, res) => {

    let is_users_dashboard = req.session.username == req.params.username;
    
    // Assemble list of checklists. 
    let match_string = `list:${req.params.username}:*`;
    redis.scan('0', 'match', match_string, function (err, result) {
        res.render('dashboard', {
            "user": req.session.username,
            "account": req.params.username,
            "is_users_dashboard": is_users_dashboard,
            "lists": result[1]
        });
    });
});

module.exports = router;