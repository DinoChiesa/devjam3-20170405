#! /usr/local/bin/node
/*jslint node:true */
// provision.js
// ------------------------------------------------------------------
// provision an Apigee Edge API Product, Developer, App, and Cache
// for the OAuthV2 Authorization code Example.
//
// Copyright 2017-2019 Google LLC.
//

/* jshint esversion: 9, strict:false */

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// last saved: <2022-February-22 20:06:49>

const constants = {
        cacheName      : 'cache1',
        proxyName      : 'oauth2-ac',
        proxySource    : require('path').join(__dirname, '..'),
        productName    : 'AuthCode-Example-Product',
        developerEmail : 'AuthCode-Example-Developer@example.com',
        appName        : 'AuthCode-Example-App-1',
        note           : 'created '+ (new Date()).toISOString() + ' for Authorization Code Token-granting Example',
        callbackUrl    : 'https://dinochiesa.github.io/openid-connect/callback-handler.html',
        scopes         : ['A', 'B', 'C'],
        appExpiry      : '180d'
      };

const apigeejs   = require('apigee-edge-js'),
      common     = apigeejs.utility,
      apigee     = apigeejs.apigee,
      sprintf    = require('sprintf-js').sprintf,
      Getopt     = require('node-getopt'),
      version    = '20220222-2006',
      getopt     = new Getopt(common.commonOptions.concat([
        ['R' , 'reset', 'Optional. Reset, delete all the assets previously created by this script'],
        ['U' , 'callbackUrl', 'Optional. specify a callback URL. default: ' + constants.callbackUrl],
        ['e' , 'env=ARG', 'the Edge environment(s) to use for this demonstration. ']
      ])).bindHelp();

// ========================================================

function isGaambo(org) {
  console.log('urlbase: ' + org.conn.urlBase);
  return org.conn.urlBase.startsWith('https://apigee.googleapis.com');
}

console.log(
  `Apigee AC Proxy Provisioning tool, version: ${version}\n` +
    `Node.js ${process.version}\n`);

common.logWrite('start');
var opt = getopt.parse(process.argv.slice(2));
common.verifyCommonRequiredParameters(opt.options, getopt);

apigee
  .connect(common.optToOptions(opt))
  .then( org => {
    common.logWrite('connected');
    if (opt.options.reset) {
      let opts = {
            delApp: { appName: constants.appName, developerEmail: constants.developerEmail },
            delDeveloper:  { developerEmail: constants.developerEmail },
            delProduct : { productName: constants.productName },
            undeployProxy: { name : constants.proxyName, environment : opt.options.env },
            delProxy: { name : constants.proxyName },
            delCache: { cacheName : constants.cacheName, environment : opt.options.env }
          };

      return org.proxies.undeploy(opts.undeployProxy).catch(e => ({}))
        .then( result => org.proxies.del(opts.delProxy) ).catch(e => ({}))
        .then( result => org.caches.del(opts.delCache) )
        .then( result => org.developerapps.del(opts.delApp) ).catch(e => ({}))
        .then( result => org.developers.del(opts.delDeveloper) ).catch(e => ({}))
        .then( result => org.products.del(opts.delProduct) ).catch(e => ({}))
        .then( result => common.logWrite(sprintf('ok. demo assets have been deleted')) )
        .catch( e => console.log(e.stack) );
    }

    let opts = {
          createCache: { cacheName : constants.cacheName, environment : opt.options.env },
          createProduct: {
            productName  : constants.productName,
            description  : 'Test Product for Auth Code OAuthV2 Example',
            scopes       : constants.scopes,
            attributes   : { access: 'public', note: constants.note },
            approvalType : 'auto'
          },
          createDeveloper: {
            developerEmail : constants.developerEmail,
            lastName       : 'Developer',
            firstName      : 'AuthCode-Example',
            userName       : 'AuthCode-Example-Developer',
            attributes     : { note: constants.note }
          },
          createApp: {
            developerEmail : constants.developerEmail,
            appName        : constants.appName,
            apiProduct     : constants.productName,
            callbackUrl    : opt.options.callbackUrl || constants.callbackUrl,
            expiry         : constants.appExpiry,
            attributes     : { note: constants.note }
          },
          importProxy: {
            name   : constants.proxyName,
            source : constants.proxySource
          },
          deployProxy: {
            name        : constants.proxyName,
            environment : opt.options.env
          }
        };

    let p = isGaambo(org) ? Promise.resolve({}) : org.caches.create(opts.createCache);
    return p
      .then( result => org.proxies.import(opts.importProxy) )
      .then( result => org.proxies.deploy(Object.assign(opts.deployProxy, {revision:result.revision}) ) )
      .then( result => org.products.create(opts.createProduct) )
      .then( result => org.developers.create(opts.createDeveloper) )
      .then( result => org.developerapps.create(opts.createApp) )
      .then( result => {
        common.logWrite(sprintf('created app. name: %s', result.name));
        console.log(sprintf('\n\nORG=%s', opt.options.org));
        console.log(sprintf('ENV=%s', opt.options.env));
        console.log(sprintf('client_id=%s', result.credentials[0].consumerKey));
        console.log(sprintf('client_secret=%s', result.credentials[0].consumerSecret));
      })
      .catch( (e) => console.log(e.stack) );
  })
  .catch( (e) => console.log(e.stack) );
