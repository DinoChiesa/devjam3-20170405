#! /usr/local/bin/node
/*jslint node:true */
// provision.js
// ------------------------------------------------------------------
// provision an Apigee API Product, Developer, App, and Cache
// for the OAuthV2 Authorization code Example.
//
// Copyright 2017-2024 Google LLC.
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
// last saved: <2024-June-14 13:55:42>

const constants = {
  cacheName: "cache1",
  proxyName: "apigee-examples-oauth2-ac",
  proxySource: require("path").join(__dirname, ".."),
  productName: "AuthCode-Example-Product",
  developerEmail: "AuthCode-Example-Developer@example.com",
  appName: "AuthCode-Example-App-1",
  note:
    "created " +
    new Date().toISOString() +
    " for Authorization Code Token-granting Example",
  callbackUrl:
    "https://dinochiesa.github.io/openid-connect/callback-handler.html",
  scopes: ["A", "B", "C"],
  appExpiry: "180d"
};

const apigeejs = require("apigee-edge-js"),
  common = apigeejs.utility,
  fs = require("fs"),
  path = require("path"),
  apigee = apigeejs.apigee,
  sprintf = require("sprintf-js").sprintf,
  Getopt = require("node-getopt"),
  version = "20240614-1158",
  getopt = new Getopt(
    common.commonOptions.concat([
      [
        "",
        "reset",
        "Optional. Reset, delete all the assets previously created by this script"
      ],
      [
        "",
        "callbackUrl",
        "Optional. a callback URL. default: " + constants.callbackUrl
      ],
      ["", "apidomain=ARG", "Required. a domain for the API endpoint"],
      [
        "",
        "logindomain=ARG",
        "Required. a domain for the login-and-consent experience"
      ],
      [
        "",
        "tenantid=ARG",
        "Required. a tenantid to provision in the login-and-consent experience"
      ],
      [
        "e",
        "env=ARG",
        "the Edge environment(s) to use for this demonstration. "
      ]
    ])
  ).bindHelp();

// ========================================================

function isGaambo(org) {
  //console.log("urlbase: " + org.conn.urlBase);
  return org.conn.urlBase.startsWith("https://apigee.googleapis.com");
}

function replaceProperties(domain, tenantId) {
  const sourceFile = path.join(
    __dirname,
    "..",
    `apiproxy/resources/properties/settings.properties`
  );
  let c = fs.readFileSync(sourceFile, "utf-8");
  const replace = (c, key, value) =>
    c.replace(new RegExp(`(${key} ?= ?)(.+)`, "g"), `${key} = ${value}`);
  c = replace(c, "baseuri-for-login-endpoint", domain);
  c = replace(c, "tenant-id", tenantId);
  fs.writeFileSync(sourceFile, c);
}

const makeUri = (domain, urlpath) => {
  const prefix = domain.startsWith("http")
    ? ""
    : domain.startsWith("localhost")
    ? "http://"
    : "https://";

  return `${prefix}${domain}${urlpath}`;
};

console.log(
  `Apigee AC Proxy Provisioning tool, version: ${version}\n` +
    `Node.js ${process.version}\n`
);

common.logWrite("start");
const opt = getopt.parse(process.argv.slice(2));
if (
  !opt.options.reset &&
  (!opt.options.logindomain || !opt.options.apidomain || !opt.options.tenantid)
) {
  console.log("missing one or more required parameters");
  getopt.showHelp();
  process.exit(1);
}

common.verifyCommonRequiredParameters(opt.options, getopt);

apigee
  .connect(common.optToOptions(opt))
  .then((org) => {
    common.logWrite("connected");
    if (opt.options.reset) {
      replaceProperties(
        "https://login-and-consent-domain.example.com",
        "tenant-value"
      );
      const opts = {
        delApp: {
          appName: constants.appName,
          developerEmail: constants.developerEmail
        },
        delDeveloper: { developerEmail: constants.developerEmail },
        delProduct: { productName: constants.productName },
        undeployProxy: {
          name: constants.proxyName,
          environment: opt.options.env
        },
        delProxy: { name: constants.proxyName },
        delCache: {
          cacheName: constants.cacheName,
          environment: opt.options.env
        }
      };

      return org.proxies
        .undeploy(opts.undeployProxy)
        .catch((_e) => ({}))
        .then((_result) => org.proxies.del(opts.delProxy))
        .catch((_e) => ({}))
        .then((_result) => org.caches.del(opts.delCache))
        .then((_result) => org.developerapps.del(opts.delApp))
        .catch((_e) => ({}))
        .then((_result) => org.developers.del(opts.delDeveloper))
        .catch((_e) => ({}))
        .then((_result) => org.products.del(opts.delProduct))
        .catch((_e) => ({}))
        .then((_result) =>
          common.logWrite(sprintf("ok. demo assets have been deleted"))
        )
        .catch((e) => console.log(e.stack));
    }

    replaceProperties(
      makeUri(opt.options.logindomain, ""),
      opt.options.tenantid
    );
    const tenantUri = makeUri(opt.options.logindomain, "/tenants"),
      options = {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: opt.options.tenantid,
          base_uri: makeUri(opt.options.apidomain, "/apigee-examples")
        })
      };

    // register the tenant in the login app
    return fetch(tenantUri, options)
      .then(async (res) => [res.status, res.headers, await res.json()])
      .then(([_status, _headers, _json]) => {
        const callbackUrl = opt.options.callbackUrl || constants.callbackUrl;
        const opts = {
          createCache: {
            cacheName: constants.cacheName,
            environment: opt.options.env
          },
          createProduct: {
            productName: constants.productName,
            description: "Test Product for Auth Code OAuthV2 Example",
            scopes: constants.scopes,
            attributes: { access: "public", note: constants.note },
            approvalType: "auto"
          },
          createDeveloper: {
            developerEmail: constants.developerEmail,
            lastName: "Developer",
            firstName: "AuthCode-Example",
            userName: "AuthCode-Example-Developer",
            attributes: { note: constants.note }
          },
          createApp: {
            developerEmail: constants.developerEmail,
            appName: constants.appName,
            apiProduct: constants.productName,
            callbackUrl,
            expiry: constants.appExpiry,
            attributes: { note: constants.note }
          },
          importProxy: {
            name: constants.proxyName,
            source: constants.proxySource
          },
          deployProxy: {
            name: constants.proxyName,
            environment: opt.options.env
          }
        };

        const p = isGaambo(org)
          ? Promise.resolve({})
          : org.caches.create(opts.createCache);
        return p
          .then((_result) => org.proxies.import(opts.importProxy))
          .then((result) =>
            org.proxies.deploy(
              Object.assign(opts.deployProxy, { revision: result.revision })
            )
          )
          .then((_result) => org.products.create(opts.createProduct))
          .then((_result) => org.developers.create(opts.createDeveloper))
          .then((_result) => org.developerapps.create(opts.createApp))
          .then((result) => {
            common.logWrite(sprintf("created app. name: %s", result.name));
            console.log(sprintf("\n\nORG=%s", opt.options.org));
            console.log(sprintf("ENV=%s", opt.options.env));
            console.log(
              sprintf("client_id=%s", result.credentials[0].consumerKey)
            );
            console.log(
              sprintf("client_secret=%s", result.credentials[0].consumerSecret)
            );
            const params = new URLSearchParams({
                client_id: result.credentials[0].consumerKey,
                redirect_uri: callbackUrl,
                response_type: "code",
                scope: "A"
              }),
              qs = params.toString();
            console.log(
              "\n\nTo kick off the flow, wait for the proxy to be deployed, then open this link in your browser:\n  " +
                makeUri(
                  opt.options.apidomain,
                  `/apigee-examples/oauth2-ac/authorize?${qs}`
                ) +
                "\n\n"
            );
          });
      })
      .catch((e) => console.log(e.stack));
  })
  .catch((e) => console.log(e.stack));
