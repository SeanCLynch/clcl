require('dotenv').config();
const express   = require('express');
const app       = express();

// Logging Config ----------------------------------------------------------------------------------

const morgan = require('morgan');
if (process.env.NODE_ENV != "test") {
  app.use(morgan(':status :method :url - :response-time ms'));
}

// View Config -------------------------------------------------------------------------------------

const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers: {
    listLink: function (str) { return `/cl/${str.substring(5).replace(':', '/')}`; },
    listTitle: function (str) { return str.split(':')[2]; },
    userOwnsList: function (user, list_username) { if (list_username == 'tmp-forks') {return true;} else {return user == list_username;} }
  }
}));
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
let redis = new Redis(process.env.REDIS_URL);


// Session Config ----------------------------------------------------------------------------------

let cookieSession = require('cookie-session');
app.use(cookieSession({
  "name": "checklistingSession",
  "secret": "checkmate"
}));

// Webpage Routes ----------------------------------------------------------------------------------

let pages_controller = require('./api/pages.js');
app.use('/', pages_controller);

// API Routes --------------------------------------------------------------------------------------

let stats_controller = require('./api/stats.js');
app.use('/api/stats/', stats_controller);

let users_controller = require('./api/users.js');
app.use('/api/user/', users_controller);

let checklists_controller = require('./api/checklists.js');
app.use('/api/list/', checklists_controller);

// 404 & 500 Routes --------------------------------------------------------------------------------

app.use(function (req, res) {
  res.status(404).send("404: Page not found!");
});

app.use(function (err, req, res) {
  res.status(500).send("500: Something Broke!");
});

module.exports = app;
