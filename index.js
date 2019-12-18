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
app.get('/', async (req, res) => {
    res.render('home', {
        "user": req.session.username
    });
});

// Display the signup page for new users. 
app.get('/signup', async (req, res) => {
    res.render('signup');
});

// Display login page. 
app.get('/login', async (req, res) => {
    res.render('login');
});

// Fetches a random list from the current db.
app.get('/random', async (req, res) => {
    redis.randomkey(function (err, result) {
        let random_key = result.split(':');
        res.redirect(`/cl/${random_key[0]}/${random_key[1]}/`);
    });
});

// Display query-param specified list. 
app.get('/cl/:username/:listname', async (req, res) => {
    redis.lrange(`${req.params.username}:${req.params.listname}`, 0, -1, function (err, result) {
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
app.get('/u', async (req, res) => {
    if (!req.session.username) res.redirect('/login');
    res.render('dashboard', {
        "user": req.session.username
    });
});



// GET /PING 
// Test route, health checks and such.
app.get('/api/ping', async (req, res) => {
  res.send('Pong!');
});

// Redirect to '/u'
app.post('/api/user/create', async (req, res) => {
    let user_email = req.body.userEmail;
    let user_password = req.body.userPassword;

    // Set cookie. 
    req.session.username = user_email;

    // TODO: Encrypt password & store it. 
    redis.hset(user_email, 'password', user_password, function (err, result) {
        res.redirect('/u');
    });
});

// TODO: Redirect to '/u'
app.post('/api/user/login', async (req, res) => {
    res.send('login user');
});

// Log user out and redirect to '/'
app.get('/api/user/logout', async (req, res) => {
    req.session = null;
    res.redirect('/');
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
