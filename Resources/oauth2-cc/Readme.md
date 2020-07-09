# OAuth v2.0 Token Dispensing Proxy - Client Credentials

This is an example Apigee Edge proxy that illustrates how to use Apigee
Edge to dispense tokens, for the "client credentials" grant type.

The tokens dispensed here are opaque OAuth 2.0 bearer tokens.

## Using the proxy

1. Import the proxy into any Apigee Edge organization. You can use any
script or tool that does that. Some examples are:
  * [the Powershell module](https://www.powershellgallery.com/packages/PSApigeeEdge)
  * [apigeetool](https://github.com/apigee/apigeetool-node)
  * [importAndDeploy.js](https://github.com/DinoChiesa/apigee-edge-js/blob/master/examples/importAndDeploy.js)

Or, you can do it manually: zip the apiproxy directory, then use the
mgmt UI to import and deploy the zipped bundle.

2. Create an API product. The API product normally wraps API proxies with metadata.
For the purposes of this example, your API product need not contain any API proxies.  (This is because we do not actually _verify_ the token in this example.  We only issue the token.)

3. Create a Developer within Apigee Edge

4. Create a Developer App within Apigee Edge, associated to the new Developer, and with
   authorization to use the API product.

5. View and copy the client_id and client_secret

6. Invoke the API proxy to retrieve a token via client credentials grant type as:
   ```
   curl -i -X POST \
     -H 'content-type: application/x-www-form-urlencoded' \
     -H 'Authorization: Basic BASE64_BLOB_HERE' \
     'https://vhost-ip:vhost-port/oauth2-cc/token' \
     -d 'grant_type=client_credentials'
   ```
   In the above, you need to correctly format the
   BASE64_BLOB_HERE to contain `Base64(client_id, client_secret)'`

   The response you see will look like this:
   ```json
   {
     "issued": "2016-Mar-30T16:07:05.407",
     "application_name": "rbeckerapp1",
     "access_token": "MDPQbwExSOGpLkibGxZiVRpOfAgA",
     "client_id": "p1Lr9kXLERZOIAkE9QGIiwE0qAeluQL9",
     "expires_in": 1799,
     "api_product_list": "[NprProduct2]",
     "grant_type": "client_credentials",
     "issued_at": 1459354025407
   }
   ```

## Commentary

This API proxy dispenses opaque oauth tokens. The attributes associated to the dispensed tokens are stored in the key-management database within Apigee Edge. The API publisher has the ability to curate or adjust the response to requests for tokens. You could, for example, deliver a JSON payload with only the token and the expiry. The current example provides lots of additional information in the response.

These tokens are not JWT. JWT describes a standard way to format self-describing tokens.
Apigee Edge can generate and return JWT, that function in much the same way as the opaque oauth tokens shown here. This is not implemented in this example API Proxy.

These tokens are not delivered via an OpenID Connect flow. OpenID connect describes an authentication flow on top of the OAuth 2.0 authorization framework. Apigee Edge can render JWT as a result of an OpenID Connect flow. This is not implemented in this example API Proxy.
