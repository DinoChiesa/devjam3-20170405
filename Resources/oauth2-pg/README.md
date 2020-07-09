# OAuth v2.0 Token Dispensing Proxy - Password Grant

This is an example Apigee Edge proxy that illustrates how to use Apigee Edge to dispense tokens,
for the password grant type.

The tokens dispensed here are opaque OAuth 2.0 bearer tokens.

## Using the proxy

1. Import the proxy into any Apigee Edge organization. You can use any
script or tool that does that. Some examples are:
  * [the Powershell module](https://www.powershellgallery.com/packages/PSApigeeEdge)
  * [apigeetool](https://github.com/apigee/apigeetool-node)
  * [importAndDeploy.js](https://github.com/DinoChiesa/apigee-edge-js/blob/master/examples/importAndDeploy.js)

Or, you can do it manually: zip the apiproxy directory, then use the mgmt UI to import and deploy the zipped bundle.

2. Create an API product. The API product normally wraps API proxies with metadata.
For the purposes of this example, your API product need not contain any API proxies.  (This is because we do not actually _verify_ the token in this example.  We only issue the token.)

3. Create a Developer within Apigee Edge

4. Create a Developer App within Apigee Edge, associated to the new Developer, and with
   authorization to use the API product.

5. View and copy the client_id and client_secret

6. Invoke the API proxy to retrieve a token via password grant type as:
   ```
   curl -i -X POST \
     -H content-type:application/x-www-form-urlencoded \
     -H 'Authorization: Basic BASE64_BLOB_HERE' \
     'https://vhost-ip:vhost-port/oauth2-pg/token' \
     -d 'grant_type=password&username=dino@apigee.com&password=IloveAPIs'
   ```
   In the above, you need to correctly format the
   BASE64_BLOB_HERE to contain `Base64(client_id, client_secret)'`

   Alternatively, you could use this form:
   ```
   curl -i -X POST \
     -H content-type:application/x-www-form-urlencoded \
     -u ${client_id}:${client_secret} \
     'https://vhost-ip:vhost-port/oauth2-pg/token' \
     -d 'grant_type=password&username=dino@apigee.com&password=IloveAPIs'
   ```

   The response you see will look like this:
   ```json
   {
     "token_type": "Bearer",
     "access_token": "VFrjhM7trZuFANm6Y6h1m7lkZaLG",
     "refresh_token": "yE8RiPxVln9GtRR1fN4uBFinblyDRNAK",
     "grant_type": "password",
     "refresh_token_expires_in": 28799,
     "refresh_count": "0",
     "issued_at": 1572450907,
     "refresh_token_issued_at": 1572450907,
     "expires_in": 1799
   }
   ```

7. Invoke the API proxy to refresh a token:
   ```
   curl -i -X POST \
     -H content-type:application/x-www-form-urlencoded \
     -H 'Authorization: Basic BASE64_BLOB_HERE' \
     'https://vhost-ip:vhost-port/oauth2-pg/token' \
     -d 'grant_type=refresh_token&refresh_token=REFRESH_TOKEN_HERE'
   ```
   The response you see should be similar.


## Commentary

This API proxy dispenses opaque OAuth tokens. The attributes associated to the
dispensed tokens are stored in the key-management database within Apigee
Edge. The API publisher has the ability to curate or adjust the response to
requests for tokens. You could, for example, deliver a JSON payload with only
the token and the expiry. The current example provides lots of additional
information in the response.

These tokens are generated via the password grant flow. The user credentials are
authenticated against a mock User store, available in Google Cloud, at
https://devjam3-20170405.appspot.com/auth . You can get a list of username /
password pairs by sending a GET:

```
curl -i GET https://devjam3-20170405.appspot.com/auth
```

The tokens issued by this API proxy are not JWT. JWT describes a standard way to
format self-describing tokens.  Apigee Edge can generate and return JWT, that
function in much the same way as the opaque oauth tokens shown here. This is not
implemented in this example API Proxy.

These tokens are not delivered via an OpenID Connect flow. OpenID connect
describes an authentication flow on top of the OAuth 2.0 authorization
framework. Apigee Edge can render JWT as a result of an OpenID Connect
flow. This is not implemented in this example API Proxy.
