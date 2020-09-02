let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_URL);

// GET /PING 
// Test route, health checks and such.
router.get('/ping', async (req, res) => {
    res.send('Pong!');
});

// GET /BASIC
// Returns basic info about lists, forks, users, page visits.
/*
    create_checklist
    fork_checklist
    export_checklist 
    delete_checklist

    create_user
    login_user
    delete_user

    homepage_visit
    signup_visit
    login_visit
    random_visit
    list_visit
    dashboard_visit
*/
router.get('/basic', async (req, res) => {
    redis.hgetall('stats:basic', function (err, results) {
        res.json(results);
    });
});

// Store feedback/support/bug reports.
router.post('/supportreport', async (req, res) => {
    let guest_email = req.body.guestEmail;
    let guest_message = req.body.guestMsg;

    let ran_int = Math.floor(Math.random() * Math.floor(100));
    let tmp_key = "feedback:" + guest_email.substring(0, 3) + "-" + guest_message.substring(0, 3) + "-" + ran_int;

    redis.hset(tmp_key, "email", guest_email, "message", guest_message, function (err, results) {
        res.send("Thank you for your help!");
    });
});

module.exports = router;