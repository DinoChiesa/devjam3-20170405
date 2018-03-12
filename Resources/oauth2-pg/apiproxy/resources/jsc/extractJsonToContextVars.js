// extractJsonToContextVars.js
// ------------------------------------------------------------------
//
// For a JSON payload, set context vars for all fields.
//
// created: Tue Mar  7 16:32:14 2017
// last saved: <2018-March-12 13:00:14>


function isValidMessage(sourceMsg) {
  var verb = context.getVariable(sourceMsg + '.verb');
  if (verb) return true;
  // else a response message, check the status code
  var statusCode = context.getVariable(sourceMsg + '.status.code') + '';
  return (statusCode == '200');
}

var sourceMsg = properties.source || 'message';
if (isValidMessage(sourceMsg)) {
  var ctype = context.getVariable(sourceMsg + '.header.content-type');
  if (ctype.indexOf("application/json") === 0) {
    walkObj(JSON.parse(context.getVariable(sourceMsg + '.content')),
            properties.prefix || 'json',
            function(name, value, isArray) {
              if (isArray) {
                if (value.length>0) {
                  if (typeof value[0] == 'string') {
                    // "\"readers\",\"editors\",\"apigee\""
                    //context.setVariable(name, value.map(function(x) { return JSON.stringify(x);}).join(','));

                    // "[\"readers\",\"editors\",\"apigee\"]"
                    //context.setVariable(name, JSON.stringify(value));

                    // "[readers,editors]"
                    //context.setVariable(name, '[' + value.toString() + ']');

                    // readers,editors
                    context.setVariable(name, value.toString() );
                  }
                  else {
                    context.setVariable(name, '??');
                  }
                }
                else {
                  context.setVariable(name, '[]');
                }
              }
              else {
                context.setVariable(name, value);
              }
            });
  }
  else {
    context.setVariable((properties.prefix || 'json') + '.' + sourceMsg + '.error', "not json content");
  }
}
else {
  context.setVariable((properties.prefix || 'json') + '.' + sourceMsg + '.error', "bad inbound message");
}


// example inbound payload:
//
// {
//   "name": "rooms/AAAAra-BjYE/conversations/qo4NQAAAAAE/messages/Ko4NQAAAAAE",
//   "sender": {
//     "name": "users/113884434698534952030",
//     "displayName": "Dino Chiesa",
//     "avatarUrl": "https://lh4.googleusercontent.com/-cBWaVITMntw/AAAAAAAAAAI/AAAAAAAAADg/hxfWDAGRhDY/photo.jpg",
//     "email": "dchiesa@google.com"
//   },
//   "createTime": "2017-03-07T23:53:04.504207Z",
//   "text": "/jira MGMT-3909"
// };

// result is, context variables set like this:
// json.name = "rooms/AAAAra-BjYE/conversations/qo4NQAAAAAE/messages/Ko4NQAAAAAE"
// json.sender.name = "users/113884434698534952030"
// json.sender.displayName = "Dino Chiesa"
// json.sender.avatarUrl = "https://lh4.googleusercontent.com/-cBWaVITMntw/AAAAAAAAAAI/AAAAAAAAADg/hxfWDAGRhDY/photo.jpg"
// json.sender.email = "dchiesa@google.com"
// json.createTime = "2017-03-07T23:53:04.504207Z"
// json.text = "/jira MGMT-3909"
