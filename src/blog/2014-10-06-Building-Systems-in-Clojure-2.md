---
layout: post
title: "Building a System in #Clojure 2 - Transducers"
date: "2014-10-06"
comments: true
categories: 
nosharing: true
---
**TL;DR:** This article covers the usage of **Transducers** in Clojure, spiced up with some **core.async**. Here's an animation that shows the information flow of the **composed transducer** that we are going to build in this article:

<script language="javascript" type="text/javascript">
  function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
    obj.style.width = obj.contentWindow.document.body.scrollWidth + 'px';
  }
</script>
<iframe width="100%;" src="/iframes/clj-system2/index.html" scrolling="no" onload="javascript:resizeIframe(this);" ></iframe>

<br/>
<br/>

If any of that is of interest to you at all (or if you want to see more animations like the one above), you may want to **read** the following article.

Hello and welcome back to this series of articles about building a system in **[Clojure](http://clojure.org/)**. The other week, we had a first look at dependency injection using the **[component library](https://github.com/stuartsierra/component)** combined with a hint of channel decoupling power. You may want to read **[that article first](http://matthiasnehlsen.com/blog/2014/09/24/Building-Systems-in-Clojure-1/)** if you haven’t done so already.

In this installment, we will look into the first component, the **twitter client**[^1]. It seems like the natural component to start with as it is our application’s point of entry for Twitter’s **[streaming data](https://dev.twitter.com/streaming/overview)**. We will have to discuss the lifecycle of the component at some point, but that can also happen next week. Today, we will look at transducers, a **[recent addition](http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming)** to Clojure. First of all, though, we will look at the problem at hand, without any language- or library-specific implementation details.

## Twitter Client
Let’s start in **[hammock mode](https://www.youtube.com/watch?v=f84n5oFoZBc)**, without code. What is the problem we are trying to solve? It all starts with the tweet stream from the Twitter API. Very briefly, the **[Twitter Streaming API](https://dev.twitter.com/docs/streaming-apis)** allows us to subscribe to a (near) real time stream of tweets that contain one or more terms out of a set of terms. In the live instance under **[http://birdwatch2.matthiasnehlsen.com](http://birdwatch2.matthiasnehlsen.com/#*)** these terms at the moment happen to be "Ferguson", "ISIS", and "Ebola" - I am interested in all these topics. As long as that subscription does not hit a hard ceiling of **1%** of all the tweets flowing through twitter’s system, we can be sure that we will retrieve all of them. Otherwise the stream will be throttled to a maximum of **1%** of what is tweeted at any moment in time. [^2]

Here is how that stream looks like when each chunk is simply printed to the console:

![animated gif of streaming API output](../images/streaming-api.gif)

For reasons unbeknownst to me, tweets stopped respecting the chunk borders for the last half year. Instead, tweets occasionally span two or three chunks. This makes processing the tweets a little more complicated than we might wish for. One tweet per chunk is straightforward: 

    Receive chunk -> parse JSON into map -> put on conveyor belt (channel)

That looks like functional programming, right? No state to be kept anywhere, just functions producing results that are passed into other functions. But as desirable as that sounds, it does not align with reality. Instead, we need logical reasoning and state. What is the instruction we would give a sentient being? Imagine an intelligent agent standing between two conveyor belts. Imagine that agent being you. Here we go:

“On your left side, there’s a conveyor belt that keeps delivering hundred dollar bills. Put all of them on the other conveyor belt. Some of them come out cut into multiple pieces. These fragments are in correct order. Scotch tape is over there.”

I think we would all know what to do. There is a space where you park fragments of not-yet-complete bills / tweets. Then, with every new fragment, you inspect if the bill is complete and if so, put it back together and pass it on. Let’s try that in code. First, we will need to introduce **transducers** though.

## Transducers

>Transducers are a powerful and composable way to build algorithmic transformations that you can reuse in many contexts, and they're coming to Clojure core and core.async.
[Cognitect Blog, August 6, 2014](http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming)

In a way, a transducer is the **essence** of a computation over data, without being bound to any kind of collection or data structure. Above, before we had to concern ourselves with the incomplete fragments, there was one step of the computation that we could **model as a transducer**: the part where we wanted to parse JSON into a map data structure. 

Imagine we wanted to transform a vector of JSON strings into a vector of such parsed maps. We could simply do this:

````clojure
(map json/read-json ["{\"foo\":1}" "{\"bar\":42}"])
````

However, the above is bound to the data structure, in this case a vector. That should not have to be the case, though. Rich Hickey provides a good example in his **[transducers talk](https://www.youtube.com/watch?v=6mTbuzafcII)**, likening the above to having to tell the guys processing luggage at the airport the same instructions twice, once for trolleys and again for conveyor belts, where in reality that should not matter. 

We could, for example, not only run the mapping function over every item in a vector but also reuse the same function on every item in a channel, stream or whatever.

With Clojure 1.7, we can now create such a transducing function by simply leaving out the data structure:

````clojure
(def xform (map json/read-json))
````

Now, we can apply this transducing function to different kinds of data structures that are transducible processes. For example, we could transform all entries from a vector into another vector, like so:

````clojure
(into [] xform ["{\"foo\":1}" "{\"bar\":42}"])
````

Or into a sequence, like this:

````clojure
(sequence xform ["{\"foo\":1}" "{\"bar\":42}"])
````

It may not look terribly useful so far. But this can also be applied to a channel. Say, we want to create a channel that accepts JSON strings and transforms each message into a Clojure map. Simple:

````clojure
(chan 1 xform)
````

The above creates a channel with a buffer size of one that applies the transducer to every element.

But this does not help in our initial case here, where we know that some of the chunks are not complete but instead have to be glued together with the next one or two pieces. For that, we will need some kind of **state**. In the example above, that would be the space where we place fragments of a hundred dollar bill. But what if we want to see this aggregation process as a **black box**? Then, the aggregation cannot really have outside state. Also, as Rich Hickey mentioned in his StrangeLoop talk, there is no space in the machinery to keep state. What if one such transducer could have local state even if that is contained and not accessible from the outside? It turns out this is where stateful transducers can help.

Here’s how that looks like in code:

````clojure
(defn- streaming-buffer []
  (fn [step]
    (let [buff (atom "")]
      (fn
        ([r] (step r))
        ([r x]
         (let [json-lines (-> (str @buff x) (insert-newline) (str/split-lines))
               to-process (butlast json-lines)]
           (reset! buff (last json-lines))
           (if to-process (reduce step r to-process) r)))))))
````
[stateful streaming-buffer transducer](https://github.com/matthiasn/BirdWatch/blob/f39a5692e4733784124d0f0930202d4270762d77/Clojure-Websockets/src/clj/birdwatch/twitterclient/processing.clj)

Let's go through this line by line. We have a (private) function named **streaming-buffer** that does not take any arguments. It returns a function that accepts the step function. This step function is the function that will be applied to every step from then on. This function then first creates the local state as an atom[^3] which we will use as a buffer to store incomplete tweet fragments. It is worth noting that we don't have to use **atoms** here if we want to squeeze out the last bit of performance, but I find it easier not to introduce yet another concept unless absoletely necessary[^4]. Next, this function returns another function which accepts two parameters, r for result and x for the current data item (in this case the - potentially incomplete - chunk). 

In the first line of the let binding, we use the **[-> (thread-first)](http://clojuredocs.org/clojure.core/-%3E)** macro. This macro makes the code more legible by simply passing the result of each function call as the first argument of the next function. Here, specifically, we **1)** concatenate the buffer with the new chunk, **2)** add newlines where missing[^5], and **3)** split the string into a sequence on the line breaks.

Now, we cannot immediately process all those items in the resulting sequence. We know that all are complete except for the last one as otherwise there would not have been a subsequent tweet. But the last one may not be complete. Accordingly, we derive

````clojure
(butlast json-lines)
````
 
under the name **to-process**. Then, we reset the buffer to whatever is in that last string: 

````clojure
(reset! buff (last json-lines))
````

Finally, we have **reduce** call the **step** function for every item in **to-process**:

````clojure
(if to-process (reduce step r to-process) r)
````

That way, only complete JSON strings are pushed down to the next operation, whereas intermediate JSON string fragments are kept locally and not passed on until certainly complete. That's all that was needed to make the tweets whole again. Next, we compose this with the JSON parsing transducer we have already met above so that this **streaming-buffer** transducer runs first and passes its result to the **JSON parser**.

Let's create a vector of JSON fragments and try it out. We have already established that transducers can be used on different data structures, it therefore should work equally well on a vector. Here's the vector for the test:

````clojure
["{\"foo\"" ":1}\n{\"bar\":" "42}" "{\"baz\":42}" "{\"bla\":42}"]
````

Now we can check on the REPL if this will produce three complete JSON strings. It is expected here that the last one is lost because we would only check its completeness once there is a following tweet[^6]. Once the collection to process is empty, the **arity-1** (single argument) function is called one last time, which really only returns the aggregate at that point:

    birdwatch.main=> (in-ns 'birdwatch.twitterclient.processing)
    #<Namespace birdwatch.twitterclient.processing>
    
    birdwatch.twitterclient.processing=> (def chunks ["{\"foo\"" ":1}\n{\"bar\":" "42}" "{\"baz\":42}" "{\"bla\":42}"])
    #'birdwatch.twitterclient.processing/chunks
    
    birdwatch.twitterclient.processing=> (into [] (streaming-buffer) chunks)
    ["{\"foo\":1}" "{\"bar\":42}" "{\"baz\":42}"]

What somewhat confused me at first is what the step function actually was. Let's find out by printing it when the arity-1 function is called. We can modify the fourth line of **stream-buffer** like this:

````clojure
([r] (println step) (step r))
````

Now when we run the same as above on the REPL, we can see what the step function actually is:

    birdwatch.twitterclient.processing=> (into [] (streaming-buffer) chunks)
    #<core$conj_BANG_ clojure.core$conj_BANG_@5fd837a>
    ["{\"foo\":1}" "{\"bar\":42}" "{\"baz\":42}"]

Interestingly, the step function is **conj!** which according to the **[source](https://github.com/clojure/clojure/blob/clojure-1.7.0-alpha2/src/clj/clojure/core.clj#L3208)** adds **x** to a **transient collection**[^7].

The step function is different when we use the transducer on a channel, but more about that when we use it in that scenario.

There's more to do before we can **compose all transducers** and attach them to the appropriate channel. Specifically, we can receive valid JSON from Twitter, which is not a tweet. This happens, for example, when we get a notification that we lag behind in consuming the stream. In that case we only want to pass on the parsed map if it is likely that it was a tweet and otherwise log it as an error. There is one **key** that all tweets have in common, which does not seem to appear in any status messages from Twitter: **:text**. We can thus use that key as the **predicate** for recognizing a tweet:

````clojure
(defn- tweet? [data]
  "Checks if data is a tweet. If so, pass on, otherwise log error."
  (let [text (:text data)]
    (when-not text (log/error "error-msg" data))
    text))
````
[tweet? predicate function](https://github.com/matthiasn/BirdWatch/blob/f39a5692e4733784124d0f0930202d4270762d77/Clojure-Websockets/src/clj/birdwatch/twitterclient/processing.clj)

Next, we also want to log the count of tweets received since the application started. Let's do this only for full thousands. We will need some kind of counter to keep track of the count. Let's create another **stateful transducer**:

````clojure
(defn- log-count [last-received]
  "Stateful transducer, counts processed items and updating last-received atom. Logs progress every 1000 items."
  (fn [step]
    (let [cnt (atom 0)]
      (fn 
        ([r] (step r))
        ([r x]
         (swap! cnt inc)
         (when (zero? (mod @cnt 1000)) (log/info "processed" @cnt "since startup"))
         (reset! last-received (t/now))
         (step r x))))))
````
[stateful count transducer](https://github.com/matthiasn/BirdWatch/blob/f39a5692e4733784124d0f0930202d4270762d77/Clojure-Websockets/src/clj/birdwatch/twitterclient/processing.clj)

This transducer is comparable to the one we saw earlier, except that the local atom now holds the count. Initially, the counter is incremented and then, when the counter is divisible by 1000, the count is logged. In addition, this function also resets the **last-received** timestamp. Of course, this could be factored out into a separate function, but I think this will do.

Now, we can compose all these steps:

````clojure
(defn process-chunk [last-received]
  "Creates composite transducer for processing tweet chunks. Last-received atom passed in for updates."
  (comp
   (streaming-buffer)
   (map json/read-json)
   (filter tweet?)
   (log-count last-received)))
````
[composed transducer](https://github.com/matthiasn/BirdWatch/blob/f39a5692e4733784124d0f0930202d4270762d77/Clojure-Websockets/src/clj/birdwatch/twitterclient/processing.clj)

The above creates a composed function that takes the timestamp atom provided by the TwitterClient component as an argument. We can now use this **transducing function** and apply it to different data structures. Here, we use it to create a channel that takes tweet chunk fragments and delivers parsed tweets on the other side of the conveyor belt. 

Let's try the composed transducer on a vector to see what's happening. For that, we create a vector with two JSON strings that contain the **:text** property and two that don't. 

````
["{\"text\"" ":\"foo\"}\n{\"text\":" "\"bar\"}" "{\"baz\":42}" "{\"bla\":42}"])
````

Then we should see that the invalid one is logged and the other two are returned (the final one at that point still in the buffer):

    birdwatch.main=> (in-ns 'birdwatch.twitterclient.processing)
    #<Namespace birdwatch.twitterclient.processing>
    
    birdwatch.twitterclient.processing=> (def chunks ["{\"text\"" ":\"foo\"}\n{\"text\":" "\"bar\"}" "{\"baz\":42}" "{\"bla\":42}"])
    #'birdwatch.twitterclient.processing/chunks
    
    birdwatch.twitterclient.processing=> (into [] (process-chunk (atom (t/epoch))) chunks)
    20:57:39.999 [nREPL-worker-1] ERROR birdwatch.twitterclient.processing - error-msg {:baz 42}
    [{:text "foo"} {:text "bar"}]

Great, we have a composed transducer that works on vectors as expected. According to Rich Hickey this should work equally well on channels. But let's not take his word for it and instead try it out. First, here's my attempt to visualize the usage of a transducer in a channel. To make things easier, no errors occur.

<iframe width="100%;" src="/iframes/clj-system2/channel.html" scrolling="no" onload="javascript:resizeIframe(this);" ></iframe>

Now for a simple example in the REPL:

    birdwatch.main=> (in-ns 'birdwatch.twitterclient.processing)
    #<Namespace birdwatch.twitterclient.processing>
        
    birdwatch.twitterclient.processing=> (def chunks ["{\"text\"" ":\"foo\"}\r\n{\"text\":" "\"bar\"}" "{\"baz\":42}" "{\"bla\":42}"])
    #'birdwatch.twitterclient.processing/chunks

    birdwatch.twitterclient.processing=> (require '[clojure.core.async :as async :refer [chan go-loop <! put!]])
    nil
    
    birdwatch.twitterclient.processing=> (def c (chan 1 (process-chunk (atom (t/now)))))
    #'birdwatch.twitterclient.processing/c
    
    birdwatch.twitterclient.processing=> (go-loop [] (println (<! c)) (recur))
    #<ManyToManyChannel clojure.core.async.impl.channels.ManyToManyChannel@2f924b3f>
    
    birdwatch.twitterclient.processing=> (put! c (chunks 0))
    birdwatch.twitterclient.processing=> (put! c (chunks 1))
    {:text foo}
    
    birdwatch.twitterclient.processing=> (put! c (chunks 2))
    birdwatch.twitterclient.processing=> (put! c (chunks 3))
    {:text bar}
    
    birdwatch.twitterclient.processing=> (put! c (chunks 4))
    16:44:32.539 [nREPL-worker-2] ERROR birdwatch.twitterclient.processing - error-msg {:baz 42}

Excellent, same output. In case you're not familiar with **core.async channels** yet: above we created a channel with the same transducer attached as in the previous example, then we created a **go-loop** to consume the channel and finally, we **put!** the individual chunks on the channel. No worries if this seems a little much right now. Just come back for the next articles where we'll cover this topic in much more detail.

## Conclusion
Okay, this is it for today. We saw how we can process tweets from the **[Twitter Streaming API](https://dev.twitter.com/streaming/overview)** in a way that is generic and that can be used on different kinds of data structures. Next week, we will use this composed transducer in the context of our application. Then, we will process real data from the Twitter streaming API and feed the processed data into the channels architecture of our application. There is a **[live version for you to try out](http://birdwatch2.matthiasnehlsen.com)** and of course the source code is on **[GitHub](https://github.com/matthiasn/BirdWatch)**.

There is a lot more reading material available on the subjects we covered. Instead of providing all the links now, I'd rather refer you to my list of **[Clojure Resources on GitHub](https://github.com/matthiasn/Clojure-Resources)**. There, you'll find a comprehensive list of all the articles I came across while working on this application.
I hope you found this useful. If you did, why don’t you subscribe to the <a href="http://eepurl.com/y0HWv" target="_blank"><strong>newsletter</strong></a> so I can tell you when the next article is out?

Cheers,
Matthias

**P.S.** This series of articles is now continued in this book:
<iframe width="160" height="400" src="https://leanpub.com/building-a-system-in-clojure/embed" frameborder="0" allowtransparency="true"></iframe>

<div class="sharing">
  <iframe id="twitter-widget-0" scrolling="no" frameborder="0" allowtransparency="true" src="http://platform.twitter.com/widgets/tweet_button.2df3b13213b70e6d91180bf64c17db20.en.html#_=1412769297267&amp;count=horizontal&amp;counturl=http%3A%2F%2Fmatthiasnehlsen.com%2Fblog%2F2014%2F10%2F06%2FBuilding-Systems-in-Clojure-2%2F&amp;id=twitter-widget-0&amp;lang=en&amp;original_referer=http%3A%2F%2Fmatthiasnehlsen.com%2Fblog%2F2014%2F10%2F06%2FBuilding-Systems-in-Clojure-2%2F&amp;size=m&amp;text=Building%20a%20System%20in%20%23Clojure%202%20-%20Transducers%20-%20Matthias%20Nehlsen&amp;url=http%3A%2F%2Fmatthiasnehlsen.com%2Fblog%2F2014%2F10%2F06%2FBuilding-Systems-in-Clojure-2%2F&amp;via=matthiasnehlsen" class="twitter-share-button twitter-tweet-button twitter-share-button twitter-count-horizontal" title="Twitter Tweet Button" data-twttr-rendered="true" style="width: 107px; height: 20px;"></iframe>

  <div id="___plusone_0" style="text-indent: 0px; margin: 0px; padding: 0px; background-color: transparent; border-style: none; float: none; line-height: normal; font-size: 1px; vertical-align: baseline; display: inline-block; width: 90px; height: 20px; background-position: initial initial; background-repeat: initial initial;"><iframe frameborder="0" hspace="0" marginheight="0" marginwidth="0" scrolling="no" style="position: static; top: 0px; width: 90px; margin: 0px; border-style: none; left: 0px; visibility: visible; height: 20px;" tabindex="0" vspace="0" width="100%" id="I0_1412769297421" name="I0_1412769297421" src="https://apis.google.com/u/0/se/0/_/+1/fastbutton?usegapi=1&amp;size=medium&amp;origin=http%3A%2F%2Fmatthiasnehlsen.com&amp;url=http%3A%2F%2Fmatthiasnehlsen.com%2Fblog%2F2014%2F10%2F06%2FBuilding-Systems-in-Clojure-2&amp;gsrc=3p&amp;ic=1&amp;jsh=m%3B%2F_%2Fscs%2Fapps-static%2F_%2Fjs%2Fk%3Doz.gapi.en.eZie-eg_6M4.O%2Fm%3D__features__%2Fam%3DAQ%2Frt%3Dj%2Fd%3D1%2Ft%3Dzcms%2Frs%3DAItRSTOh4SCUosWCqh1KPQ0Sr-K9eQ0Nsg#_methods=onPlusOne%2C_ready%2C_close%2C_open%2C_resizeMe%2C_renderstart%2Concircled%2Cdrefresh%2Cerefresh%2Conload&amp;id=I0_1412769297421&amp;parent=http%3A%2F%2Fmatthiasnehlsen.com&amp;pfname=&amp;rpctoken=39213785" data-gapiattached="true" title="+1"></iframe></div>

  <script type="text/javascript">
    (function() {
      var script = document.createElement('script'); script.type = 'text/javascript'; script.async = true;
      script.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(script, s);
    })();
  </script>

  <script type="text/javascript">
    (function(){
      var twitterWidgets = document.createElement('script');
      twitterWidgets.type = 'text/javascript';
      twitterWidgets.async = true;
      twitterWidgets.src = 'http://platform.twitter.com/widgets.js';
      document.getElementsByTagName('head')[0].appendChild(twitterWidgets);
    })();
  </script>
</div>

<br>

[^1]: I only recently started with Clojure. It may be possible an also quite likely that there are better ways of doing things. If so, please let me know, I want to learn stuff.

[^2]: I don't know much about the exact mechanism at play, actual numbers or delivery guarantees. It anyhow doesn’t matter much for the purpose of this application. The interesting views focus on the most retweeted tweets. Now every retweet contains the original tweet under “retweeted_status”, with the current numbers such as retweet and favorite count for the moment in time it was retweeted. For popular ones, we thus receive the original tweet many, many times over. So even if we missed as much as half of all the tweets - which I consider unlikely - the popular tweets would only be updated less often. Worst case: retweet count is off by one or two. I can live with that. In reality, for the current selection of terms, reaching the limit also hardly ever happens. After all, 1% is still millions of tweets per day.

[^3]: **Atoms** are essential to Clojure’s **state model**. Essentially, you have this managed reference that is thread-safe. Whenever we dereference such an atom, we get the state of the world this very second. Then, when you pass the dereferenced value to other parts of the application, it still represents the immutable state of the world at that point in time. It cannot change. Next time I dereference that atom, I will get the new state of the world. Updates to atoms can only happen in transactions, meaning that no two can run at the same time. Thus, we won't have to chase crazy concurrency issues.

[^4]: After initial experimentation with a **[local volatile reference](http://dev.clojure.org/jira/browse/CLJ-1512)**, I decided in favor of a good old atom. The **volatile!** local reference trades off potential race conditions with speed. But there’s no performance issue when we process tweet chunks a few hundred times a second utmost, so why bother and introduce a new concept? Worth to keep in mind, though, when performance is an issue.

[^5]: For whatever reason, the changed behavior of the streaming API also entails that not all tweets are followed by a line break, only most of them. A tiny helper function inserts those missing linebreaks where they are missing between two tweets: ````(str/replace s #"\}\{" "}\r\n{"))````.

[^6]: One could probably check if the buffer contains a valid and complete JSON string when the arity-1 function is called, and if so, pass it on. Considering though that in this application we are interested in a stream that does not have an end, I omitted this step.

[^7]: I assume the **transient** collection is used for performance reasons.
