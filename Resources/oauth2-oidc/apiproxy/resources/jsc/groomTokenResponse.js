// groomTokenResponse.js
// ------------------------------------------------------------------
//
// Tweaks the generated OAuth token response.
//
// last saved: <2019-September-08 15:02:55>
/* global response, properties */
var b1 = JSON.parse(response.content),
    propertiesToRemove = ['status', 'refresh_token_status',
                          'organization_name', 'developer.email',
                          'scope', 'refresh_count',
                          'refresh_token_issued_at', 'application_name'],
    wantHumanReadableTimes = (properties.wantHumanReadableTimes || "false") == "true",
    wantAppName = (properties.wantAppName || "false") == "true",
    wantProductList = (properties.wantProductList || "false") == "true",
    d;

function convertIssuedAt(prop, wantHumanReadable) {
  if (b1[prop]) {
    var shortName = prop.substring(0, prop.length - 3);
    b1[prop] = Math.floor(parseInt(b1[prop], 10) / 1000); // convert ms to s
    if (wantHumanReadableTimes) {
      var d = new Date(b1[prop]);
      b1[shortName] = d.toISOString();
    }
  }
}

if (b1.access_token) {
  if ( ! wantProductList) {
    propertiesToRemove.push('api_product_list');
    propertiesToRemove.push('api_product_list_json');
  }
  propertiesToRemove.forEach(function(item){
    delete b1[item];
  });

  // if there is no refresh token, which is the case for a
  // client_credentials token, don't keep properties related to it:
  if( ! b1.refresh_token ) {
    delete b1.refresh_token_expires_in;
    delete b1.refresh_count;
  }

  // application_name is actually the application ID (a guid)
  // get the actual app name
  if (wantAppName) {
    var appName = context.getVariable('apigee.developer.app.name');
    if (appName) { b1.application_name = appName;}
  }

  // keep only unique scopes
  if (b1.scope) {  // "A A B C A B"
    var scopes = b1.scope.split(' '); // ["A" "A" "B" "C" "A" "B"]
    b1.scope = scopes.filter( function(value, index, self) {
      return self.indexOf(value) === index;
    });  // ["A" "B" "C"]

    // optional
    b1.scope = b1.scope.join(); // "A B C"
  }

  // convert *_issued_at to a number, and
  // add a property with an equivalent human-readable time strings.
  ['issued_at', 'refresh_token_issued_at'].forEach(convertIssuedAt);

  // the expiry value is given as a string; let's make it a number.
  if (b1.expires_in) {
    b1.expires_in = parseInt(b1.expires_in, 10);
    if (wantHumanReadableTimes) {
      d = new Date((b1.issued_at + b1.expires_in) * 1000);
      b1.expires = d.toISOString();
    }
  }

  b1.token_type = 'Bearer';

  // the expiry value is given as a string; let's make it a number.
  if (b1.refresh_token_expires_in) {
    b1.refresh_token_expires_in = parseInt(b1.refresh_token_expires_in, 10);
    if (wantHumanReadableTimes) {
      d = new Date((b1.issued_at + b1.refresh_token_expires_in) * 1000);
      b1.refresh_token_expires = d.toISOString();
    }
  }

  // pretty-print JSON
  context.setVariable('response.content', JSON.stringify(b1, null, 2));
}
