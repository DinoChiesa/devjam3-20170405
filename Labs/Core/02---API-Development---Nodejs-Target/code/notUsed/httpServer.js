// exampleServer.js
// ------------------------------------------------------------------
//
// Description goes here....
//
// created: Thu Mar 30 16:34:17 2017
// last saved: <2017-March-30 16:48:21>

var http = require('http');
var Pool = require('pg').Pool;
const url = require('url');
var databaseUrl = process.env.DATABASE_URL;

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

var server = http.createServer(function(req, res) {

      var onError = function(e) {
            console.log(e.message, e.stack)
            res.writeHead(500, {'content-type': 'application/json'});
            res.end(JSON.stringify({error: e.message}, null, 2) + '\n');
          };

      pool.query('INSERT INTO visit (date) VALUES ($1)', [new Date()], function(err) {
        if (err) return onError(err);

        // get the total number of visits today (including the current visit)
        pool.query('SELECT COUNT(date) AS count FROM visit', function(e, result) {
          if(e) return onError(e);
          res.writeHead(200, {'content-type': 'application/json'});
          res.end(JSON.stringify({
            visitor: result.rows[0].count,
            stamp: (new Date()).valueOf()
          }, null, 2) + '\n');
        });
      });

    });

pool
  .query('CREATE TABLE IF NOT EXISTS visit (date timestamptz)')
  .then(function() {
    server.listen(3001, function() {
      console.log('server is listening on 3001')
    })
  })
