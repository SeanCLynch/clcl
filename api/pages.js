let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_URL);

// Display homepage.
router.get('/', async (req, res) => {
    let visited = await redis.hincrby('stats:basic', 'homepage_visit', 1);

    let basic_stats = await redis.hmget('stats:basic', 'create_checklist', 'fork_checklist', 'create_user');
    basic_stats = basic_stats.map((val) => { return !val ? 1 : val });

    res.render('home', {
        "user": req.session.username,
        "stats": basic_stats
    });
});

// Display the signup page for new users. 
router.get('/signup', async (req, res) => {
    let visited = await redis.hincrby('stats:basic', 'signup_visit', 1);

    // Redirect if logged in.
    if (req.session.username) return res.redirect(`/u/${req.session.username}`);

    res.render('signup');
});

// Display login page. 
router.get('/login', async (req, res) => {
    let visited = await redis.hincrby('stats:basic', 'login_visit', 1);

    // Redirect if logged in.
    if (req.session.username) return res.redirect(`/u/${req.session.username}`);
    
    res.render('login');
});

// Fetches a random list from the current db.
router.get('/random', async (req, res) => {
    let visited = await redis.hincrby('stats:basic', 'random_visit', 1);

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
    let visited = await redis.hincrby('stats:basic', 'list_visit', 1);

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
router.get('/u/:username', async (req, res) => {
    let visited = await redis.hincrby('stats:basic', 'dashboard_visit', 1);

    let is_users_dashboard = req.session.username == req.params.username;

    let match_string = `list:${req.params.username}:*`;
    let all_lists = [];
    let full_search = async function (iter) {
        redis.scan(iter, 'match', match_string, function (err, result) {
            if (result[0] == '0') {
                // reached end, add and return. 
                all_lists = all_lists.concat(result[1]);
                res.render('dashboard', {
                    "user": req.session.username,
                    "account": req.params.username,
                    "is_users_dashboard": is_users_dashboard,
                    "lists": all_lists
                });
            } else {
                // add results and iterate again
                all_lists = all_lists.concat(result[1]);
                full_search(result[0]);
            }
        });
    }

    full_search('0');

});

module.exports = router;