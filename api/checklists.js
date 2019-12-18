let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis();

// Add a new item to the query-params specified list. 
router.post('/:username/:listname/add', async (req, res) => {
    redis.rpush(`${req.params.username}:${req.params.listname}`, "New List Item", function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
    });
});

// Edit an existing item on a query-params specified list. 
router.post('/:username/:listname/edit', async (req, res) => {
    let item_index = req.body.editItem;
    let new_text = req.body.editItemText;
    redis.lset(`${req.params.username}:${req.params.listname}`, item_index, new_text, function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
    });
});

// Save the query-params specified list, sort of unnecessary tbh.
router.post('/:username/:listname/save', async (req, res) => {
    res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
});

// TODO: Redirect to '/:username/:listname' once we have user-accounts.
router.post('/fork', async (req, res) => {
    res.send('fork list');
});

// Export the query-params specified list in the form specified format. 
router.post('/:username/:listname/export', async (req, res) => {
    let data_format = req.body.exportFormat;
    // TODO: Export the data in txt format.
    // TODO: Export the data in csv format.
    // TODO: Export the data in pdf format.
    res.send(`This is your data in <strong>.${data_format}</strong> format :D`);
});

// Delete the query-param specified list. 
router.post('/:username/:listname/delete', async (req, res) => {
    redis.del(`${req.params.username}:${req.params.listname}`, function (err, results) {
        res.redirect('/');
    });
});

module.exports = router;