let express = require('express');
let router = express.Router();

// GET /PING 
// Test route, health checks and such.
router.get('/ping', async (req, res) => {
    res.send('Pong!');
});

module.exports = router;