// walkObj.js
// ------------------------------------------------------------------
//
// created: Mon Feb 26 19:00:50 2018
// last saved: <2018-March-12 13:09:13>

(function (){
  'use strict';
  var what = Object.prototype.toString;

  function walkObj(obj, path, fn) {
    if ( ! fn && typeof path == 'function') {
      fn = path;
      path = 'json';
    }
    var wo = what.call(obj), p;
    path = path || '';

    if (wo == "[object Object]") {
      Object.keys(obj).forEach(function(key){
        var item = obj[key], w = what.call(item);
        var pathelts = path.split('.');
        pathelts.push(key);
        var newpath = pathelts.join('.');
        if (w == "[object Object]") {
          walkObj(item, newpath, fn);
        }
        else if (w == "[object Array]") {
          fn(newpath, item, true);
          walkObj(item, newpath, fn);
        }
        else {
          fn(newpath, item);
        }
      });
    }
    else if (wo == "[object Array]") {
      obj.forEach(function(item, ix){
        var w = what.call(item);
        var pathelts = path.split('.');
        pathelts.push('['+ix+']');
        var newpath = pathelts.join('.');
        if (w == "[object Object]" || w == "[object Array]") {
          walkObj(item, newpath, fn);
        }
        else {
          fn(newpath, item);
        }
      });
    }
    else {
      var msg  = "Unknown object to covert: " + wo + "("+ JSON.stringify(obj, null, 2).slice(0, 34) +")";
      //console.log(msg);
      throw {error: true, message: msg };
    }
  }

  // export to global scope
  var globalScope = (function(){ return this; }).call(null);
  globalScope.walkObj = walkObj;

}());
