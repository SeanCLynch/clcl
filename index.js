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

// TODO: Display Homepage
app.get('/', async (req, res) => {
    res.render('home', {
        "user": req.session.user
    });
});

// TODO: Display Signup Page
app.get('/signup', async (req, res) => {
    res.send('Signup Page');
});

// TODO: Display Login Page
app.get('/login', async (req, res) => {
    res.send('Login Page');
});

// TODO: Display List
app.get('/cl/:username/:listname', async (req, res) => {
    redis.lrange(`${req.params.username}:${req.params.listname}`, 0, -1, function (err, result) {
        res.render('list', {
            "user": req.session.user,
            "list": result,
            "username": req.params.username,
            "listname": req.params.listname
        });
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

// TODO: Redirect to '/:username/:listname'
app.post('/api/list/add', async (req, res) => {
    res.send('add item to list');
});

// TODO: Redirect to '/:username/:listname'
app.post('/api/list/save', async (req, res) => {
    res.send('save list');
});

// TODO: Redirect to '/:username/:listname'
app.post('/api/list/fork', async (req, res) => {
    res.send('fork list');
});

// TODO: Redirect to '/:username/:listname'
app.post('/api/list/export', async (req, res) => {
    res.send('export list');
});

// TODO: Redirect to '/'
app.post('/api/list/delete', async (req, res) => {
    res.send('delete list');
});

// Start webserver ---------------------------------------------------------------------------------

app.listen(port, () => console.log(`Listening on ${port}!`));

module.exports = app;
