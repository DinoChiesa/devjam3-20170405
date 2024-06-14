# Example Login and Consent experience

This is an example login-and-consent app that can work with the example API proxy to demonstrate a 3-legged OAuth flow.

To demonstrate Authorization Code or OpenID Connect logins,
this login experience needs to be available as a web app.

There are different ways to do it.

A. Run it locally, and use localhost to reach it.
  This will allow logins only from your workstation.

B. Run it locally, and use something like [ngrok](https://ngrok.com/) to expose
  that to the internet.

C. Run it as a Cloud Run service





## Option A: Running locally

In a terminal:
```
npm install

node ./login-and-consent.js
```

The service listens on localhost:5150.  That is the domain that you need to use
when provisioning the Apigee assets (See the toplevel README).

## Option B: Running locally and exposing via `ngrok`

Do the same as above, but
in a second terminal, run ngrok:
```
ngrok 5150
```

Note the address from ngrok. That will be the domain that you need to use
when provisioning the Apigee assets (See the toplevel README).

## Option C: Deploying the Service into Cloud Run

```
REGION=us-west1
gcloud run deploy login-and-consent-example \
  --source . \
  --concurrency 1 \
  --cpu 1 \
  --memory '256Mi' \
  --min-instances 0 \
  --max-instances 1 \
  --platform managed \
  --region "${REGION}" \
  --timeout 300
```

Note the address printed at the end. That will be the domain that you need to use
when provisioning the Apigee assets (See the toplevel README).


# After starting the service

Return to the toplevel readme and run the provision.js script.


# Re-registering the tenant

When you run the provision script for the first time, the
script registers a tenant with the login-and-consent experience.
But if you are running the login-and-consent.js server locally, and
stopping and restarting it, you will need to re-register the
tenant after restart.

To do that, choose one of these options:

* if running locally:
   ```
   curl -i 0:5150/tenants -H content-type:application/json -d '{"id" : "5gdev", "base_uri": "https://my.apigee-endpoint.net/apigee-examples" }'
   ```

* If using Cloud Run
   ```
   curl -i https://my-login-app.a98d98d9.run/tenants -H content-type:application/json -d '{"id" : "5gdev", "base_uri": "https://api.my-whitelabel-domain.net/apigee-examples" }'
   ```


# To get the list of known users and their passwords

```
curl -i 0:5150/tenants/5gdev/users
```

You can use any of those passwords in the login-and-consent screen.
