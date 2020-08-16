let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_URL);

let fs = require('fs');
let path = require('path');
const { Stream } = require('stream');

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

// Save the query-params specified list, sort of unnecessary since list is saved after any changes.
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
router.get('/:username/:listname/export', async (req, res) => {
    let exported = await redis.hincrby('stats:basic', 'export_checklist', 1);

    // Fetch target list items. 
    let target_list_key = `list:${req.params.username}:${req.params.listname}`;
    let target_list_items = await redis.lrange(target_list_key, 0, -1);

    // Create new file name for exported data.
    let data_format = req.query.exportFormat;
    let file_name = `./public/${data_format}/${req.params.username}-${req.params.listname}.${data_format}`;
    let file_location = path.join(__dirname, '../', file_name);

    // Delete the file if it exists. Should probably save versioned history. 
    fs.unlink(file_name, (err) => {
        if (err) console.error(err);
    });

    switch (data_format) {
        case "txt":

            // Write list as stream to preserve ordering.
            let txtStream = fs.createWriteStream(file_name, {flags: 'a'});
            target_list_items.forEach((val, idx) => {
                txtStream.write(`${val}\n`);
            });
            txtStream.end();
                
            // Redirect to download route. 
            res.redirect(`/api/list/download?fileName=${encodeURI(file_name)}`);
            break;
    
        case "csv":

            // Write list as stream to preserve ordering.
            let csvStream = fs.createWriteStream(file_name, {flags: 'a'});
            target_list_items.forEach((val, idx) => {
                csvStream.write(`${val}\n`);
            });
            csvStream.end();

            // Redirect to download route. 
            res.redirect(`/api/list/download?fileName=${encodeURI(file_name)}`);
            break;

        case "pdf":

            // Best bet is to create a .tex document (https://tex.stackexchange.com/questions/58752/how-do-i-generate-a-check-list).
            // Then to convert that to a pdf (somehow).
            // Then redirect to /download
            res.send(`This is your data in <strong>.${data_format}</strong> format :D`);

            break;

        default:
            res.send(`This is your data in <strong>.${data_format}</strong> format :D`);
            break;
    }

});

router.get('/download', async (req, res) => {
    let file_name = req.query.fileName;
    res.download(file_name, "test123", (err) => {
        if (err) console.error(err);
    });
})

// Delete the query-param specified list. 
router.post('/:username/:listname/delete', async (req, res) => {
    let deleted = await redis.hincrby('stats:basic', 'delete_checklist', 1);
    redis.del(`list:${req.params.username}:${req.params.listname}`, function (err, results) {
        res.redirect('/');
    });
});

module.exports = router;