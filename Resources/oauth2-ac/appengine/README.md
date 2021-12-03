# Example Login and Consent experience

To demonstrate Authorization Code or OpenID Connect logins,
this login experience needs to be available "in the cloud".

There are a couple ways to do it.

A. Run it as an AppEngine instance

B. Run it locally, and use ngrok to expose that to the internet



After you get it running, you need to do 2 things:

1. configure the oauth2-ac API proxy to redirect to the endpoint for the
   login-and-consent experience. The result should be something like this:
   
   ```
   <AssignMessage name="AM-RedirectToLoginApp">
       <AssignVariable>
           <Name>login_endpoint</Name>
           <!-- the beginning of this URL will be different for you. Also the tenant id.  -->
           <Template>https://7b5ce6bbb530.ngrok.io/tenants/test1/login?sessionid={messageid}</Template>
       </AssignVariable>
       <Set>
           <Headers>
               <Header name="Location">{login_endpoint}</Header>
           </Headers>
           <Payload contentType="text/plain">{login_endpoint}</Payload>
           <StatusCode>302</StatusCode>
           <ReasonPhrase>Found</ReasonPhrase>
       </Set>
       <IgnoreUnresolvedVariables>true</IgnoreUnresolvedVariables>
   </AssignMessage>
   ```
   
2. Register that API Proxy as a "tenant" in the login-and-consent experience.
   Choose a distinct id (make it up), and specify the base_uri.

   eg, 
   ```
   curl -i 0:5150/tenants -H content-type:application/json -d '{"id" : "test1", "base_uri": "https://myorg-test.apigee.net/devjam3" }'

   curl -i 0:5150/tenants -H content-type:application/json -d '{"id" : "test2", "base_uri": "https://api.my-whitelabel-domain.net/devjam3" }'
   ```

