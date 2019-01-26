---
layout: post
title: "Load Testing Server Sent Event Streams"
date: "2013-05-11"
comments: true
categories: 
---
**[Server Sent Events (SSE)](http://dev.w3.org/html5/eventsource/)** turned out to be a great choice for what I am **[trying to achieve](http://matthiasnehlsen.com/blog/2013/05/01/server-sent-events-vs-websockets/)**. Let's review that quickly. I want to transmit information in the form of **[JSON](http://tools.ietf.org/html/rfc4627)** containing information about Tweets to browsers, as fast as possible, with much less information flowing the other direction. Now I needed to benchmark the "as fast as possible" part so I would be more informed for future architectural decisions. For this I have started **[sse-perf](https://github.com/matthiasn/sse-perf)**: a reactive web application that consumes many (like thousands) concurrent SSE streams and then animates the results (MB transferred, messages / chunks per second and such) using **[D3.js](http://d3js.org)**.

<!-- more -->

In the current version of the **[BirdWatch](https://github.com/matthiasn/BirdWatch)** the major part of the statistical reasoning is done on the server side, individually for each client. That is not a good idea, it just happened because I had some of the code lying around, and that was in Scala so the options were server side or re-write. I chose server-side, knowing that this technical debt would have to be addressed at some point. First of all I needed metrics on how bad the situation actually was. I found a search word that guarantees high traffic up to the "1% of all Tweets at the time" limit imposed by Twitter: "love". At least at all times I have tested it, this cute word will saturate your **[Twitter Streaming API](https://dev.twitter.com/docs/streaming-apis)** connection, unless you have a special agreement with them. This amounts to about 35 Tweets per second or approximately 3,000,000 Tweets per day. Any modern server should easily be able to process this number of messages and distribute them to a large number of clients, hundreds of them at the same time. Unlike **[WebSocket](http://tools.ietf.org/html/rfc6455)** connections, **[Server Sent Events (SSE)](http://dev.w3.org/html5/eventsource/)** streams are easy to test; it is just an HTTP connection that delivers data not at once but one chunk at a time, like this:

{% codeblock One Tweet via SSE lang:javascript %}
data: {"tweet_id":334409665431625728,"img_url_local":"/images/334409665431625728.png","img_url":"http://a0.twimg.com/profile_images/3637039114/94d639a38a9040b32397642cddbf685f_normal.jpeg","screen_name":"Official_TMC101","text":"This week Daft Punk holds the number 1 spot with Get Lucky @DaftPunk_Online #getlucky","followers":34,"words":14,"chars":85,"timestamp":1368564451000,"timeAgo":"1 sec 141 ms ago"}
{% endcodeblock %}

You can see this yourself by opening the Tweet stream on my **[BirdWatch server](http://birdwatch.matthiasnehlsen.com/tweetFeedCF)**. This is one of the streams from a much-extended version of BirdWatch that I've been working on in the meantime, which allows interacting with the data in interesting ways on the client side. This version is not ready for publishing yet, but I expect to have something to show fairly soon. Pushing the Tweets to the client and reasoning about the data there was already decided on, and benchmarking confirmed how problematic the old solution was. At first I used wget in different terminal sessions with the URL of the link above, and I would max out the CPU with tens of concurrent connections already when consuming the full 1% of Tweets. That is orders of magnitude less than what I expect from a modern server, but completely makes sense when looking at what heavy work the server actually has to perform. 

So I started working on delivering streams for client side reasoning. That fixed exactly what I expected it to fix, allowing orders of magnitude more concurrent connections. But now opening many terminal sessions was a much less appealing workaround. I looked around for testing tools a little and soon realized that writing a reactive web application for load testing myself would be a good learning exercise, and it would also give me the opportunity for some more experience in using **[D3.js](http://d3js.org)** for animating the results. This it what it looks like (but with animated bar charts showing live data):

{% img left /images/sse-perf-screenshot.png 'image' 'images' %}

I have put the code on **[GitHub](https://github.com/matthiasn/sse-perf)** and I also run it live, putting a load of 1,500 connections on the BirdWatch server, in production. The server is not processing the full 1% stream though, and with the current load the 1,500 connections only cause a CPU utilization of 40-60% in **[top](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/top.1.html)** (out of possible 800% on a quadcore machine with HyperThreading). With the full 1% stream from Twitter I can currently connect up to 700 to 800 concurrent connections without adding significant delay, thus delivering about 1.8 Billion messages a day. That sounds much more like what I was looking for. I have found that the messages per second max out at around 28,000. If these are reached then additional clients will still get the messages but they will queue up more and more. I have found that the server recovers after decreasing the number of concurrent connections, allowing all messages to be delivered to the connected clients eventually. This makes the server fail on overload very gracefully.

**[Have a look for yourself](http://birdwatch.matthiasnehlsen.com:9001)**. Changing the load on the server requires authentication, but you will surely find this out yourself. 

In the next posts I will introduce animating live streaming data on the client and also share what I have learned when establishing thousands of connections at the same time, using **[WS](http://www.playframework.com/documentation/api/2.1.1/scala/index.html#play.api.libs.ws.WS$)** from the **[Play Framework](http://www.playframework.com)**. Let me know which one you would like to read first.

-Matthias

<iframe width="160" height="400" src="https://leanpub.com/building-a-system-in-clojure/embed" frameborder="0" allowtransparency="true"></iframe>