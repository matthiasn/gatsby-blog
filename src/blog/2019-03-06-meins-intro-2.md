---
layout: post
title: "Building an intelligent journal in Clojure, Part 2"
date: "2019-03-06"
draft: true
comments: true
categories: 
keywords: "meins, systems-toolbox, inspect, clojure"
description: "meins - a technical introduction, part 2: the codebase" 
---

After looking inside the packaged version, you may want to fire up a development instance of **meins**. For that, you must have the following installed and running:

* [Leiningen](https://leiningen.org/)
* [Node v10+](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [JDK 10+](https://openjdk.java.net/)

Once you have the required tools set up, go to the cloned repository of meins and run once:

    yarn install
    lein cljs-main

Then, run the following in parallel:

    lein run
    lein cljs-figwheel
    lein sass4clj auto

When all of these have started, run:

    npm start

An instance of **meins** should fire up that looks like the packaged version, except that the title is now _electron_ instead of _meins_. This development instance uses [Figwheel](https://github.com/bhauman/lein-figwheel), which means that changes in the UI code will be reflected immediately. Let's try this out. 

Go to namespace `meins.electron.renderer.ui.grid` and look for the string `"add tab"` and change the label text to `"add first tab"`. The UI should change almost immediately after saving the file.

## The Frontend

Now that you have the environment running, let's continue exploring the codebase. The renderer subsystem has two major parts, the client-side state and the ui component. The store component manages the state and has handler functions that handle particular message types, and contain the business logic around the respective message flow.

The ui component then subscribes to the application state and re-renders whenever something changes. Let's have a look at the client-side wiring:

`gist:8f67e8cfa662403fe525a23f90eadab6?file=meins.electron.renderer.core.cljs&highlights=61,63-74,76-134`

First, we have the **switchboard**, which will facilitate instantiation and wiring of components. Below, a set of components or rather their **blueprints** is defined. Each of the function calls returns a map that contains the component ID and optionally a state function that can set up the component state (otherwise it's just an empty map) and a map of handler functions, one for each message type that the component should handle. Message types are namespaced keywords. The systems-toolbox then uses [spec](https://clojure.org/guides/spec) to validate messages, which gives some of the benefits of a typesystem, but with less of the downside of making systems too rigid and resilient to change.

 Then in the next step, in the `init` function, components are instantiated by sending a `:cmd/init-comp` message with the set of components as the payload, and then wired together using `:cmd/route` messages, upon which the switchboard will create communication channels between the out-channel of every component under `:from` and the in-channel of every component under `:to`, for every message type that is handled. Thanks to inspect, we already know how that wiring looks like.

Then, there is the `:cmd/observe-state` message type, which allows a component to watch the state of another component. Then, whenever anything in the observed component changes, the observer will receive a snapshot of the state. In this case, the state snapshot will be rendered into a user interface. The UI then has no way to alter this state directly, it can only send messages to the store component and then be notified with a fresh snapshot when its state changes. This provides for a nice separation of concerns, where state changes happen in exactly one place. 

The `:renderer/store` component is a little more complex, let's just look at the blueprint map, which points us at the individual handler functions for each message type, plus the `state-fn` which gives the component its initial state:

`gist:fe1b1492b85b6eb059fce1cd6d6d7597?file=meins.electron.renderer.client-store.cljc&highlights=12,31,35`

In the `state-fn`, you can get an idea what the initial component state will look like. However, as more and more handler functions return an updated state after processing different message types, it becomes more and more difficult to infer from the code alone how the state will have changed. In order to assist during development, there is a built-in way to have a look at the component state. It is called the **data explorer**[^2] and you can access it using either `CMD-D` on Mac or `Ctrl-D` on Linux and Windows, or via **_Dev > Toggle Data Explorer_** in the menu. This is how that looks like:

![data explorer](../images/2019-02-intro/2019-02-06_14.16.25_data_explorer.png)

The data explorer is quite helpful when examining what happens in the frontend. It would also be helpful to have something similar for the backend state. That in particular does not exist yet, but the backend offers yet another way to examine the running application by interactively building GraphQL queries and and then executing them. We will get to that in a little bit. Let's have a look at a handler function first.

A handler function is a function that takes a single map and that return a single map. The map passed to handler contains the following keys:

* `:msg` - the entire message vector
* `:msg-type` - the message type, which is a namespaced keyword. This is the first element in `:msg`
* `:msg-payload` - the payload of the `:msg`, which is the second element in the message vector
* `:msg-meta` - meta data about the message flow, such as the tag and timing, which is then used inspect, or also a connection UID when using WebSockets over [sente](https://github.com/ptaoussanis/sente). More broadly, the meta data is for information about the message flow, as opposed to the payload itself
* `:current-state` - a snapshot of the component state
* `:cmp-state` - the component state atom, which can be updated using `swap!` or `reset!`. This is useful for example when you want to do something to the sata after returning from the handler, as would be the case inside a future.
* `:put-fn` - a function for emitting messages. Messages can be emitted by a component through either using the `put-fn` or returning the message(s) from the handler function.

When a handler function returns, a map is expected. It can be empty, which means that there are neither messages to emit nor a change in component state. Optionally, the map can contain the following keys:

* `:new-state` - the new component state after the handler has completed its work
* `:emit-msg` - a vector with messages to emit after the handler completed its work
* `:send-to-self` - a vector of messages to send to the component itself.

Here's a simple example for a handler function, the `refresh-cfg` function in the `meins.jvm.store.cfg` namespace:

`gist:d7dff86619dc9759f71466354f3cd771?file=cfg.clj`


## The Backend

The backend runs inside a custom JVM, assembled by [jlink](https://docs.oracle.com/javase/10/tools/jlink.htm). It holds the application state with all journal entries inside a graph, which is an [ubergraph](https://github.com/Engelberg/ubergraph) data structure. This graph data structure is then traversed inside [Lacinia's Field Resolvers](https://lacinia.readthedocs.io/en/latest/resolve/index.html) when the UI sends [GraphQL](https://graphql.org/) queries to the backend. 

You can dynamically explore the schema, the queries, and your data in a browser. This functionality is provided by [GraphiQL](https://github.com/graphql/graphiql). For this, you run **_Dev > Start GraphQL Endpoint_** and the point your browser to [localhost:7789](http://localhost:7789) for a packaged version of meins, and [localhost:8766](http://localhost:8766) when started from the command line. GraphiQL is pretty cool, it lets you explore the schema, and then build and run queries right there. 

![GraphiQL](../images/2019-02-intro/2019-02-08_23.44.50_graphiql.png)

If you haven't had a look at [GraphQL](https://graphql.org/), it's a brilliantly simple way to fetch exactly the data you need, as opposed to over- or underfetching, where overfetching is particularly problematic as you don't see the effect right away as you would when data is missing, but performance will slowly but surely decline when you throw more data than necessary at the renderer process, which is a single threaded environment like all browsers, and anything taking longer than it takes for a frame to render (16.7ms) will make the UI feel sluggish.

One of the nice features of GraphiQL is that you can interactively build a query and then use them in your application, as you can see in the `resources` directory. There, may also want to have a look at the `schema.edn` file, where both queries and entities are defined.

This is the code that wires the backend system together:

`gist:3c8a78f369e69ec88d0c0976c9784116?file=meins.jvm.core.clj&highlights=24,33,37,48,100`

Once again, I find the drawing that **inspect** generated to be much more helpful than trying to map this in my brain. Like in the frontend, the `:backend/store` component holds application state and logic, only that here, a large part of the queries happen via GraphQL. 

This is the `:backend/store` component:

`gist:5fe1dcfbc1f8d10fbc4651a13390f173?file=store.clj&highlights=35-61`

With the tools presented so far, and the brief introduction to the systems-toolbox in this article, you should be much better equipped to understand what is going on here, as opposed to reading the code alone. I will go into detail about the GraphQL parts of the system in future post.


## Electron Main

The **Electron Main** process is responsible for starting up the application as a whole, and then both starting the **JVM backend** process and the browser window in which the **Renderer process** runs. Let's start with the wiring once again


## Conclusion
In this post we looked at [meins](https://github.com/matthiasn/meins), which is a more complex example for an application built on top of the [systems-toolbox](https:/github.com/matthiasn/systems-toolbox). The system as a whole spans three separate processes that need to communicate with each other, and for me, it is reaching a level of complexity where it becomes difficult to reason about the system from code alone. We then looked at three different ways to look inside the system, which all help in the development process, only in different areas.

More importantly though, **meins** is not meant as a mere sample application, but as a long-term solution for storing data about your life, and then learn from it. I am looking for collaborators for this project, so I hope this post makes the application a lot more approachable, and inspires you to try it out for yourself. Maybe you'd like to add some features you desire, or help in cleaning it up and making the codebase better. Please check the [issues](https://github.com/matthiasn/meins/issues) on GitHub if you want to get involved. Or share this post, that will most certainly help in finding collaborators so that this project can evolve faster than if I worked on it alone.

That's it for today. In the next post, I will show you how to track **good and bad habits** in **meins**, and how that's implemented in Clojure and ClojureScript, where the [SVG](https://www.w3.org/TR/SVG2/) is rendered directly with [reagent](https://github.com/reagent-project/reagent).

![habits](../images/2019-02-intro/2019-01-07_19.51_habits.png)

Thanks & until next time,
Matthias


[^1]: This is inspired by **Rich Hickey's** talk about [core.async](https://github.com/matthiasn/talk-transcripts/blob/master/Hickey_Rich/CoreAsync-mostly-text.md), and specifically the idea of **conveyance**.

[^2]: I borrowed the code for drilling into the data structure from [kamituel/systems-toolbox-chrome](https://github.com/kamituel/systems-toolbox-chrome). 