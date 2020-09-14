let express = require('express');
let router = express.Router();

const Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_URL);

// Used in the creation of txt, csv, pdf exports. 
let fs = require('fs');
let path = require('path');
const { Stream } = require('stream');
const PDFDocument = require('pdfkit');

let validationUtil = require('../lib/keyValidation.js');

/*
    The List Key
    "list:<username>:<listname>" is a list used for storing list items.     
*/

// Create a brand new checklist. 
router.post('/create', async (req, res) => {
    let created = await redis.hincrby('stats:basic', 'create_checklist', 1);

    let username = req.body.username;
    let listname = req.body.listname;

    // Validate listname.
    let list_validation = await validationUtil.validateListname(username, listname);
    if (!list_validation.valid) {
        res.send(list_validation.error);
        // res.render('signup', {
        //     'flashMsg': list_validation.error
        // });
        return;
    }

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

// Remove an existing item from a list.
router.post('/:username/:listname/delete', async (req, res) => {
    let item_text = req.body.deleteItem;

    redis.lrem(`list:${req.params.username}:${req.params.listname}`, 1, item_text, function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
    });
});

// Save the query-params specified list, sort of unnecessary since list is saved after any changes.
router.post('/:username/:listname/save', async (req, res) => {
    res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
});

// Rename the list to a new name. 
router.post('/:username/:listname/rename', async (req, res) => {

    // Validate listname.
    if (req.params.username != "tmp-forks") {
        let list_validation = await validationUtil.validateListname(req.params.username, req.body.listname);
        if (!list_validation.valid) {
            res.send(list_validation.error);
            // res.render('signup', {
            //     'flashMsg': list_validation.error
            // });
            return;
        }
    }

    try {
        let renamed_info = await redis.rename(`list-info:${req.params.username}:${req.params.listname}`, `list-info:${req.params.username}:${req.body.listname}`);
    } catch (err) {
        console.log("Renamed list had no associated list-info.");
    }

    redis.rename(`list:${req.params.username}:${req.params.listname}`, `list:${req.params.username}:${req.body.listname}`, function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.body.listname}`);
    });
});

// Edit the checklist's description.
router.post('/:username/:listname/description', async (req, res) => {

    let new_desc = req.body.listdesc;
    let list_info_key = `list-info:${req.params.username}:${req.params.listname}`;

    redis.hset(list_info_key, 'description', new_desc, function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
    });
});

// Copy the given list to the existing user, or a time-limited temporary fork.
router.post('/fork', async (req, res) => {
    let forked = await redis.hincrby('stats:basic', 'fork_checklist', 1);

    // Use username or tmp name for new list username.
    let fork_name = req.session.username ? req.session.username : "tmp-forks";

    // Find first non-existant new listname.
    // TODO: Create new list name with random nouns. 
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

    // Copy list-info over with list. 
    try {
        let renamed_info = await redis.rename(`list-info:${req.body.username}:${req.body.listname}`, `list-info:${fork_name}:${list_name}`);
    } catch (err) {
        console.log("Forked list had no associated list-info.");
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
    try {
        fs.unlink(file_name, (err) => {
            if (err) console.error(err);
        });
    } catch (error) {
        console.log('No previous file to delete for export.');
    }
    

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

            // Create a document.
            var doc = new PDFDocument();

            // Add the title. 
            doc.fontSize(25).text(req.params.listname, 100, 80);

            // Add the items. 
            let start_y = 120;
            target_list_items.forEach((val) => {
                doc.rect(100, start_y, 10, 10).stroke();
                doc.text(val, 120, start_y - 5);
                start_y = start_y + 30;
            });

            // Write it to the file. 
            doc.pipe(fs.createWriteStream(file_name));
            doc.end();

            // Redirect to download route. 
            res.redirect(`/api/list/download?fileName=${encodeURI(file_name)}`);
            break;

        default:
            res.send(`Please select one of the available data types.`);
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

    // Also delete list-info. 
    let deleted_info = await redis.del(`list-info:${req.params.username}:${req.params.listname}`);

    redis.del(`list:${req.params.username}:${req.params.listname}`, function (err, results) {
        res.redirect('/');
    });
});

module.exports = router;