# OAuth 3-legged Proxy

This is an API Proxy that implements the OAuth2.0 3-legged (authorization code) flow.
The login-and-consent app is bundled with the API Proxy.
This makes it super easy to demonstrate 3-legged OAuth in Apigee Edge.

## Setup

You need to deploy this API Proxy.  Then, you need an API Product, a developer, and a developer app, with its client_id and client_secret. The app should have a redirect URI of https://dinochiesa.github.io/openid-connect/callback-handler.html .

The API Product should have scopes: A,B,C

## To Kick off the flow:

Paste the following into a browser address bar:

```
https://ORG-ENV.apigee.net/devjam3/oauth2-ac/authorize?client_id=CLIENT_ID_HERE&redirect_uri=https://dinochiesa.github.io/openid-connect/callback-handler.html&response_type=code&scope=A

```

This will redirect you to a URL for the login-and-consent app.  You will need to authenticate.

The login-and-consent app uses a mock user database, and these are the valid username / password pairs:
* dino@apigee.com / IloveAPIs
* valerie@example.com / Wizard123
* heidi@example.com / 1Performance
* greg@example.com / Memento4Quiet
* naimish@example.com / Imagine4


Once you authenticate and grant consent, you will receive a code via the redirect_uri.
The redirect_uri you pass should be able to display a code. The one shown above works just fine for most purposes.


## To exchange the code for a token:

Copy the code shown in the redirect_uri web page, then paste it into the body in place of `CODE_HERE` like so:

```
curl -i -u client_id:client_secret \
  -X POST "https://ORG-ENV.apigee.net/devjam3/oauth2-ac/token" \
  -d 'grant_type=authorization_code&code=CODE_HERE&redirect_uri=https://dinochiesa.github.io/openid-connect/callback-handler.html'
```
Note: you must also replace the client_id and client_secret in the above.


## To refresh the token:

Copy the refresh token that you receive from the above, into the following in place of VALUE_HERE:

```
curl -i -u client_id:client_secret \
   -X POST "https://ORG-ENV.apigee.net/devjam3/oauth2-ac/token" \
   -d 'grant_type=refresh_token&refresh_token=VALUE_HERE'

```

