---
layout: post
title: "SystemD and Clojure"
date: "2016-08-04"
comments: true
categories: 
---

Oh hey, I'm back. Been a while. Today, I want to share with you how I'm using **[systemd](https://en.wikipedia.org/wiki/Systemd)** to start my Clojure applications on **[matthiasnehlsen.com](http://matthiasnehlsen.com)**, and keep them alive, in case anything should go wrong. These are the applications managed this way:

* **[BirdWatch](http://birdwatch.matthiasnehlsen.com)**, an application for tweet stream analysis, see on **[GitHub](https://github.com/matthiasn/BirdWatch)**
* **[redux-counter example](http://redux-style.matthiasnehlsen.com/)**, a sample application for my Clojure **[book](https://leanpub.com/building-a-system-in-clojure)**
* **[trailing mouse pointer example](http://systems-toolbox.matthiasnehlsen.com/)**, another sample application for the book
* **[inspect](http://inspect.matthiasnehlsen.com/)**, a demo for my **[inspect library](https://github.com/matthiasn/inspect)**. This is will soon be replaced by a new version making sense of messages passed around in **[systems-toolbox](https://github.com/matthiasn/systems-toolbox)** applications.

Also, I'm using systemd to start up **[sse-chat](http://sse-chat.matthiasnehlsen.com/)**, a **[Scala]()** demo application which you can also find on **[GitHub](https://github.com/matthiasn/sse-chat)**. However, this application is only started by systemd, but not restarted when anything goes wrong.

The background for this post is that I recently ordered a new **[Skylake Intel® Xeon® E3-1275 v5](http://ark.intel.com/products/codename/37572/Skylake#@All)** based server at **[Hetzner](https://www.hetzner.de/en/)**, and I felt it was finally time to retire the manual process startup approach I had used before. Servers should be updated as often as possible, but who does that often enough when it takes 10-15 minutes to wait for a reboot and then manually restart the processes? Certainly not me. So instead, all process startup should be automatic. Initially, I considered using **[Docker](https://www.docker.com/)**, but regarding monitoring that the application is alive, and restarting it if not, systemd has the better story to offer. Also, I wasted way too much time on a Docker environment in my last client project, so I'm a little cured of the snake oil.[^1] 

So what I wanted was restarting the machine and have all services come up automatically. Also, I wanted to use the **watchdog** functionality, which expects the monitored applications to call systemd with a **heartbeat** message and restarts the application if that heartbeat wasn't encountered for say 20 seconds or whatever else you define there. You can read all about this mechanism in this **[blog post](http://0pointer.de/blog/projects/watchdog.html)** by one of the original authors of systemd.

While my applications were running rock solid for months in a row until I finally managed to update the server and restart it, it is certainly appealing from an operations perspective to have a mechanism in place that listens for a heartbeat and restarts a process when the heartbeat does not come as expected. So I thought this might be a good opportunity to write a small library that takes care of emitting said heartbeat when an application is monitored by systemd. You can find this library on GitHub **[here](https://github.com/matthiasn/systemd-watchdog)**.

This library also happens to be a sweet opportunity to write a minimal **[systems-toolbox](https://github.com/matthiasn/systems-toolbox)** system, with a scheduler component that emits messages every so often, and then calls systemd via **[JNA](https://github.com/java-native-access/jna)**.

This is the entire [library](https://github.com/matthiasn/systemd-watchdog/blob/65266f579fa32b87811c77629969cb3d71c30c49/src/clj/matthiasn/systemd_watchdog/core.clj#L6):

````clojure
(defn start-watchdog!
  "Call systemd's watchdog every so many milliseconds.
   Requires the NOTIFY_SOCKET environment variable to be set, otherwise does
   nothing. Fires up a minimal systems-toolbox system with two components:
    * a scheduler component
    * a component notifying systemd.
   Then, the scheduler will emit messages every so often, and upon receiving,
   the notifying component will call the sendWatchdog function.
   Takes the timeout in milliseconds."
  [timeout]
  (when (get (System/getenv) "NOTIFY_SOCKET")
    (sb/send-mult-cmd
      (sb/component :wd/switchboard)
      [[:cmd/init-comp (sched/cmp-map :wd/scheduler-cmp)]
       [:cmd/init-comp
        {:cmp-id      :wd/notify-cmp
         :handler-map {:wd/send (fn [_] (SDNotify/sendWatchdog))}}]
       [:cmd/send {:to  :wd/scheduler-cmp
                   :msg [:cmd/schedule-new
                         {:timeout timeout
                          :message [:wd/send]
                          :repeat  true}]}]
       [:cmd/route {:from :wd/scheduler-cmp :to :wd/notify-cmp}]])))
````

It fires up a **switchboard**, which manages and wires systems, the `:wd/notify-cmp`, which calls `(SDNotify/sendWatchdog)` from the **[SDNotify library](https://github.com/faljse/SDNotify)**, and a scheduler component, which emits `:wd/send` messages every `timeout` milliseconds. You can build much more complex applications with the **systems-toolbox**, e.g. **[BirdWatch](http://birdwatch.matthiasnehlsen.com)**. The 14 lines above (plus comments and imports) however are about the minimum case when some scheduling is desired.

You can have a look at the mentioned examples if you're interested in building systems with the systems-toolbox. In subsequent articles, I will introduce them in detail. For now, you can just use the library in your projects if you want to have your application monitored by systemd. It's just a one-liner, as you can see for example in the **[trailing mouse pointer example](https://github.com/matthiasn/systems-toolbox/blob/master/examples/trailing-mouse-pointer/src/clj/example/core.clj#L41)**: 

````clojure
  (wd/start-watchdog! 5000)
````

This simple command calls systemd every 5 seconds, but only if the `NOTIFY_SOCKET` environment variable is set, which would only be the case if systemd had started the application.

Here's the service configuration:

````
[Unit]
Description=systems-toolbox websocket latency visualization example

[Service]
Type=simple
User=bw
Group=bw
Environment=PORT=8010
Environment=HOST=0.0.0.0
WorkingDirectory=/home/bw/run
ExecStart=/usr/bin/java -jar /home/bw/bin/trailing-mouse-pointer.jar
WatchdogSec=20s
Restart=on-failure

# Give a reasonable amount of time for the server to start up/shut down
TimeoutSec=300

[Install]
WantedBy=multi-user.target
````

You can find all the service configurations for my server in my **[conf](https://github.com/matthiasn/conf) project, together with some install scripts which allow me to set up a new server with little effort. I hope this helps you in your deployments. It certainly helps me with mine.

Would you like to know when there's a new article? Subscribe to the <a href="http://eepurl.com/y0HWv" target="_blank"><strong>newsletter</strong></a> and I'll let you know.

Cheers,
Matthias

[^1]: There, the problem was that silly Docker service that frequently hung, which, for whatever reason, required a **REBOOT** of the whole machine. As you can imagine, this was very annoying, as that, of course, meant ALL services would become unavailable until the machine was back up.

