// importJsonToContext.js
// ------------------------------------------------------------------
//
// Import a JSON string context variables.
//
// For example, suppose this is the json string
// {
//       targetUrls : [
//        'https://host1/api-test/t1',
//        'https://host2/api-test/t1',
//        'https://host3/api-test/t1'
//       ],
//       somethingElse: 'TARGET_URL_HERE',
//       debug : { core : true }
// }
//
// Then, the context will get these variables:
//   settings_targetUrls_0 = 'https://host1/api-test/t1'
//   settings_targetUrls_1 = 'https://host2/api-test/t1'
//   settings_targetUrls_2 = 'https://host3/api-test/t1'
//   settings_somethingElse = 'TARGET_URL_HERE'
//   settings_debug_core = true
//
//
// created: Wed Sep  9 16:35:07 2015
// last saved: <2021-March-09 10:32:03>
//
/* global properties, context */

function flatten(target, opts) {
  opts = opts || {};

  var delimiter = opts.delimiter || '_',
      maxDepth = opts.maxDepth,
      currentDepth = 1,
      output = {};

  function step(object, prev) {
    Object.keys(object).forEach(function(key) {
      var value = object[key],
          isarray = opts.safe && Array.isArray(value),
          type = Object.prototype.toString.call(value),
          isobject = (type === "[object Object]" || type === "[object Array]" ),
          newKey = prev ? prev + delimiter + key : key;

      if (!opts.maxDepth) {
        maxDepth = currentDepth + 1;
      }

      if (!isarray && isobject && Object.keys(value).length && currentDepth < maxDepth) {
        ++currentDepth;
        return step(value, newKey);
      }

      output[newKey] = value;
    });
  }

  step(target);

  return output;
}

var varname = properties.varname;
var settings = JSON.parse(context.getVariable(varname));
var flatObj = flatten(settings);

Object.keys(flatObj).forEach(function(key){
  context.setVariable(varname + '_' + key, flatObj[key]);
});
