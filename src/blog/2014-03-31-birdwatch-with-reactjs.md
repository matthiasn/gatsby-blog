---
layout: post
title: "BirdWatch: AngularJS vs. ReactJS"
date: "2014-03-31"
comments: true
categories: 
---
**Summary:** In this article I will present a new version of the BirdWatch application that uses **[ReactJS](http://facebook.github.io/react/)** on the client side instead of **[AngularJS](http://angularjs.org)**. Don't worry if you liked the previous AngularJS version - I do not intend to replace it. Rather, I want to create another version of the client side web application in order to get a better feeling for the pros and cons of different frameworks and libraries. So think of it as something like the **[TodoMVC](http://todomvc.com)** of reactive web applications. Well, not quite yet, but feel free to write another client version for comparison. EmberJS anyone?
For this new version I have also rewritten the barchart as a ReactJS component with integrated trend analysis and no dependency on **[D3.js](http://d3js.org)**. Again, there is nothing wrong with D3; I just like to try different approaches to the same problem.

In this article I will not go into a lot of detail about the server side of the BirdWatch application as there's an **[article on that](http://matthiasnehlsen.com/blog/2013/09/10/birdwatch-explained/)** already. What you need to know is that there is a server side application using **[Play Framework](http://www.playframework.com)** that connects to the **[Twitter Streaming API](https://dev.twitter.com/docs/streaming-apis)** and that subscribes to a defined set of terms, meaning that it will retrieve all tweets containing at least one of these terms, up to a limit of 1% of all tweets at a given time[^1]. Then there is a client side JavaScript application that allows users to perform a live search inside a stream of tweets, with realtime updates of the UI when new search matches come in from Twitter. Here's how that looks like. Click the image to try out the application:

<a href="http://birdwatch.matthiasnehlsen.com" target="_blank"><img src="/images/bw_reactjs.png" /></a>

Here's an animated architectural overview, mostly meant as a teaser for the previous article which describes the server side of the application in detail. You can click it to get to that article:

<a href="http://matthiasnehlsen.com/blog/2013/09/10/birdwatch-explained/" target="_blank"><img src="/images/bw_expl_anim.gif" /></a>

This has all worked really nicely with AngularJS for a couple of months. Now let's see if we can build the same thing with **[ReactJS](http://facebook.github.io/react/)** on the client side.

##Why would one choose ReactJS over AngularJS?
In the current version of BirdWatch, AngularJS decides when to figure out if the data model changes so that it can determine when to re-render the UI. These calls can happen at any time, so they need to be idempotent [^2]. That requirement has been met, any call to the crossfilter service for data is indeed itempotent, but there's a catch: every call to get data is potentially expensive, and I'd rather avoid unnecessary calls to the **[crossfilter](http://square.github.io/crossfilter/)** service. Instead I want to decide when the client UI is rendered by actively triggering the render process. That way I have full control when and how often the UI renderer is fed with new data. 

As discussed in my recently published **[article](http://matthiasnehlsen.com/blog/2014/01/24/scala-dot-js-and-reactjs/)**, ReactJS may also be a better fit when working with immutable data. That is not a concern in the current version of BirdWatch, but it may well be an issue in the future.

##Implementing the existing functionality with ReactJS
There are four main areas of functionality in the application:

* **Search:** The user can start a search by entering the terms into the search bar, which will refresh the data and establish a **[Server Sent Events (SSE)](http://dev.w3.org/html5/eventsource/)** connection to the server that will deliver search matches in real time. At the same time previous matches are retrieved and merged with the real time results.

* **Rendering of tweets:** Different sort orders of tweets are displayed in a list of what I call tweet cards. In AngularJS, directives handle the abstraction of one such tweet nicely. 

* **Pagination:** The application loads many more tweets than can be displayed on one page (with 5000 tweets being the default). The AngularJS version implements this with a modified subset of the **[AngularUI-Bootstrap project](http://angular-ui.github.io/bootstrap/)**.

* **Charts:** Different visualizations are rendered on the page. At the core, D3 does this for us. In the AngularJS version, relatively thin wrappers make **[directives](http://docs.angularjs.org/guide/directive)** out of these charts that get wired data and that re-render when the data changes.

* **Bookmarkability:** users can bookmark a search and come back to it later, send it to friends, tweet about it or whatever. AngularJS provides the **[$locationProvider](http://docs.angularjs.org/api/ng/provider/$locationProvider)** for this.

Let's go through these areas one by one.

##Search
In this area, AngularJS and its two-way data-binding shine. The content of the search input element is bound to a property on the **$scope**, just like the button is bound to a function that is also part of the **$scope** and that triggers a new search. ReactJS, on the other hand, does not offer two-way binding out of the box. There are helpers to achieve this, notably **[ReeactLink](http://facebook.github.io/react/docs/two-way-binding-helpers.html)**, but I have not tried it. It also seems that it is generally discouraged. In this case it was fairly trivial to achieve the functionality without ReactJS; instead I am assigning the functionality using onclick for triggering the search function, and jQuery to achieve the same when enter is pressed inside the input field. AngularJS offers more of a full framework solution for such problems, but I am okay with this solution here.

{% codeblock Search Button lang:html https://github.com/matthiasn/BirdWatch/blob/603d4dfb85330e346afdf9241e36a62313eaa620/app/views/react_js.scala.html react_js.scala.html %}
````
<button class="btn btn-primary" type="button" onclick="BirdWatch.search()">
````

The button is plain HTML with an onclick handler. I have assigned the *search* function to serve as the handler function, which lives in a property of the global BirdWatch object. In addition to the click handler for the button, I also wanted to be able to trigger a search when pressing ENTER inside the search field. jQuery is perfect for that:

{% codeblock Handling Enter in Search Field lang:javascript https://github.com/matthiasn/BirdWatch/blob/ca0ffd54795f26bcbfdcdf5e3e61ea6d0e2d1950/react-js/src/app.js app.js %}
```
  $('#searchForm').submit(function (e) {
    BirdWatch.search();
    e.preventDefault();
    return false;
  });
````

Finally here is the function that triggers the search:

{% codeblock Function for triggering search lang:javascript https://github.com/matthiasn/BirdWatch/blob/ca0ffd54795f26bcbfdcdf5e3e61ea6d0e2d1950/react-js/src/app.js app.js %}`
```
  BirdWatch.search = function () {
    var searchField = $("#searchField");
    BirdWatch.wordcount.reset();
    activePage = 1;
    BirdWatch.crossfilter.clear();
    BirdWatch.tweets.search(searchField.val(), $("#prev-size").val());
    searchField.focus();
  };
````

The above is plain old HTML / JavaScript / jQuery. You may think this to be a rather old-fashioned way of doing it. But on the upside, no special framework knowledge is required, and anyone who has done any web development in the last decade can do this without a learning curve. Alternatively, we could make a ReactJS component out of the search bar and pass the the handler function to this component as part of the **props** [^3]. In this simple case I don't believe it is necessary to create a component, but this would be the way to go about it when more complex behavior is desired.

##Rendering of tweets
This is where it gets much more interesting. AngularJS renders the list of tweets from the data model using **ng-repeat** like this:

{% codeblock ng-repeat in AngularJS version lang:html https://github.com/matthiasn/BirdWatch/blob/ca0ffd54795f26bcbfdcdf5e3e61ea6d0e2d1950/app/views/index.scala.html index.scala.html %}
````
<!-- Tweet Cards inside frame -->
<div class="col-lg-4" id="tweet-frame">
    <div class="tweetCard" data-ng-repeat="tweet in cf.tweetPage(currentPage, pageSize, sortModel)"
        data-tweet="tweet"></div>
</div>
````

where *cf.tweetPage* is a function that delivers the data from the crossfilter object. The application code has little control over when this happens. It will certainly happen when explicitly calling *$scope.$apply* and also when anything else happens that has any effect on the data model, anywhere. This is what I meant when I said earlier that this may not be the most desirable thing when this function call is potentially expensive. 

ReactJS works the other way round. The application instantiates a component for the list of tweets that knows how to render itself, and it will only subsequently do that when the application actively feeds it new data. Let's look at that in more detail. In the HTML, there is only a single div without any special notation:

{% codeblock Tweet List Div in ReactJS lang:html https://github.com/matthiasn/BirdWatch/blob/ca0ffd54795f26bcbfdcdf5e3e61ea6d0e2d1950/app/views/react_js.scala.html react_js.scala.html %}
```
    <!-- Tweet Cards inside frame -->
    <div class="col-lg-4" id="tweet-frame"></div>
````

Then in the component declaration, it looks as follows:

{% codeblock Tweet List Div in ReactJS lang:javascript https://github.com/matthiasn/BirdWatch/blob/ca0ffd54795f26bcbfdcdf5e3e61ea6d0e2d1950/react-js/jsx/tweetlist.js tweetlist.js %}`
````js
/** Component for conditional rendering of retweet count inside Tweet */
var RetweetCount = React.createClass({
    render: function() {
        if(this.props.count > 0) {
            return <div className="pull-right timeInterval">{numberFormat(this.props.count)} RT</div>
        }
        else return <div></div>;
    }
});

/** single Tweet component */
var Tweet = React.createClass({
    render: function () { return (
        <div className="tweet">
            <span>
                <a href={"http://www.twitter.com/" + this.props.t.user.screen_name} target="_blank">
                    <img className="thumbnail" src={this.props.t.user.profile_image_url} />
                </a>
            </span>
            <a href={"http://www.twitter.com/" + this.props.t.user.screen_name} target="_blank">
                <span className="username">{this.props.t.user.name}</span>
            </a>
            <span className="username_screen">&nbsp;&#64;{this.props.t.user.screen_name}</span>
            <div className="pull-right timeInterval">{fromNow(this.props.t.created_at)}</div>
            <div className="tweettext">
                <div dangerouslySetInnerHTML={{__html: this.props.t.htmlText}} className=""></div>
                <div className="pull-left timeInterval">{numberFormat(this.props.t.user.followers_count)} followers</div>
                <RetweetCount count={this.props.t.retweet_count} />
                <FavoriteCount count={this.props.t.favorite_count} />
            </div>
        </div>
    ); }
});

/** Tweet list component, renders all Tweet items (above) */
var TweetList = React.createClass({
    render: function() {
        var tweetNodes = this.props.tweets.map(function (tweet, idx, arr) {
            return <Tweet t={tweet} key={idx} />;
        }.bind(this));
        return <div id="tweet-list">{tweetNodes}</div>;
    }
});

/** render BirdWatch components */
var tweetListComp = React.renderComponent(<TweetList tweets={[]}/>, document.getElementById('tweet-frame'));
var tweetCount = React.renderComponent(<TweetCount count={0}/>, document.getElementById('tweet-count'));

BirdWatch.setTweetCount = function (n) { tweetCount.setProps({count: n}); };
BirdWatch.setTweetList = function (tweetList) { tweetListComp.setProps({tweets: tweetList}); };
````

Notice the **TweetList** component close to the bottom. This component itself has elements of the **Tweet** component type as child elements which it generates inside its only method *render* by mapping data in the array to individual elements. *Render*, by the way, is the only method that a ReactJS component is required to have. In this particular component, the child elements are generated by using the map function on the props.tweet, which accordingly needs to be an array as otherwise the JavaScript map function would not be available. In the mapper function, a **Tweet** component is created for every element of the array, and that element is passed to the Tweet component as **props**. 

The Tweet component itself also has a *render* function in which it creates a **div** holding the representation of a tweet. Dynamic data for this comes from accessing the tweet object that was passed in the TweetList component. Note that the code above is not regular JavaScript but JSX, which allows writing a syntax fairly similar to HTML. This JSX is cross-compiled into JavaScript during the build process. More information on this build process can be found in the paragraph and in the **[README](https://github.com/matthiasn/BirdWatch/tree/master/react-js)**.

The **Tweet** component then includes a **RetweetCount** component, to which it passes the RT count as **props**. This component has conditional logic in which it decides itself if it wants to return an empty **div** or actual content. The same goes for the **FollowersCount** component, which I have omitted here as it follows the same principle. 

##Pagination
Unlike in the AngularJS version, where I relied on additional projects, I have implemented this from scratch with ReactJS. Here's the entire component:

{% codeblock Pagination component lang:javascript https://github.com/matthiasn/BirdWatch/blob/b9dc0b4cf19ec47c893aed27a690230dc882d1f8/react-js/jsx/pagination.js pagination.js %}
````js
/** Pagination component, allows selecting the current page in the Tweet list */
var PaginationItem = React.createClass({
    setActive: function () {this.props.setPage(this.props.page)},
    render: function() {
        return <li className={this.props.active ? "active" : ""} onClick={this.setActive}><a>{this.props.page}</a></li>
    }
});

var Pagination = React.createClass({
    toggleLive: function() { this.props.toggleLive(); },
    handleFirst: function() { this.props.setPage(1); },
    handleLast: function() { this.props.setPage(this.props.numPages); },
    handleNext: function() { this.props.setNext(); },
    handlePrevious: function() { this.props.setPrev(); },

    render: function() {
        var numPages = Math.min(+this.props.numPages, 25);
        var paginationItems = _.range(1, numPages+1).map(function (p) {
            return <PaginationItem page={p} active={p==this.props.activePage} setPage={this.props.setPage} key={p} />;
        }.bind(this));
        return <ul className="pagination-mini">
            <li className={this.props.live ? "active" : ""}><a onClick={this.toggleLive}>Live</a></li>
            <li><a onClick={this.handleFirst}>First</a></li>
            <li><a onClick={this.handlePrevious}>Previous</a></li>
            {paginationItems}
            <li><a onClick={this.handleNext}>Next</a></li>
            <li><a onClick={this.handleLast}>Last</a></li>
        </ul>
    }
});
var pagination = React.renderComponent(<Pagination numPages={1} />, document.getElementById('pagination'));
BirdWatch.setPagination = function (props) { pagination.setProps(props); };
BirdWatch.setPaginationHandlers = function (handlers) { pagination.setProps(handlers); };
````

Once again, we have two components, one for each item and one that combines the individual items. In the Pagination component, we first determine the minimum of either the number of pages (passed in as **props**) or 25 in order to render a maximum of 25 pages. Then we do a map on this the resulting range (with the range being created by an **[underscore](http://underscorejs.org)** function), rendering one PaginationItem component for each of these pages. So far this is comparable to the components we have already seen above. What is new here is that the *handler functions* are also passed as **props** and assigned by the component. The nice thing about this is that this way we can also dynamically assign handler functions. We could just as well call functions on the global application object inside the handlers, but conceptually I find it cleaner to think about the component only ever receiving props, without needing to know anything about the application it is embedded in.

##Bookmarkability
At first I did not really know how to achieve this feature using ReactJS. I have seen examples using **[Backbone](http://backbonejs.org)** and its **[router](http://backbonetutorials.com/what-is-a-router/)**, which would make sense for more complex applications. One such example is **[this article](https://medium.com/react-tutorials/c00be0cf1592)** and another one is **[this article](http://webdesignporto.com/react-js-with-backbone-router-and-local-storage/)**. For this application, introducing Backbone seemed like overkill though, so I was looking for a simpler approach. Turns out achieving this is super simple using **[jQuery](http://jquery.com)** and the plain old **[DOM API](http://www.w3.org/DOM/)**. For the search function I had already created a jQuery object:

{% codeblock searchField jQuery object lang:javascript https://github.com/matthiasn/BirdWatch/blob/ca0ffd54795f26bcbfdcdf5e3e61ea6d0e2d1950/react-js/src/app.js app.js %}
````js
var searchField = $("#searchField");
````

Then inside the search function, I simply set the **window.location.hash** with a **[URI encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)** version of the search term:

{% codeblock setting location hash when searching lang:javascript https://github.com/matthiasn/BirdWatch/blob/ca0ffd54795f26bcbfdcdf5e3e61ea6d0e2d1950/react-js/src/app.js app.js %}
````js
window.location.hash = "/" + encodeURIComponent(searchField.val());
````

Then when loading the page, I read the location hash into the search field and call *search()*, which reads the content of the search field and triggers the search with whatever is in there:

{% codeblock trigger search on page load lang:javascript https://github.com/matthiasn/BirdWatch/blob/ca0ffd54795f26bcbfdcdf5e3e61ea6d0e2d1950/react-js/src/app.js app.js %}

````js
searchField.val(decodeURIComponent(window.location.hash.substr(2)));
BirdWatch.search();
````

##Build system
To round things off, I have configured a **[grunt-based](http://gruntjs.com)** build system that automatically **[transpiles](http://en.wikipedia.org/wiki/Source-to-source_compiler)** JSX into plain old JavaScript and then concatenates the files into a single JavaScript file. I have also included tasks for **[JsHint](http://www.jshint.com)** and **[Plato code analysis](https://github.com/es-analysis/plato)** to improve code quality. Ideally there should be additional tasks for a CSS preprocessor such as **[LESS](http://lesscss.org)** and minification of HTML, CSS and JavaScript files to achieve the best user experience possible, most notably fast load times. Maybe I'll get around to that at some point in time. I should also do the same for the AngularJS version. 

##Building an SVG Bar Chart with ReactJS (without D3.js)
**[D3.js](http://d3js.org)** is an amazing technology and really great visualizations have been built with it. However it also has a considerably steep learning curve. I personally find ReactJS easier to reason about because unlike D3.js it does not have the notion of ***update***. Instead, we always pass it the entire data and it will put the changes into effect itself through an intelligent diffing mechanism where it compares current and previous versions of a (fast) virtual DOM and only puts the detected changes into effect in the (slow) actual DOM. Now I thought it would be nice if this concept could aso be applied to **[SVG (scalable vector graphics)](http://en.wikipedia.org/wiki/Scalable_Vector_Graphics)** in addition to HTML. Turns out the same principles apply, and accordingly I found it fairly simple to re-build the bar chart and have ReactJS instead of D3 create the SVG inside the **[DOM](http://en.wikipedia.org/wiki/Document_Object_Model)**. The resulting code is much shorter than the previous D3 version despite a lot of added functionality. The previous version was a simplistic bar chart, whereas the new version has a built-in trend analysis using **[regression-js](https://github.com/Tom-Alexander/regression-js)**, a neat little regression analysis library. In this new chart each bar is aware of its history and determines its trends using linear regression. Here's how that looks like:

<img src="../images/react-barchart.png" />

Each bar has two associated trend indicators, one to show recent movements in the ranking and the other to show an overall trend of the word occurrence. The trends are determined using a simple linear regression, where the slope of the resulting function directly translates into an upward or downward trend. I don't have the time to go into detail about the implementation of this chart today, but this topic should make for an interesting article in the future.  

#Conclusion
ReactJS nicely complements the rendering of the UI of the BirdWatch application. From a bird's-eye view, it is really not more than a function that accepts data and that, as a side effect, effects a DOM representation in line with the data provided. It does the rendering in a very efficient way and it is low-maintenance; it does not require any more attention than the call necessary to inform it about data changes. I find its data flow model very easy to reason about, simpler in fact than the multitude of concepts one needs to think about when building an application with AngularJS. So far AngularJS has also worked really well for this application, so I'd say both are suitable approaches to single page web applications. For now I'm curious to know your opinion. You can find the source code on **[GitHub](https://github.com/matthiasn/BirdWatch)**. A live version is available in two versions: using **[ ReactJS ](http://birdwatch.matthiasnehlsen.com/)** and using **[AngularJS](http://birdwatch.matthiasnehlsen.com/angular/#/)**.

Until next time,
Matthias

<iframe width="160" height="400" src="https://leanpub.com/building-a-system-in-clojure/embed" frameborder="0" allowtransparency="true"></iframe>

[^1]: The list of technical terms I use for the live demo under birdwatch.matthiasnehlsen.com easily fits into this cap, in which case the application will receive all these tweets. The term **Obama** also usually fits into this limit. The term **love** on the other hand doesn't. If you were to download BirdWatch from GitHub, create a Twitter API key and replace the list of software terms with only the word **love**, I bet you will reach the 1% limit any second of the day. However not to worry, Twitter will still deliver at the rate limit. When I last tried it, it was about 4 million tweets per day. Sure, you might lose tweets doing this, but there's not need to worry when you are looking for popular tweets as they will appear time and time again as a retweet, making it highly unlikely to miss them over time. Only the current retweet count may lag behind when the last update as a retweet was dropped.

[^2]: **Idempotent**: This basically means that it must be possible to call something multiple times without additional side-effects, if any at all. Idempotency, for example, is also essential in scenarios where some service guarantees an at-least-once delivery. In that case you don't want to run into trouble (like wrongfully incrementing a counter) when that service delivers more than once.
 
[^3]: **Props** in ReactJS refers to immutable data dynamically passed to a component. The component will then render itself according to the data it is fed. Functions, being first class in JavaScript, can also be passed as props. JavaScript does not actually know immutable data structures, but conceptionally we should treat any data passed to a component as immutable as it will make our component much easier to reason about. 


