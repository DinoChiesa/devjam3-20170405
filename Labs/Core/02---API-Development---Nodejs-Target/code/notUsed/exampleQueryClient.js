// server.js
// ------------------------------------------------------------------
//
// Description goes here....
//
// created: Thu Mar 30 16:23:15 2017
// last saved: <2017-March-30 18:32:16>

var pg = require('pg');

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  var query = client
    .query('SELECT table_schema,table_name FROM information_schema.tables;');

  query
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    })
    .on('end', function(result) {
      // fired once and only once, after the last row has been returned
      // and after all 'row' events are emitted in this example, the
      // 'rows' array now contains an ordered set of all the rows which
      // we received from postgres
      console.log(result.rowCount + ' rows were received');
      process.exit(0);
    });
});
