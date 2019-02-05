---
layout: post
title: "Building an intelligent journal in Clojure"
date: "2019-02-12"
draft: false
comments: true
categories: 
keywords: "meins, systems-toolbox, inspect, clojure"
description: "meins - a technical introduction" 
---

This is a report on how I built an intelligent journal as a desktop application in [Clojure](https://clojure.org) and [ClojureScript](https://clojurescript.org/). The description of the mobile app will follow. We got a lot to cover, so let's dive right in. I needed a journal that would help me get my life in order, and that would not give my data away. Data integrity was also an important consideration. That application did not exist, so I tried building it in [Clojure](https://clojure.org), my favorite programming language. It is currently called meins and I will describe its technical side in this post. In the process, I will show you one way to build a desktop application in [Clojure](https://clojure.org) and [ClojureScript](https://clojurescript.org/), with a JVM process doing typical backend work such as persistence and maintaining a searchable index and running inside an [Electron](https://electronjs.org/) application, which constitutes the [ClojureScript](https://clojurescript.org/) part.

On the lowest level there is the [systems-toolbox](https://github.com/matthiasn/systems-toolbox) library. It lets you build larger systems out of communicating components, which are heavily inspired by actor systems, with one difference that actors here need not know where they send messages, but instead just place that message on a core.async channel, completely oblivious of what happens henceforth.

Such actors then get wired together by the so-called switchboard, which wires systems together as instructed by messages it receives. This could be way more dynamic, but so far I am only using this mechanism when firing up a system.

There is a companion app for the systems-toolbox called [inspect](https://github.com/matthiasn/inspect), which visualizes a running system and then infers its structure through observing message flows. When activated, a system put all messages on the so called firehose, which can then be written to a log, or also put on a Kafka topic, or whatever else you want to write an adaptor for. In this case here, I use a simple append log, which inspect can then tail and examine independently.

This is [meins](https://github.com/matthiasn/meins), as seen by inspect:

![inspect overview](../images/2019-02-intro/2019-02-05_01.16.20_system.png)

I'll show you how to use it later. For now, this automatically generated drawing provides a good starting point to dive into the architecture. There are three subsystems here. 

On the left, there is the **backend** subsystem. Most relevant logic resides in the `:backend/store` component, which persist each journal entry into an append log for each day. Just like any other component, the store only processes a single message at a time and there is only a single store, which guarantees that there is no chance of multiple threads writing to the file at the same time. On application startup, the logs are simply replayed, as a **complete rebuild** in the [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) sense. Then, there is an **in-memory index**, modeled as a **graph** using [ubergraph](https://github.com/Engelberg/ubergraph), which can be queried at runtime using [GraphQL](https://graphql.org/), where [Lacinia](https://github.com/walmartlabs/lacinia) provides the execution engine. This subsystem communicates with the renderer process using Websockets, provided by the [systems-toolbox-sente](https://github.com/matthiasn/systems-toolbox-sente) library. The usage of Websockets or any other means of transport is transparent to the individual component. Components just put their messages on a conveyor belt and are done with their job.

In the middle, there is the **renderer** subsystem. This is a client-side [ClojureScript](https://clojurescript.org/) application running inside an [Electron](https://electronjs.org/) render process, which is based on [Chromium](https://www.chromium.org/) and behaves like a browser window, with some additional features. Here, the UI is rendered using [reagent](https://github.com/reagent-project/reagent) and [re-frame](https://github.com/Day8/re-frame). Communication between components is once again provided by the [systems-toolbox](https://github.com/matthiasn/systems-toolbox) library, and (non-UI) components look the exact same on the JVM and in ClojureScript. The user interface sends queries to the backend, both in [GraphQL](https://graphql.org/) and as adhoc queries. These request messages are relayed to the backend using Websockets, once again using a component from the [systems-toolbox-sente](https://github.com/matthiasn/systems-toolbox-sente) library.

On the right, there is the **main** subsystem, which is another ClojureScript application, this time running inside the Electron main process, which fires up both the **backend** and the **renderer** subsystems, and provides some platform interop such as providing the application menu or listening to key combinations. There's also a component for capturing screenshots.

Now you already know enough to start exploring the system yourself. All you need to do is download [meins](https://github.com/matthiasn/meins/releases), and then click **_Dev > Start Firehose_**. Then, download inspect and point it at `/tmp/meins-firehose.fh`. Go over to **meins** and click **_File > New Entry_**. Inspect should have automatically cartographed the application, as seen so far. Then, you can examine the data further, e.g. highlight a particular message type:

![screenshot msg type filter](../images/2019-02-intro/2019-02-05_01.17_flow.png)

Or, further on the right, you can select specific message flow, and see what other message types were involved, and how. Here's the message flow for all messages triggered by saving a journal entry:

![entry save message flow](../images/2019-02-intro/2019-02-05_01.17.47_flow.png)

Next, there is a chronological list of all individual messages involved. To the right, you can look inside individual messages:

![message timeline](../images/2019-02-intro/2019-02-05_16.01.34_msg-timeline.png)

Overall, I find that such an interactive visualization helpful, not only when debugging message flows but also when trying to understand a system better in general. It's useful to not only have to rely on outdated documentation but also have the system chime in and document itself. 

After looking into the packaged version, you may want to look inside a development instance. For that, you must have the following installed and running:
* Leiningen
* Node v10.x
* Yarn
* JDK 10+

Then, run oncce:
    lein cljs-main

Then, run the following in parallel:

    lein run
    lein cljs-figwheel
    lein sass4clj auto

When all of these have started, run:

    npm start

An existence of meins should have fired up that looks like the packaged version, except that the title is now electron instead of meins. This development instance uses figwheel, which means that changes in the UI code will be reflected immediately. Let's try this out. 

Go to namespace x and look for the label text "" and change the label text to "". The change should be reflected in the UI almost immediately.

The client or render component has its own state, which is worth inspecting during development. You can have a look at it pressing CMD-D for data explorer.