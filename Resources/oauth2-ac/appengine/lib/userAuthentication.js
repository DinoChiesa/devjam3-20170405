// userAuthentication.js
// ------------------------------------------------------------------
//
// A toy module to do user authentication.
//
// created: Wed Jun 15 14:13:56 2016
// last saved: <2022-February-22 20:31:57>
/* jshint esversion:9, node:true */

let localUserDb;

function joinPathElements() {
  let re1 = new RegExp('^\\/|\\/$', 'g'),
      elts = Array.prototype.slice.call(arguments);
  return '/' + elts.map(function(element){
    if ( ! element) {return '';}
    return element.replace(re1,""); }).join('/');
}

function loadLocalUserDb(filename) {
  localUserDb = require(joinPathElements(__dirname, filename));
  if ( ! localUserDb) {
    throw new Error("localUserDb cannot be loaded.");
  }
}

function config(config) {

  // Read the usernames + passwords "user database" that is passed in, in config.
  // This allows the "stored" credentials to be dynamically specified at init time.

  if ( !config.localUserDb) {
    throw new Error("there is no localUserDb configured.");
  }

  loadLocalUserDb(config.localUserDb);
}

function authn(ctx) {
  console.log('Authenticate against localDB');
  if ( !ctx.credentials.username || !ctx.credentials.password) {
    ctx.userInfo = null;
    return ctx;
  }
  if ( !localUserDb) {
    throw new Error("localUserDb is null.");
  }

  console.log('Authenticate %s against localDB', ctx.credentials.username);
  var storedRecord = localUserDb[ctx.credentials.username];
  if (storedRecord && storedRecord.hash) {
    // user has been found
    if (storedRecord.hash == ctx.credentials.password) {
      console.log('password match');
      var copy = {...storedRecord};
      delete(copy.hash);
      copy.email = ctx.credentials.username;
      ctx.loginStatus = 200;
      ctx.userInfo = copy;
    }
    else {
      console.log('password no match');
    }
  }
  else {
    console.log('No user by that name');
    ctx.loginStatus = 401;
  }
  return ctx;
}

function list() {
  if ( !localUserDb) {
    throw new Error("localUserDb is null.");
  }

  return Object.keys(localUserDb)
    .map(key => ({
      user: key,
      password: localUserDb[key].hash
    }));
}


module.exports = {
  config,
  authn,
  list
};
