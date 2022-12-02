# OAuth v2.0 Token Dispensing Proxy - Client Credentials

This is an example Apigee Edge proxy that illustrates how to use Apigee
to dispense tokens, for the "client credentials" grant type.

The tokens dispensed here are OAuth 2.0 bearer tokens, either opaque or JWT.

Tokens issued via this grant type are most useful for service-to-service communication.

Consult [IETF RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) for more details on OAuth2.


## Using the proxy

1. Import the proxy into any Apigee X or hybrid organization. You can use any
   script or tool that does that. Some examples are:

  * [apigeecli](https://github.com/apigee/apigeecli)
  * [importAndDeploy.js](https://github.com/DinoChiesa/apigee-edge-js-examples/blob/main/importAndDeploy.js)

   Or, you can do it manually: zip the apiproxy directory, then use the
   Apigee UI to import and deploy the zipped bundle.

   NB: this example proxy will not work in Apigee Edge (the prior version of Apigee), because
   it uses some features which are available only in Apigee X/hybrid.

2. You should have an API product in your Apigee organization. If you don't have
   one, create one. The API product normally wraps API proxies with metadata.  For
   the purposes of token issuance as shown in this example, your API product need
   not contain any API proxies. This is because this example does not _verify_ the
   token that gets generated. It only issues the token. Verification would be done
   in a separate proxy.

3. Create a Developer within Apigee

4. Create a Developer App within Apigee, associated to the new Developer, and with
   authorization to use the API product.

5. View and copy the client_id and client_secret

6. Invoke the API proxy to generate and obtain an _opaque_ access token via the
   client credentials grant type:

   ```
   endpoint=https://my-apigee-endpoint.net
   curl -i -X POST \
     -H 'content-type: application/x-www-form-urlencoded' \
     -H 'Authorization: Basic BASE64_BLOB_HERE' \
     "$endpoint/oauth2-cc/token" \
     -d 'grant_type=client_credentials'
   ```

   In the above, you need to correctly format the
   BASE64_BLOB_HERE to contain `Base64(client_id, client_secret)'`

   An easy way to do this with curl is to use the -u option.
   ```
   endpoint=https://my-apigee-endpoint.net
   curl -i -X POST \
     -H 'content-type: application/x-www-form-urlencoded' \
     -u $client_id:$client_secret \
     "$endpoint/oauth2-cc/token" \
     -d 'grant_type=client_credentials'
   ```


   The response you see will look like this:
   ```json
   {
     "token_type": "Bearer",
     "access_token": "A74AghG22At14iUkPVXlaDpn3Q2w",
     "grant_type": "client_credentials",
     "issued_at": 1670009710,
     "expires_in": 1799
   }
   ```
   The response shows the opaque token, and the expiry - 1799 seconds or about 30 minutes.

7. To ask Apigee to generate a JWT access token, perform the same request but use
   the `/jwt` path suffix in the URL:

   ```
   curl -i -X POST \
     -H 'content-type: application/x-www-form-urlencoded' \
     -u $client_id:$client_secret \
     "$endpoint/oauth2-cc/jwt" \
     -d 'grant_type=client_credentials'
   ```

   The response will be of the same shape as above, but the token will be a JWT.
   It can be used/verified by Apigee proxies, in a way that is similar to the
   opaque token.  The signed JWT payload has no "user specific"


## Commentary

This API proxy dispenses OAuth2 tokens, via client_credentials grant type. There
are two options for the form of the token: an opaque token, or a JWT. The
attributes associated to the dispensed tokens are stored in the key-management
database within Apigee. The Adminnistrator of the oauth2-cc API proxy has the
ability to curate or adjust the response to requests for tokens. You could, for
example, deliver a JSON payload with only the token and the expiry. The current
example provides some additional information in the response.

The JWT tokens issued by this proxy serve a similar purpose to the opaque tokens,
but they are decodable. You might want to use a JWT if you want the token to be
validatable by something other than an Apigee gateway.

The tokens issued by this API Proxy are not delivered via an OpenID Connect flow.
OpenID Connect describes an authentication flow on top of the OAuth 2.0 authorization
framework. Normally you would use an enterprse-grade Identity Provider (IdP),
something like PingIdentity or SiteMinder or Okta or ActiveDirectory, and so on, to
provide the OpenID Connect capability.

You can configure an Apigee API Proxy to _validate_ access tokens issued by a
third-party IdP. That's not shown in this API Proxy.
