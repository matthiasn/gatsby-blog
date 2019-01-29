---
layout: post
title: "Play Framework, Server Sent Events and Internet Explorer"
date: "2014-06-09"
comments: true
categories: 
---

Next week I will be presenting at **[Scala Days](http://scaladays.org)**. In my talk I will discuss how to build reactive applications with two-way (near) real-time communication, using the combination of **[Server Sent Events](http://dev.w3.org/html5/eventsource/)** to provide clients with updates and **[REST calls](http://en.wikipedia.org/wiki/Representational_state_transfer)** for the backchannel. You may already be familiar with two examples of this architecture: **[BirdWatch](https://github.com/matthiasn/BirdWatch)** and **[sse-chat](https://github.com/matthiasn/sse-chat)**. I am now thinking about potential questions in the Q&A session after the talk. One potential issue that came to mind almost immediately was the support for **[Internet Explorer](http://en.wikipedia.org/wiki/Internet_Explorer)**. Out of the box, IE does not support **[Server Sent Events](http://dev.w3.org/html5/eventsource/)**. Personally, I do not care very much about IE support. I had not used it in years before I started researching for this article, and only a low single-digit percentage of visitors on my blog use IE. But I understand this can be a showstopper. So if you don't care about IE support at all, you really don't need to read any further. Otherwise, bear with me.

So I started looking for polyfills and found **[this one](https://github.com/Yaffle/EventSource)**. From the description, it should work right away with IE 10 and above, with no changes to the server side required. What I am presenting in this article is a rather blunt fix, changing the JavaScript from the forked polyfill so that:

* The **global EventSource object** is only ever replaced if it doesn’t exist. That way I don’t have the burden of having to check if this implementation works with all currently available browser versions (and those to come). Rather, the global EventSource object from the polyfill is only created in Internet Explorer.
* The check for the "correct" **ContentType** is removed. Out of the box it did not work with Play Framework, but without this check it does. I didn’t care much about changing the ContentType on the server side just to make the polyfill happy. 

Let's have a quick look at the code modifications. They are really short.

````js
/** modified by Matthias Nehlsen on June 9th, 2014 to add 
 *  check without changing the indentation of the rest of 
 *  the file so that changes can more easily be tracked. */
(function (global) {
"use strict";
if (!global.EventSource) { (function (global) {
````
[Conditional Execution of Anonymous Function](https://github.com/matthiasn/EventSource/blob/9d1a842c6dbd11213c0fa73505da9ba6190de000/eventsource.js)

The block above ensures that the anonymous function creating / replacing the global EventSource object is really only executed when there is no such global object. This is done by wrapping the anonymous function creating the EventSource object in another anonymous function that does the check. The global EventSource is then created below:

{% codeblock Creating a global EventSource object lang:javascript https://github.com/matthiasn/EventSource/blob/9d1a842c6dbd11213c0fa73505da9ba6190de000/eventsource.js eventsource.js (lines 481 to 482)%}
```
   console.log("Using EventSource PolyFill");
   global.EventSource = EventSource;`
````

The only other thing to note is that a check for the expected *ContentType* was disabled as it was incompatible with the out-of-the box behavior of Play Framework's EventSource implementation:

{% codeblock Check for expected ContentType lang:javascript https://github.com/matthiasn/EventSource/blob/9d1a842c6dbd11213c0fa73505da9ba6190de000/eventsource.js eventsource.js (lines 225 to 227)%}
```
/** modified by Matthias Nehlsen on June 9th, 2014 to 
 *  remove incompatible ContentType type check. */
//if (status === 200 && contentTypeRegExp.test(contentType)) {
if (status === 200) {
````

Then finally all there is left to do is load this modified polyfill in the application, like this:

{% codeblock Loading polyfill in Play Framework View lang:html https://github.com/matthiasn/BirdWatch/blob/c0ad30aea35937d624b103ff3b43dab252af7750/app/views/index.scala.html index.scala.html (line 141)%}
```
<script src="/assets/javascripts/vendor/eventsource.js"></script>
````

With this JavaScript file loaded in the client side application, the application now works with Internet Explorer 10 and 11, with the potential of supporting versions 8 and 9 as well, should someone care to help. Supposedly, some padding at the beginning of an SSE connection is needed. I have no idea how to add this 2K padding, but maybe you, the reader, know how to achieve this? If so, please help. Thanks in advance. I will not fix this, instead I will side with Google. They have dropped support for IE 9 and below **[last year](http://googleappsupdates.blogspot.de/2013/11/end-of-support-for-internet-explorer-9.html)** and I am fine with supporting what Google supports.

Great. Much better than having to answer “sorry, IE is not supported at all”. Blaming Microsoft alone is not going to help much when your client demands just this particular support. Now if you want to use this architecture for a reactive application and your pointy-haired boss comes along, demanding support for IE, you can put a smile on your face.

I am happy to have this potential showstopper out of the way. I've been meaning to address this problem for a while, I just dreaded the logistics of setting up a testing environment for IE, and that part was about as annoying as expected. I had to dig out an old Windows 7 image for VMWare Fusion, copy the 40GB over rather slow Wi-Fi and then do all the due updates, with multiple restarts of the VM, of course. Oh how I have missed Windows. I had almost forgotten. How can it take hours to load the updates that make me eligible for IE 10 alone? Anyhow, that's about as much exposure to Internet Explorer as I can deal with for the moment. With Internet 10 and 11, the core functionality with the Server Sent Events works fine now. 

The **[Rickshaw](http://code.shutterstock.com/rickshaw/)** time series chart on the upper right in BirdWatch does not seem to work in IE, but that's not part of the proof that the proposed architecture works with newer versions of IE. I do not plan on spending any more time making IE 8 and 9 work, but in theory it sounds like that would be possible, at least according to the documentation of **[Yaffle's](https://github.com/Yaffle)** **[polyfill](https://github.com/Yaffle/EventSource)**. Please feel free to fix this in case you know a solution. There's a **[fork](https://github.com/matthiasn/EventSource)** of the polyfill that would happily accept pull requests. Thank you.

Okay, until next time, I hope to see you at Scala Days. Say hi when you see me, please.
Matthias

<iframe width="160" height="400" src="https://leanpub.com/building-a-system-in-clojure/embed" frameborder="0" allowtransparency="true"></iframe>