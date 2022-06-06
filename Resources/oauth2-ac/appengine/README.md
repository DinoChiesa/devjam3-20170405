# Example Login and Consent experience

This is an example login-and-consent app that can work with the example API proxy to demonstrate a 3-legged OAuth flow.

To demonstrate Authorization Code or OpenID Connect logins,
this login experience needs to be available "in the cloud".

There are a couple ways to do it.

A. Run it as an AppEngine instance

B. Run it locally, and use something like [ngrok](https://ngrok.com/) to expose
that to the internet.


After you get it running, you need to do 2 things:

1. configure the oauth2-ac API proxy to redirect to the endpoint for the
   login-and-consent experience. The result should be something like this:

   If you are using ngrok:

   ```
   <AssignMessage name="AM-RedirectToLoginApp">
     <AssignVariable>
       <Name>domain-for-login-endpoint</Name>
       <Template>bbaa-50-35-230-49.ngrok.io</Template> <!-- use the hostname from ngrok -->
     </AssignVariable>
      ...
   ```

   If you are using AppEngine:

   ```
   <AssignMessage name="AM-RedirectToLoginApp">
     <AssignVariable>
       <Name>domain-for-login-endpoint</Name>
       <Template>my-login-app.appspot.com</Template> <!-- use the hostname from appengine -->
     </AssignVariable>
      ...
   ```
   Keep the rest of that policy the same.

2. Register that API Proxy as a "tenant" in the login-and-consent experience.
   Choose a distinct id (make it up), and specify the base_uri.

   eg, if using ngrok with Apigee Edge:
   ```
   curl -i 0:5150/tenants -H content-type:application/json -d '{"id" : "5gdev", "base_uri": "https://myorg-test.apigee.net/devjam3" }'
   ```

   If using ngrok with Apigee X or hybrid:
   ```
   curl -i 0:5150/tenants -H content-type:application/json -d '{"id" : "5gdev", "base_uri": "https://api.my-whitelabel-domain.net/devjam3" }'
   ```

   If using AppEngine with Apigee X or hybrid:
   ```
   curl -i https://my-login-app.appspot.com/tenants -H content-type:application/json -d '{"id" : "5gdev", "base_uri": "https://api.my-whitelabel-domain.net/devjam3" }'
   ```

3. At that point you can use the /authorize endpoint of the API proxy.

4. To get the list of known users and their passwords:
   ```
   curl -i 0:5150/tenants/5gdev/users
   ```
   You can use any of those passwords in the login-and-consent screen.
