// login-and-consent.js
// ------------------------------------------------------------------
//
// created: Mon Apr  3 21:02:40 2017
// last saved: <2022-February-22 20:34:39>
//
// ------------------------------------------------------------------
//
// A node app that implements an authentication and consent-granting web
// app. This thing implements what is known in the OAuth docs as the
// Authorization Server. This app uses jade for view rendering, and
// bootstrap CSS in the HTML pages, but those details are irrelevant for
// its main purpose.
//
// Run this with
//     node ./login-and-consent.js
//
// To pop the login page:
// GET https://apiproxy-endpoint.net/PROXYBASEPATH/oauth2/authorize?client_id=VALID_CLIENT_ID_HERE&redirect_uri=http://dinochiesa.github.io/openid-connect/callback-handler.html&response_type=id_token&scope=openid%20profile&nonce=A12345&state=ABCDEFG
//
// ------------------------------------------------------------------
/* jshint esversion:9, node:true */
/* global Buffer process */

const express     = require('express'),
      bodyParser  = require('body-parser'),
      querystring = require('querystring'),
      morgan      = require('morgan'), // a logger
      request     = require('request'),
      path        = require('path'),
      url         = require('url'),
      app         = express(),
      config      = require('./config/config.json'),
      userAuth    = require('./lib/userAuthentication.js');

const ONE_HOUR_IN_MS = 3600 * 1000;

let registeredTenants = {};

userAuth.config(config);

function logError(e) {
  console.log('unhandled error: ' + e);
  console.log(e.stack);
}

const base64Encode = (item) => Buffer.from(item).toString('base64');
const base64Decode = (item) => Buffer.from(item, 'base64').toString('utf-8');
const authenticateUser = (ctx) => userAuth.authn(ctx);

function postAuthFormData(userInfo) {
  var copy = {...userInfo};
  if (userInfo.roles) {
    copy.roles = userInfo.roles.join(',');
  }
  delete copy.status;
  copy.response_type = 'code';
  return copy;
}

function requestAuthCode(ctx) {
  return new Promise( (resolve, reject) => {
    console.log('requestAuthCode, context:' + JSON.stringify(ctx, null, 2));
    let tenant = registeredTenants[ctx.tenant],
        options = {
          uri: tenant.base_uri + '/oauth2-ac/authcode?' + querystring.stringify({ sessionid : ctx.sessionid }),
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
          },
          form : postAuthFormData(ctx.userInfo)
        };

    console.log('requestAuthCode, request options:' + JSON.stringify(options, null, 2));

    request(options, function(error, response, body) {
      if (error) {
        console.log('Error from /authcode: ' + error);
        resolve(ctx);
        return;
      }
      console.log('/authcode response: ' + response.statusCode);
      if (response.statusCode == 302) {
        try {
          ctx.authRedirLoc = response.headers.location;
        }
        catch (exc1) {
          console.log('auth exception: ' + exc1.message);
          console.log(exc1.stack);
          reject(new Error(exc1));
          return;
        }
      }
      else {
        console.log('Non-302 response from /authcode: ' + response.statusCode);
        console.log('auth, statusCode = ' + response.statusCode);
        ctx.authStatusCode = response.statusCode;
        ctx.authResponseBody = (typeof body == 'string') ? JSON.parse(body) : body;
      }
      resolve(ctx);
    });
  });
}

function inquireOauthSessionId(ctx) {
  // send a query to Edge to ask about the oauth session
  return new Promise( (resolve, reject) => {
    let query = { sessionid : ctx.sessionid },
        tenant = registeredTenants[ctx.tenant],
        options = {
          uri: tenant.base_uri + '/oauth2-session/info?' + querystring.stringify(query),
          method: 'GET',
          headers: {
            apikey: config.sessionApi.apikey,
            Accept: 'application/json'
          }
        };

    console.log('inquireOauthSessionId request: ' + JSON.stringify(options, null, 2));

    request(options, (error, response, body) => {
      if (error) {
        console.log('inquireOauthSessionId error: ' + error);
        ctx.error = error;
        return resolve(ctx);
      }
      console.log('inquireOauthSessionId response: ' + body);
      if (response) {
        if (response.statusCode == 200) {
          try {
            body = JSON.parse(body);
            // Edge knows about the session and has returned information about it.
            ctx.sessionInfo = body;
          }
          catch (exc1) {
            console.log('inquireOauthSessionId exception: ' + exc1.message);
          }
          resolve(ctx);
        }
        else {
          console.log('inquireOauthSessionId, statusCode = ' + response.statusCode);
          resolve(ctx);
        }
      }
      else {
        console.log('inquireOauthSessionId, no response');
        reject(ctx);
      }
    });
  });
}

app.use(morgan('combined')); // logger
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// ====================================================================
// not sure these are used
app.get('/logout', (request, response) => {
  //var auth = request.session.username;
  request.session = null; // logout
  response.redirect('manage');
});


// display the cancel page
app.get('/cancel', function (request, response) {
  response
    .status(200)
    .render('cancel', { title: "Declined", mainMessage: "You have declined." });
});
// ====================================================================


// display the login form for a given tenant
app.get('/tenants/:tenant/login', function (request, response) {

  if ( ! validateTenant(request, response)) { return; }

  const renderLogin =
    (ctx) => {
      // sessionInfo:
      //   client_id
      //   response_type
      //   scope
      //   redirect_uri
      //   req_state
      //   appName
      //   appLogoUrl
      //   nonce?
      //console.log('/login renderLogin session: ' +  (ctx.sessionInfo? JSON.stringify(ctx.sessionInfo, null, 2): "xx")) ;
      if (ctx.sessionInfo && ctx.sessionInfo.client_id) {
        ctx.viewData = {
          ...ctx.sessionInfo,
          postback_url : `/tenants/${ctx.tenant}/validate`,
          action       : 'Sign in',
          sessionid    : ctx.sessionid,
          errorMessage : null // must be present and null
        };

        if ( ! ctx.viewData.appLogoUrl) {
          ctx.viewData.appLogoUrl = 'http://i.imgur.com/6DidtRS.png';
        }

        response.render('login', ctx.viewData);
      }
      else {
        response
          .status(404)
          .render('error404', {
            mainMessage: "the sessionid is not known.",
            title : "bad sessionid"
          });
      }
      return ctx;
    };

  const context = {tenant: request.params.tenant, sessionid: request.query.sessionid };
  console.log('/login context: ', JSON.stringify(context));

  Promise.resolve(context)
    .then(inquireOauthSessionId)
    .then(renderLogin)
    .catch(e => {
      let util = require('util');
      console.log('exception: ' + util.format(e));
      renderLogin();
    });
});


// respond to the login form postback
app.post('/tenants/:tenant/validate', (request, response) => {

  if ( ! validateTenant(request, response)) { return; }

  console.log('BODY: ' + JSON.stringify(request.body, null, 2));
  if ( ! request.body.redirect_uri) {
    response
      .status(400)
      .render('error', { errorMessage : 'Bad request - missing redirect_uri' });
    return;
  }

  if (request.body.submit != 'yes') {
    console.log('user has declined to login');
    // ! request.body.redirect_uri.startsWith('oob') &&
    // ! request.body.redirect_uri.startsWith('urn:ietf:wg:oauth:2.0:oob')
    response
      .status(302)
      .header('Location', request.body.redirect_uri + '?error=access_denied')
      .end();
    return;
  }

  // validate form data
  if ( ! request.body.username || ! request.body.password) {
    // missing form fields
    response
      .status(401)
      .render('login', {
        postback_url : `/tenants/${request.params.tenant}/validate`,
        action        : 'Sign in',
        sessionid     : request.body.sessionid,
        client_id     : request.body.client_id,
        response_type : request.body.response_type,
        req_scope     : request.body.requestedScopes,
        redirect_uri  : request.body.redirect_uri,
        req_state     : request.body.clientState,
        appName       : request.body.appName,
        appLogoUrl    : request.body.appLogoUrl || 'http://i.imgur.com/6DidtRS.png',
        display       : request.body.display,
        login_hint    : request.body.login_hint,
        errorMessage  : "You must specify a user and a password."
      });
    return;
  }

  let context = {
        credentials : {
          username: request.body.username,
          password: request.body.password
        },
        sessionid : request.body.sessionid,
        tenant    : request.params.tenant
      };

  Promise.resolve(context)
    .then(authenticateUser)
    .then((ctx) => {
      if (ctx.loginStatus != 200) {
        response
          .status(401)
          .render('login', {
            postback_url : `/tenants/${ctx.tenant}/validate`,
            action        : 'Sign in',
            sessionid     : ctx.sessionid,
            client_id     : request.body.client_id,
            response_type : request.body.response_type,
            req_scope     : request.body.requestedScopes,
            redirect_uri  : request.body.redirect_uri,
            req_state     : request.body.clientState,
            appName       : request.body.appName,
            appLogoUrl    : request.body.appLogoUrl || 'http://i.imgur.com/6DidtRS.png',
            display       : request.body.display,
            login_hint    : request.body.login_hint,
            errorMessage  : "That login failed."
          });
        return ctx;
      }

      // else, a-ok.
      // This app got a 200 ok from the user Authentication service.
      response
        .status(200)
        .render('consent', {
          action        : 'Consent',
          sessionid     : ctx.sessionid,
          postback_url  : `/tenants/${ctx.tenant}/grantConsent`,
          client_id     : request.body.client_id,
          response_type : request.body.response_type,
          req_scope     : request.body.requestedScopes,
          redirect_uri  : request.body.redirect_uri,
          req_state     : request.body.clientState,
          appName       : request.body.appName,
          appLogoUrl    : request.body.appLogoUrl || 'http://i.imgur.com/6DidtRS.png',
          display       : request.body.display,
          login_hint    : request.body.login_hint,
          userProfile   : base64Encode(JSON.stringify(ctx.userInfo))
        });

      return ctx;

    })
    .catch(logError);
});


// respond to the consent form postback
app.post('/tenants/:tenant/grantConsent',  (request, response) => {

  if ( ! validateTenant(request, response)) { return; }

  console.log('BODY: ' + JSON.stringify(request.body));
  if ( ! request.body.redirect_uri) {
    response
      .status(400)
      .render('error', { errorMessage : 'Bad request - missing redirect_uri' });
    return;
  }

  if (request.body.submit != 'yes') {
    console.log('user has declined to consent');
    // ! request.body.redirect_uri.startsWith('oob') &&
    // ! request.body.redirect_uri.startsWith('urn:ietf:wg:oauth:2.0:oob')
    response
      .status(302)
      .header('Location', request.body.redirect_uri + '?error=access_denied')
      .end();
    return;
  }

  Promise
    .resolve({
      userInfo : JSON.parse(base64Decode(request.body.userProfile)),
      sessionid : request.body.sessionid,
      tenant: request.params.tenant
    })
    .then(requestAuthCode)
    .then((ctx) => {
      if (!ctx.authRedirLoc) {
        console.log('the request-for-code did not succeed (' + ctx.authStatusCode + ')');
        //console.log('ctx: ' + JSON.stringify(ctx));
        response
          .status(ctx.authStatusCode || 400)
          .render('error', {
            errorMessage : (ctx.authResponseBody && ctx.authResponseBody.Error) ? ctx.authResponseBody.Error :
              "Bad request - cannot redirect"
          });
      }
      else {
        response
          .status(302)
          .header('Location', ctx.authRedirLoc);
      }

      response.end();
      return ctx;
    })
    .catch(logError);
});


// ====================================================================
// API
function deRegisterTenant(tenant) {
  return () => {
        if (registeredTenants[tenant] && registeredTenants[tenant].timeout) {
          clearTimeout(registeredTenants[tenant].timeout);
        }
        delete registeredTenants[tenant];
  };
}

function validateTenant  (request, response) {
    let tenant = registeredTenants[request.params.tenant];
    if (!tenant) {
      response
        .status(404)
        .render('error404', {
          mainMessage : 'Unknown tenant.',
          title : 'That\'s a 404 dude!'
        });
      return false;
    }

    // tenant:
    // {
    //   id,
    //   base_uri,
    //   registered,
    //   lastActive,
    //   timeout
    // }
    if (tenant.timeout) {
      clearTimeout(tenant.timeout);
    }
    tenant.timeout = setTimeout(deRegisterTenant(tenant.id), ONE_HOUR_IN_MS);
    tenant.lastActive = Date.now();
    return true;
}


// [API] register a tenant
app.post('/tenants', (request, response) => {
  let errorf =
    message => response
    .header('Content-Type', 'application/json')
    .status(400)
    .send(JSON.stringify({ error: { message }}, null, 2) + "\n");

  if ( ! request.body.id) {
    return errorf('Bad request - missing tenant id');
  }
  if ( ! request.body.base_uri) {
    return errorf('Bad request - missing base_uri');
  }
  if ( registeredTenants[request.body.id]) {
    return errorf('Bad request - a tenant with that id already exists');
  }

  registeredTenants[request.body.id] = {
    id : request.body.id,
    base_uri : request.body.base_uri,
    registered: Date.now(),
    lastActive: Date.now(),
    timeout : setTimeout(deRegisterTenant(request.body.id), ONE_HOUR_IN_MS)
  };

  // must not try to json.stringify the timeout ID, circular ref.
  const clone = (({ timeout, ...o }) => o)(registeredTenants[request.body.id]);

  response
    .header('Content-Type', 'application/json')
    .status(200)
    .send(JSON.stringify(clone, null, 2) + "\n");
});


// [API] de-register a tenant
app.delete('/tenants/:tenant', (request, response) => {
  if ( ! validateTenant(request, response)) { return; }
  deRegisterTenant(request.params.tenant);
  response.status(204);
});

// [API] list users known at a tenant
app.get('/tenants/:tenant/users', (request, response) => {
  if ( ! validateTenant(request, response)) { return; }

  response
    .header('Content-Type', 'application/json')
    .status(200)
    .send(JSON.stringify(userAuth.list(), null, 2) + "\n");
});

// [API] list tenants
app.get('/tenants',  (request, response) => {
  // exclude the timeout ID from the response
  let filtered =
    Object.keys(registeredTenants)
    .map(id => (({ timeout, ...o }) => o)(registeredTenants[id]));

  response
    .header('Content-Type', 'application/json')
    .status(200)
    .send(JSON.stringify(filtered, null, 2) + "\n");
});


app.get('/*', (request, response) =>
  response
    .status(404)
    .render('error404', {
      mainMessage : 'There\'s nothing to see here.',
      title : 'That\'s a 404 dude!'
    }));


let httpPort = process.env.PORT || 5150;
app.listen(httpPort, function() {
  console.log('Listening on port ' + httpPort);
});
