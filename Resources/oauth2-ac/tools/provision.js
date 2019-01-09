#! /usr/local/bin/node
/*jslint node:true */
// provision.js
// ------------------------------------------------------------------
// provision an Apigee Edge API Product, Developer, App, and Cache
// for the OAuthV2 Authorization code Example.
//
// Copyright 2017-2019 Google LLC.
//

/* jshint esversion: 6, strict:false */

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
// last saved: <2019-January-09 11:01:27>

const edgejs     = require('apigee-edge-js'),
      common     = edgejs.utility,
      apigeeEdge = edgejs.edge,
      sprintf    = require('sprintf-js').sprintf,
      path       = require('path'),
      Getopt     = require('node-getopt'),
      version    = '20190109-0937',
      getopt     = new Getopt(common.commonOptions.concat([
        ['R' , 'reset', 'Optional. Reset, delete all the assets previously created by this script'],
        ['e' , 'env=ARG', 'the Edge environment(s) to use for this demonstration. ']
      ])).bindHelp();

// ========================================================

console.log(
  'Apigee Edge AC Proxy Provisioning tool, version: ' + version + '\n' +
    'Node.js ' + process.version + '\n');

common.logWrite('start');
var opt = getopt.parse(process.argv.slice(2));
common.verifyCommonRequiredParameters(opt.options, getopt);

const constants = {
        cacheName      : 'cache1',
        proxyName      : 'oauth2-ac',
        proxySource    : path.join(__dirname, '..'),
        productName    : 'AuthCode-Example-Product',
        developerEmail : 'AuthCode-Example-Developer@example.com',
        appName        : 'AuthCode-Example-App-1',
        note           : 'created '+ (new Date()).toISOString() + ' for Authorization Code Token-granting Example',
        callbackUrl    : 'https://dinochiesa.github.io/openid-connect/callback-handler.html',
        scopes         : ['A', 'B', 'C'],
        appExpiry      : '180d'
      },
      connectOptions = {
        mgmtServer : opt.options.mgmtserver,
        org        : opt.options.org,
        user       : opt.options.username,
        password   : opt.options.password,
        no_token   : opt.options.notoken,
        verbosity  : opt.options.verbose || 0
      };


apigeeEdge.connect(connectOptions)
  .then( (org) => {
    common.logWrite('connected');
    if (opt.options.reset) {
      let opts ={
            delApp: { appName: constants.appName, developerEmail: constants.developerEmail },
            delDeveloper:  { developerEmail: constants.developerEmail },
            delProduct : { productName: constants.productName },
            undeployProxy: { name : constants.proxyName, environment : opt.options.env },
            delProxy: { name : constants.proxyName },
            delCache: { cacheName : constants.cacheName, environment : opt.options.env }
          };

      return org.proxies.undeploy(opts.undeployProxy)
        .then( (result) => org.proxies.del(opts.delProxy) )
        .then( (result) => org.caches.del(opts.delCache) )
        .then( (result) => org.developerapps.del(opts.delApp) )
        .then( (result) => org.developers.del(opts.delDeveloper) )
        .then( (result) => org.products.del(opts.delProduct) )
        .then( (result) => common.logWrite(sprintf('ok. demo assets have been deleted')) )
        .catch( (e) => console.log(e.stack) );
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
            callbackUrl    : constants.callbackUrl,
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

    return org.caches.create(opts.createCache)
      .then( (result) => org.proxies.import(opts.importProxy) )
      .then( (result) => org.proxies.deploy(Object.assign(opts.deployProxy, {revision:result.revision}) ) )
      .then( (result) => org.products.create(opts.createProduct) )
      .then( (result) => org.developers.create(opts.createDeveloper) )
      .then( (result) => org.developerapps.create(opts.createApp) )
      .then( (result) => {
        common.logWrite(sprintf('created app. name: %s', result.name));
        console.log(sprintf('\n\nORG=%s', opt.options.org));
        console.log(sprintf('ENV=%s', opt.options.env));
        console.log(sprintf('client_id=%s', result.credentials[0].consumerKey));
        console.log(sprintf('client_secret=%s', result.credentials[0].consumerSecret));
      })
      .catch( (e) => console.log(e.stack) );
  })
  .catch( (e) => console.log(e.stack) );
