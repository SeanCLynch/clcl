require('dotenv').config();
const express   = require('express');
const app       = express();
const port      = process.env.API_PORT;

// Logging Config ----------------------------------------------------------------------------------

const morgan = require('morgan');
app.use(morgan(':status :method :url - :response-time ms'));

// View Config -------------------------------------------------------------------------------------

const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

// Request Config ----------------------------------------------------------------------------------

let cors = require('cors');
app.use(cors());

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Database Config ---------------------------------------------------------------------------------

const Redis = require('ioredis');
let redis = new Redis();

// Crypto Config -----------------------------------------------------------------------------------

let bcrypt = require('bcryptjs');

// Session Config ----------------------------------------------------------------------------------

let cookieSession = require('cookie-session');
app.use(cookieSession({
  "name": "checklistingSession",
  "secret": "checkmate"
}));

// Routes ------------------------------------------------------------------------------------------

// let webapp_controller = require('./controllers/webapp.js');
// app.use('/', webapp_controller);

// Display homepage.
// TODO (low): Change nav options based on login status.
app.get('/', async (req, res) => {
    res.render('home', {
        "user": req.session.user
    });
});

// TODO (high): Display Signup Page
app.get('/signup', async (req, res) => {
    res.send('Signup Page');
});

// TODO (high): Display Login Page
app.get('/login', async (req, res) => {
    res.send('Login Page');
});

app.get('/random', async (req, res) => {
    redis.randomkey(function (err, result) {
        let random_key = result.split(':');
        res.redirect(`/cl/${random_key[0]}/${random_key[1]}/`);
    });
});

// Display query-param specified list. 
// TODO (low): Add "list not found" page, maybe just 404?
app.get('/cl/:username/:listname', async (req, res) => {
    redis.lrange(`${req.params.username}:${req.params.listname}`, 0, -1, function (err, result) {
        if (result.length == 0) {
            res.send("Sorry, no such list exists!");
        } else {
            res.render('list', {
                "user": req.session.user,
                "list": result,
                "username": req.params.username,
                "listname": req.params.listname
            });
        }
        
    });
});



// GET /PING 
// Test route, health checks and such.
app.get('/api/ping', async (req, res) => {
  res.send('Pong!');
});

// TODO: Redirect to '/'
app.post('/api/user/create', async (req, res) => {
    res.send('create user');
});

// TODO: Redirect to '/'
app.post('/api/user/login', async (req, res) => {
    res.send('login user');
});

// TODO: Redirect to '/'
app.post('/api/user/logout', async (req, res) => {
    res.send('logout user');
});

// Add a new item to the query-params specified list. 
app.post('/api/list/:username/:listname/add', async (req, res) => {
    redis.rpush(`${req.params.username}:${req.params.listname}`, "New List Item", function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
    });
});

// Edit an existing item on a query-params specified list. 
app.post('/api/list/:username/:listname/edit', async (req, res) => {
    let item_index = req.body.editItem;
    let new_text = req.body.editItemText;
    redis.lset(`${req.params.username}:${req.params.listname}`, item_index, new_text, function (err, result) {
        res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
    });
});

// Save the query-params specified list, sort of unnecessary tbh.
app.post('/api/list/:username/:listname/save', async (req, res) => {
    res.redirect(`/cl/${req.params.username}/${req.params.listname}`);
});

// TODO: Redirect to '/:username/:listname' once we have user-accounts.
app.post('/api/list/fork', async (req, res) => {
    res.send('fork list');
});

// Export the query-params specified list in the form specified format. 
app.post('/api/list/:username/:listname/export', async (req, res) => {
    let data_format = req.body.exportFormat;
    // TODO: Export the data in txt format.
    // TODO: Export the data in csv format.
    // TODO: Export the data in pdf format.
    res.send(`This is your data in <strong>.${data_format}</strong> format :D`);
});

// Delete the query-param specified list. 
app.post('/api/list/:username/:listname/delete', async (req, res) => {
    redis.del(`${req.params.username}:${req.params.listname}`, function (err, results) {
        res.redirect('/');
    });
});

// Start webserver ---------------------------------------------------------------------------------

app.listen(port, () => console.log(`Listening on ${port}!`));

module.exports = app;
