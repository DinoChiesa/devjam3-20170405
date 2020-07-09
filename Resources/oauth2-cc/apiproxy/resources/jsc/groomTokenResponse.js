// groomTokenResponse.js
// ------------------------------------------------------------------
// last updated: <2020-April-06 16:21:53>
/* jshint esversion:6, node:false, strict:implied */
/* global response, context, properties */

var origResponse = JSON.parse(response.content);
if (origResponse.access_token) {
  var newResponse = {
        token_type : 'Bearer'
      },
      toKeep = String(properties.keep).trim();
  //print('keep: ' + toKeep);
  if ( !toKeep || toKeep == 'undefined') {
    toKeep = 'access_token, refresh_token, scope, grant_type';
  }

  toKeep = toKeep.split(new RegExp('[, ]+'));
  toKeep.forEach(function(key) {
      if (origResponse[key]) {
        newResponse[key] = origResponse[key];
      }
  });

  // Only if there is a refresh token, keep properties related to it:
  if (origResponse.refresh_token) {
    newResponse.refresh_token_expires_in = origResponse.refresh_token_expires_in;
    newResponse.refresh_count = origResponse.refresh_count;
  }

  // convert String(ms-since-epoch) to Number(seconds-since-epoch)
  ['issued_at', 'refresh_token_issued_at'].forEach(function convertIssuedAt(prop) {
    if (origResponse[prop]) {
      newResponse[prop] = Math.floor(parseInt(origResponse[prop], 10) / 1000);
    }
  });

  // convert expires_in to Number(expires_in)
  ['expires_in', 'refresh_token_expires_in', 'refresh_count'].forEach(function convertExpires(prop){
    if (origResponse[prop]) {
        var intValue = parseInt(origResponse[prop], 10);
        if (intValue>0) {
          newResponse[prop] = intValue;
        }
    }
  });
  context.setVariable('response.content', JSON.stringify(newResponse, null, 2));
}
