let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis();

/*
    The List Key
    "list:<username>:<listname>" is a list used for storing list items.     
*/

// Create a brand new checklist. 
router.post('/create', async (req, res) => {
    let created = await redis.hincrby('stats:basic', 'create_checklist', 1);

    let username = req.body.username;
    let listname = req.body.listname;
    let listkey = `list:${username}:${listname}`;
    redis.lpush(listkey, "First Item", function (err, result) {
        res.redirect(`/cl/${username}/${listname}`);
    });
});

// Add a new item to the query-params specified list. 
router.post('/:username/:listname/add', async (req, res) => {
    redis.rpush(`list:${req.params.username}:${req.params.listname}`, "New List Item", function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
    });
});

// Edit an existing item on a query-params specified list. 
router.post('/:username/:listname/edit', async (req, res) => {
    let item_index = req.body.editItem;
    let new_text = req.body.editItemText;
    redis.lset(`list:${req.params.username}:${req.params.listname}`, item_index, new_text, function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
    });
});

// Save the query-params specified list, sort of unnecessary tbh.
router.post('/:username/:listname/save', async (req, res) => {
    res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
});

// Copy the given list to the existing user, or a time-limited temporary fork.
router.post('/fork', async (req, res) => {
    let forked = await redis.hincrby('stats:basic', 'fork_checklist', 1);

    // Use username or tmp name for new list username.
    let fork_name = req.session.username ? req.session.username : "tmp-forks";

    // Find first non-existant new listname.
    let tmp_list_name = req.body.listname;
    let tmp_fork_counter = 0;
    let tmp_list_key = `list:${fork_name}:${tmp_list_name}`;
    let key_taken = await redis.exists(tmp_list_key);
    while (key_taken) {
        tmp_list_key = `list:${fork_name}:${req.body.listname + "-" + tmp_fork_counter}`;
        tmp_list_name = `${req.body.listname + "-" + tmp_fork_counter}`;
        tmp_fork_counter += 1;
        key_taken = await redis.exists(tmp_list_key);
    }

    // Create new key, name and url. 
    let list_key = tmp_list_key;
    let list_name = tmp_list_name;
    let new_url = `/cl/${fork_name}/${list_name}`;

    // Fetch existing list items. 
    let old_list_key = `list:${req.body.username}:${req.body.listname}`;
    let old_items = await redis.lrange(old_list_key, 0, -1);

    // Then push them onto new key. 
    let new_list = await redis.rpush(list_key, old_items);

    // Set EXPIRE if this is a user-less fork. 
    if (!req.session.username) {
        let timer_set = await redis.expire(list_key, (60*60*24*7));
    }

    // Redirect to new URL. 
    res.redirect(new_url);

});

// Export the query-params specified list in the form specified format. 
router.post('/:username/:listname/export', async (req, res) => {
    let exported = await redis.hincrby('stats:basic', 'export_checklist', 1);

    let data_format = req.body.exportFormat;
    // TODO: Export the data in txt format.
    // TODO: Export the data in csv format.
    // TODO: Export the data in pdf format.
    res.send(`This is your data in <strong>.${data_format}</strong> format :D`);
});

// Delete the query-param specified list. 
router.post('/:username/:listname/delete', async (req, res) => {
    let deleted = await redis.hincrby('stats:basic', 'delete_checklist', 1);
    redis.del(`list:${req.params.username}:${req.params.listname}`, function (err, results) {
        res.redirect('/');
    });
});

module.exports = router;