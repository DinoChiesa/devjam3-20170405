// exampleServer.js
// ------------------------------------------------------------------
//
// Description goes here....
//
// created: Thu Mar 30 16:34:17 2017
// last saved: <2017-March-30 17:03:45>

var app = require('express')();
//var bodyParser = require('body-parser');
var Pool = require('pg').Pool;
const url = require('url');
var databaseUrl = process.env.DATABASE_URL;
var serverPort = process.env.PORT || 5950;

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

app.get('/status', function(request, response) {
  queryVisitors(response, 'visitorCount');
});

app.post('/visit', function(request, response) {
  pool.query('INSERT INTO visit (date) VALUES ($1)', [new Date()], function(e) {
    if (e) return onError(e, response);
    queryVisitors(response, 'yourVisitorNumber');
  });
});

// default behavior
app.all(/^\/.*/, function(request, response) {
  response.header('Content-Type', 'application/json')
    .status(404)
    .send('{ "message" : "This is not the server you\'re looking for." }\n');
});

function queryVisitors(response, tag) {
  // get the total number of visits today (including the current visit)
  pool.query('SELECT COUNT(date) AS count FROM visit', function(e, result) {
    if(e) return onError(e, response);
    var r = {
        stamp: (new Date()).valueOf()          
        };
    r[tag || 'visitor'] = result.rows[0].count;
    response.header('content-type', 'application/json')
      .status(200)
      .send(JSON.stringify(r, null, 2) + '\n');
  });
}

function onError(e, response) {
  console.log(e.message, e.stack);
  response.header('content-type', 'application/json')
    .status(500)
    .send(JSON.stringify({error: e.message}, null, 2) + '\n');
}

const params = url.parse(databaseUrl);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true
};

process.on('unhandledRejection', function(e) {
  console.log(e.message, e.stack)
})

// create the pool somewhere globally so its lifetime
// lasts for as long as the app is running.
var pool = new Pool(config)

pool
  .query('CREATE TABLE IF NOT EXISTS visit (date timestamptz)')
  .then(function() {
    app.listen(serverPort, function() { 
      console.log('server is listening on %d', serverPort)
    });
  });
