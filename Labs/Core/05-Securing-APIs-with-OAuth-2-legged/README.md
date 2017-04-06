# API Security : Securing APIs with OAuth (2-legged) 

*Duration : 30 mins*

*Persona : API Team/Security*

# Use case

You have a set of APIs that are consumed by trusted partners. You want to secure those APIs using a two legged OAuth. 

# How can Apigee Edge help?

[The OAuth specification](https://tools.ietf.org/html/rfc6749) defines token endpoints, authorization endpoints, and refresh endpoints. Apps call these endpoints to get access tokens, to refresh access tokens, and, when using 3-legged OAuth, to kick off the authorization code flow.

Apigee Edge quickly lets you secure your APIs using out of the box OAuth policies. Apigee Edge OAuth policies 
can be used to implement the standard OAuth endpoints, and lets you easily secure your APIs using a simply policy to verify tokens.

# Background: What's a token?

An OAuth token is a digital analog of an old-school subway token: it's a "ticket to ride". The holder of an OAuth token (a client application) can present it to the token verifier (typically a gateway or a server application), and if the token is valid, then the token verifier will treat the request as valid. 

When you use Apigee Edge OAuth to protect your APIs, Apigee Edge acts as the token issuer and the token verifier. A 2-legged OAuth flow, also known as a client credentials grant type, looks like this: 

![image alt text](./media/2-legged_OAuth_flow.png)

Most typically, the client_credentials grant type is used when the app is also the resource owner. For example, an app may need to access a backend cloud-based storage service to store and retrieve data that it uses to perform its work, rather than data specifically owned by the end user. Imagine a mobile app that allows customers to place orders. The client credentials might be used to protect data that is not customer specific - like a query on the product catalog, or even populating an anonymously-held "shopping cart". 

As the name indicates, a client-credentials grant will verify only the credentials of the client, or the app itself. A Client credentials grant does not verify user credentials. 

When using the Client credentials grant type, Apigee Edge is the OAuth authorization server. Its role is to generate access tokens, validate access tokens, and proxy authorized requests for protected resources on to the resource server. 

# Pre-requisites

* You have an OAuth API proxy in Apigee Edge. This is API proxy is created by default when you provision an Edge instance on Cloud. If this does not exist, let your instructor know. 

* You have an API Proxy that is not currently secured.  If you do not have an API Proxy available for this lab, revisit the lab *API Design : Create a Reverse Proxy with OpenAPI Specification*.

* You have the following created on Apigee Edge - an API Product, a Developer and an App. If not, jump back to *API Security : Securing APIs with API Key* lab.

# Instructions

## Create the API Proxy 

1. First, download [this zip file](./code/apiproxy_xxx_oauth_protected.zip) to your local machine, by clicking the link, and then clicking "Download". Then return here.

2. Go to [https://apigee.com/edge](https://apigee.com/edge) and be sure you are logged in.

3. Select **Develop → API Proxies** in the side navigation menu

   ![image alt text](./media/Develop-Proxies.gif)

4. Click **+ Proxy**. The Build a Proxy wizard is invoked.

   ![](./media/Plus-New-Proxy.gif)

5. Select **Proxy bundle**. Click on **Next**, and then choose the zip file that you just downloaded.

   ![image alt text](./media/New-Proxy-Import-Bundle-Next.gif)

2. Specify the name for the new proxy, using your initials..., and click **Next**

   ![image alt text](./media/use-your-initials-click-next.png)

2. Then click **Build**

   ![image alt text](./media/click-build.png)

2. Once the API proxy has been built, **click** the link to view your proxy in the proxy editor. 

2. You should see the proxy **Overview** screen. 

2. Click the **Develop** tab.

   ![image alt text](./media/click-the-develop-tab.png)

   This shows you the contents of the API Proxy definition. This is just a pass-through proxy. There are no logic steps on this proxy, yet. 

3. Select the Proxy name and Update the display name with your initials.

   ![image alt text](./media/update-display-name.gif)

4. Select the Proxy Endpoint and update the basepath, similarly.

   ![image alt text](./media/update-basepath.gif)

2. Select **PreFlow** from the sidebar under **Proxy Endpoints** section.

   ![image alt text](./media/select-preflow.png)

2. Click on **+Step**

   ![image alt text](./media/add-a-step.png)

2. In the resulting dialog, scroll down select **OAuth v2.0** from the Security section then click the **Add** button.

   ![image alt text](./media/select-oauth2.gif)

2. Click on the policy and in the code editor, paste the code given below:

   ```
   <OAuthV2 name="OAuth-v20-1">
      <DisplayName>OAuth v2.0-1</DisplayName>
      <ExternalAuthorization>false</ExternalAuthorization>
      <Operation>VerifyAccessToken</Operation>
      <GenerateResponse enabled="true"/>
   </OAuthV2>
   ```

   It should look like this: 

   ![image alt text](./media/should-look-like-this.png)

2. Because we want Apigee to not pass the token to the backend API, let's remove the Authorization header. To do so, again click on **+Step**.

2. In the dialog, select **Assign Message** policy from the Mediation section then click the **Add** button.

   ![image alt text](./media/add-another-step-assign-message.gif)

2. Click on the policy and in the code editor, paste the code give below

   ```
   <AssignMessage name="Assign-Message-1">
     <DisplayName>Assign Message-1</DisplayName>
     <Remove>
        <Headers>
           <Header name="Authorization"/>
        </Headers>
     </Remove>
     <IgnoreUnresolvedVariables>true</IgnoreUnresolvedVariables>
     <AssignTo createNew="false" transport="http" type="request"/>
   </AssignMessage>
   ```

   It should look like this:

   ![image alt text](./media/screenshot-20170403-175612.png)


2. Click the blue **Save** button to save the proxy.

2. *Congratulations!*...You’ve now successfully created an API in Apigee Edge that is protected with OAuth 2.0.

2. Use the Deployment dropdown to deploy it on the **test** environment.

   ![image alt text](./media/deploy-on-test.gif)
  

## Create the API Product 

To test the API Proxy, we need to expose that proxy via an API Product, and generate a new developer app. First, the product.

1. In the Apigee UI, select **Publish → API Products** from the side navigation menu

   ![image alt text](./media/select-publish-apiproducts.gif)

2. Click **+API Product**

   ![image alt text](./media/click-plus-apiproduct.png)

3. Populate the following fields

    * Section: Product Details

        * Name: **{your_initials}**_oauth_product

        * Environment: test

        * Access: Public

        * Allowed OAuth Scopes: A,B,C

    * Section: Resources

        * Section: API Proxies

            * Click the **+API Proxy** button
            
              ![image alt text](./media/add-a-proxy-to-a-product.png)

            * Select the API Proxy you just created.

4. Click the blue **Save** button on the bottom right corner of the page, to save the API Product.
  
   There is now a new, consumable unit of APIs available to external (consuming) developers. 

   Side note: What is an OAuth scope?  A scope is something you can attach to an OAuth token that
   stipulates or limits the authorization associated to the token.  For example, you could define
   READ and WRITE scopes on a single resource.  Or, you could imagine a 2x2 matrix of {READ,WRITE} and {RESOURCE1,RESOURCE2}.
   A user may wish to grant READ access to an app (let's say, ability to read a "favorites list"),
   or WRITE access to the app (eg, ability to update the "favorites list"). For more on OAuth scopes,
   please see [this article](https://www.oauth.com/oauth2-servers/scope/defining-scopes/).

   Apigee Edge allows you to define any set of scopes that *can be* attached to a token, and allows
   users the ability to restrict the set of scopes they grant to an app. 
   

## Create the App 

1. Click **Publish → Apps** in the side navigation

   ![image alt text](./media/select-publish-apps.gif)

2. Click **+App**

   ![image alt text](./media/click-plus-apps.png)

3. Populate the following fields

    * Name: **{your_initials}-oauth-app

    * Developer: (choose any available developer)

    * Product: Click **+Product** to add your API Product to this App.

   ![image alt text](./media/select-api-product.gif)

4. In the lower right corner, click the blue **Save** button.


## Get the client credentials

Now, obtain the consumer key and secret for the app, and encode them. 

1. In the apps list, select the app that you just created

2. Click on the show button under Consumer Key and Consumer Secret.

3. Copy the values and store them somewhere safe.

4. To get the encoded value, visit a bas64 encoder site, like [this one](http://base64encode.net/).

   Paste in the value of the consumer key, followed by a colon, followed by the consumer secret.
   For example if the consumer key is ABCDE and the consumer secret is 12345, you would paste in
   ```
   ABCDE:12345
   ```

   There should be no spaces or newlines. 

   Mac and Linux users, you can do this from the command prompt. Open **Terminal** and type the following command:

   ```
    echo -n ABCDE:12345 | base64
   ```

   ...obviously replacing the value of your consumer key and secret as approprpiate.
   
   **Note**: For those who like to skim instructions (you know who you are). The -n in the above command is important. You need to include the -n.  Without -n, the echo command will append a newline, and the string that is base64-encoded will be different - the client_secret will include a newline.  So, *don't forget the -n*. 

5. Save the resulting base64-encoded value. It will look something like this:

   ```
   bHE0ZpcVR3MXNpMDl3c29jTTdBak9CU2J5aTQ1aUE6N0F2b3pFamhBOGRkeEQ3Yg==
   ```


## Test the app

Now, let’s test the deployment using the [Apigee REST Client](https://apigee-rest-client.appspot.com/). (You can also use Postman or Paw or any other rest client tool that you know)


1. In the Apigee UI, Navigate to Develop...Proxies...

2. Select the API Proxy called "oauth2-cc" or similar. This is a proxy that was previously configured for you. Everyone will use this same proxy. (This is not a proxy you configured today). 

3. From the Proxy overview panel, copy the URL for your OAuth API proxy. 

   ![image alt text](./media/copy-the-oauth-proxy-url.png)

   The url should end with oauth2-cc; we use cc here to imply client credentials.

2. Open the [Apigee REST Client](https://apigee-rest-client.appspot.com/) in a new browser window.

3. Obtain an access token. Specify these settings:

   * url endpoint: https://YOURORG-test.apigee.net/devjam3/oauth2-cc/token
   * method: POST
   * Body: parameter: `grant_type` value: `client_credentials`
   * Header: `Authorization: Basic **{base64 encoded client credentials value}**`
   
   For the value in the header, use the base64 encoded value of consumer key and secret pair that you obtained previously.

   ![image alt text](./media/rest-client-token.gif)

4. Click **Send** and you should see a response like this below. Then, copy the value for access token.

   ![image alt text](./media/the-access-token.png)

4. Now, you should be able to get the employees list using the access token that we just obtained. Copy the URL for the OAuth protected proxy you created earlier in this lab.

   ![image alt text](./media/copy-the-proxy-url.png)

4. Paste the URL in the REST client, add the Authorization header and send a **GET** request . The value for Authorization header will be the word "Bearer" followed by the access token that we obtained previously.

   ```
   Authorization: Bearer {access_token}
   ```

   ![image alt text](./media/image_13.png)

4. Hit **Send** and you should see a response like this below. 

   ![image alt text](./media/image_14.png)

4. If you alter the token in the Authorization header (remove a character) and then send another request, you will see a 401 Unauthorized, and a "Invalid Access Token" message.

4. If you remove the Authorization header and send another request, you will see a similar 401 Unauthorized error. 



# Lab Video

If you are lazy and don’t want to implement this use case, it’s OK. You can watch this short video to see how to implement 2 legged OAuth on Apigee Edge [https://youtu.be/0pah5J7yQTQ](https://youtu.be/0pah5J7yQTQ) 

# Earn Extra-points

Now that you’ve learned how to secure your API with OAuth 2.0, try to control the expiry of the access token that is generated.

# For Discussion

1. What are the various OAuth 2.0 grant types supported by Apigee Edge?

2. What are the various operations that are provided by the OAuth v2.0 policy?

3. Suppose an app has a token obtained via a client_credentials grant; what does the token authenticate?

4. How would you go about getting a token that authenticated the end user?


# Summary

In this lab you learned how to secure your API using a two legged OAuth by using the default oauth proxy obtaining an access code and using that against your API.

# References

* Link to Apigee docs page

  * OAuth 2.0: Configuring a new API proxy [http://docs.apigee.com/api-services/content/understanding-default-oauth-20-configuration ](http://docs.apigee.com/api-services/content/understanding-default-oauth-20-configuration)

  * Secure an API with OAuth [http://docs.apigee.com/tutorials/secure-calls-your-api-through-oauth-20-client-credentials](http://docs.apigee.com/tutorials/secure-calls-your-api-through-oauth-20-client-credentials) 

* [Link](https://community.apigee.com/topics/oauth+2.0.html) to Community posts and articles with topic as "OAuth 2.0" 

* Search and Revoke tokens - [https://community.apigee.com/articles/1571/how-to-enable-oauth-20-token-search-and-revocation.html](https://community.apigee.com/articles/1571/how-to-enable-oauth-20-token-search-and-revocation.html)

# Rate this lab

How did you link this lab? Rate [here](https://drive.google.com/open?id=1L95jU79wmOP-rHVY2Laba8lApZpS-yztwdONz0nCzWs).

