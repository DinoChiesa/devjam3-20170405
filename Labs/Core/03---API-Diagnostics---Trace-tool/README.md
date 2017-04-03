# API Diagnostics : Trace Tool

*Duration : 20 mins*

*Persona : API Team / DevOps*

# Use case

One of your team members is complaining that an API call is sporadically returning an error. You are being asked to help diagnose the issue.

# How can Apigee Edge help?

The Trace component in Edge is a powerful tool for troubleshooting and monitoring API proxy behavior. Trace provides a visualization which outlines each logical step in an API proxy flow -- policies in the request or response, routing, transformation, and so on.  With the Trace UI, you can drill into each step to understand its impact on proxy behavior.  You can also filter your view to zero in on specific requests, and you can export your Trace session for non-real-time analysis and diagnostic efforts.

In this lab, we will configure your proxy to expect a new query parameter -- called "initials" (your initials).  We will then use the trace tool to find the root cause of a 404 error, filtering the view to show only those requests containing your initials.

# Pre-requisites

You have an API proxy created in Apigee Edge.  If not, jump back to the [Create a Reverse Proxy](../01---API-Development---Create-a-Reverse-Proxy) lab.

# Instructions

## Part 1 - Configure API Proxy

* Go to [https://apigee.com/edge](https://apigee.com/edge) and be sure you are logged in. This is the Edge management UI.

* Select **Develop → API Proxies** in the side navigation menu

  ![image alt text](./media/Select-apiproxies.gif)

* Select the **{your_initials}_reverse_proxy** that you created in an earlier lab exercise. 

* Click on the **Develop** tab to access the API Proxy development dashboard.

  ![image alt text](./media/navigate-to-develop-tab.png)

* Click on **PreFlow** under Proxy Endpoints default, Click on **+Step** on the Request flow to attach an *Extract Variables* policy.

  ![image alt text](./media/preflow-plus-step.gif)

* In the dialog that is presented, scroll down about 75%, and select **Extract Variables Policy**. Specify "Extract Inbound Initials" for the Display Name, and click on the **Add** button to add the Extract Variables policy.  
  Note: The Extract Variables policy icon is visible on the request flow and shows exactly where the policy is attached. The corresponding XML (in keeping with Edge’s config-then-code approach) can be seen in an edit pane below.

* Change the Policy XML configuration to match the code below. The modified proxy will then extract the inbound query parameter into a separate context variable, available for proxy processing. 

  Note: Paste the following code without change. 

  ```
  <ExtractVariables name="Extract-Initials">
      <DisplayName>Extract Inbound Initials</DisplayName>
      <Properties/>
      <QueryParam name="initials">
          <Pattern ignoreCase="true">{alphaid}</Pattern>
      </QueryParam>
  </ExtractVariables>
  ```

  It should look like this:
  ![image alt text](./media/EV-policy-should-look-like-this.png)
  
* Click the blue **Save** button to save your proxy. Wait for it to successfully deploy. 


## Part 2 - Trace and Troubleshoot

Consider a scenario where one of your API consumers reports seeing 404 errors in response to their requests.  How would you get to the bottom of this issue?  The Trace tool allows you to isolate that user’s requests and step through proxy logic one step at a time.  Let’s send some traceable requests -- note the failure -- and attempt to understand why it’s failing.

* Click on the **TRACE** tab to access the real-time API Trace tool.

* Locate the URL field and append the following to the end

```
/da94d538-d793-11e6-a734-122e0737977dAAA?initials={your initials}
```

* Update above *{your initials}* with your actual initials and remove the braces.

* Click the green **Start Trace Session** button, then click **Send**. Note a trace log is captured, with a 404 response.  

* Step through the visualization, clicking points of interest along the request/response flow and taking note of the metadata provided at the bottom of the screen.

        **Trace-Step 1:** Extract Variables Policy

        **Trace-Step 2:** Request sent to target

        **Trace-Step 3:** Response returned from target

* *Congratulations!*  You’ve found the problem.  Your target service cannot find an entity with the ID provided (7ed25ec5-c89f-11e6-861b-0ad881f403bfaaa).  This is a trivial example, but you can see how the tool -- providing before and after insight into message, query, and header contents -- would be of immense use in diagnosing malformed requests and other common issues.

* Edit your URL field once more to follow the pattern below

```
/da94d538-d793-11e6-a734-122e0737977d?initials={your initials}
```

* Update above {your initials} with your actual initials & remove the braces

* Click the **Send** button again.

* Note - this time, your request returns a valid JSON response.

## Part 3 - Filtering

Now, imagine troubleshooting this issue - except with hundreds or thousands of requests flowing through the system at a given time.  Fortunately, the Trace tool can filter its real-time capture so that it only shows entries with a given query or header parameter.

* Click the red **Stop Trace Session** button.  

* Expand the filters pane on the left side of your screen.  Then add a query parameter filter named ‘initials’.  Put your initials in the value column and ensure the URL also holds your initials, like before.

```
/da94d538-d793-11e6-a734-122e0737977d?initials={your initials}
```

* Click the green **Start Trace Session** button, then click the **Send** button again to fire another API call.  Note the captured trace entry.


* Update the URL with a new, fake value for the initials query parameter.  Example below.

```
/7ed25ec5-c89f-11e6-861b-0ad881f403bf?initials=xyz
```

* Click the **Send** button. 

Note: No matter how many times you click send, no new trace entry is captured!  This is expected behavior, as our filter is configured to only trace requests with your initials in the query.

* One more thing -- with your trace session still active, click the **Download Trace Session** button to export a record of the trace results.  You’ll need this for the extra credit.

So you’ve diagnosed a real-time problem with your API and distilled the information down to show only requests relevant to your investigation.  In a true-to-life scenario, you’d likely filter on API key or another, more sophisticated identifier than initials.

# Lab Video

If you prefer to learn by watching, here is a video lab on using the Trace tool

[https://youtu.be/luCU2XTh5J0](https://youtu.be/luCU2XTh5J0)

# Earn Extra-points

Take a few minutes and explore the Trace interface a bit deeper.  Hover over the steps in the request/response visualization and note the Latency bubble that pops up, showing you how much time elapsed at that particular step.  Drill into the metadata in the bottom window.  Click the ‘Extract Variables’ policy and note that the initials you provided are shown as an extracted variable called ‘my_initials’.  

Finally, take a look at the exported trace session from the lab.  See if you can interpret the results -- imagine some scenarios where this export could be ingested into other tools for offline diagnostics.

# Quiz

1. Name two kinds of metadata the Trace tool provides you with.

2. What criteria can be used to filter Trace results?

# Summary

In this lab, you learned how to diagnose a reported problem with your API in real-time using the Trace tool.  You learned how to filter those results down to a relevant subset of data -- and how to export the results for later review. 

# References

* Apigee Docs: Trace.  [http://docs.apigee.com/api-services/content/using-trace-tool-0](http://docs.apigee.com/api-services/content/using-trace-tool-0)

* Apigee Community on Tracing: [https://community.apigee.com/topics/trace.html](https://community.apigee.com/topics/trace.html)

* Watch this 4minute video to learn about the Trace Tool

    * [https://community.apigee.com/articles/36248/apigee-4mv4d-api-proxy-trace-console.html](https://community.apigee.com/articles/36248/apigee-4mv4d-api-proxy-trace-console.html)

# Rate this lab

How did you link this lab? Rate [here](https://docs.google.com/a/google.com/forms/d/1Rc17-TqTtqfXgOu9SqYbVGyAzssnANftD2Hpspmr1KQ).

