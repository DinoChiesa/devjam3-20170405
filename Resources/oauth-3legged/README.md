# OAuth 3-legged Proxy

This is an API Proxy that implements the OAuth2.0 3-legged (authorization code) flow.
The login-and-consent app is bundled with the API Proxy.
This makes it super easy to demonstrate 3-legged OAuth in Apigee Edge.

## Setup

You need an API Product, a developer, and a developer app, with its client_id and client_secret.
The API Product should have scopes: A,B,C

## To Kick off the flow:

```
curl -i -X GET "https://cap500-test.apigee.net/devjam3/oauth2-ac/authorize?client_id=lq93FiqTw1si09wsocM7AjOBSbyi45iA&redirect_uri=http://dinochiesa.github.io/openid-connect/callback-handler.html&response_type=code&scope=A&nonce=A12345&state=ABCDEFG"
```

This will redirect you to a URL for the login-and-consent app.  You need to open the resulting link in a browser and authenticate.

The login-and-consent app uses a mock user database, and these are the valid username / password pairs:
* dino / IloveAPIs
* valerie / Wizard123
* heidi / 1Performance
* greg / Memento4Quiet
* naimish / Imagine4


Once you authenticate and grant consent, you will receive a code via the redirect_uri. 
The redirect_uri you pass should be able to display a code. The one shown above works just fine for most purposes.


## To exchange the code for a token:

Copy the code shown in the redirect_uri web page, then paste it into the body like so:

```
curl -i -X POST "https://cap500-test.apigee.net/devjam3/oauth2-ac/token" -d 'grant_type=authorization_code&client_id=lq93FiqTw1si09wsocM7AjOBSbyi45iA&client_secret=7AvozEjhA8ddxD7b&code=q2oI7b2d&redirect_uri=http://dinochiesa.github.io/openid-connect/callback-handler.html'
```

