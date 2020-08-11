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

module.exports = router;