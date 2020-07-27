let app = require('./index.js');
const port      = process.env.API_PORT;

// Start webserver ---------------------------------------------------------------------------------

let server = app.listen(port, () => console.log(`Listening on ${port}!`));

module.exports = server;