---
layout: post
title: "ReactiveMongo 0.9 and Lossless Persistence"
date: "2013-04-26"
comments: true
categories: 
---
Initially I parsed the Tweets in the **[BirdWatch](http://birdwatch.matthiasnehlsen.com)** application into instances of a Tweet case class upon ingestion and then used that case class representation throughout, including for database persistence. Then I realized that that was actually not a good idea. Using a case class for passing around information in the application is very convenient and useful. But for the persistence, I argue that we cannot afford to be opinionated about what to keep and what to throw away. I fixed this together with the planned migration to **[ReactiveMongo](http://reactivemongo.org)** version 0.9 in the latest commits, storing each  observable fact coming from the **[Twitter Streaming API](https://dev.twitter.com/docs/streaming-apis)** in its entirety.

Any data model will almost invariably be wrong in the future as we cannot predict what we will want to analyze later. We can always change the data model at a later point and from then on store a different interpretation of the observable fact, but then we would not have complete historic information when we want to test our hypotheses on retrospective data. The solution for this is to store the Tweets in their complete **[JSON](http://tools.ietf.org/html/rfc4627)** representation. **[MongoDB](http://www.mongodb.org)** is a great choice for this as it allows indexing our data while leaving the **[JSON](http://tools.ietf.org/html/rfc4627)** structure intact. We get the best of two worlds. With this lossless persistence we can always reconstruct the observable fact from the database while at the same time being able to quickly search through a potentially large dataset.

I also wanted to upgrade **[ReactiveMongo](http://reactivemongo.org)** in order to fix a previous problem with Killcursors. Version 0.9 entails some changes in the API, so it was a good idea to tackle the upgrade and the Tweet persistence layer together. Let's go through some of the changes:

````scala
/** Mongo connection object */
object Mongo {  
  val connection = MongoConnection(List("localhost:27017"))  
  val db = connection("BirdWatch")
}
````
[Mongo Connection in Version 0.8](https://github.com/matthiasn/BirdWatch/blob/53b79386ef49d80a1d4d1eae1086b9aff5485fa2/app/utils/Mongo.scala)

````scala
/** Mongo connection object */
object Mongo {
  val driver = new MongoDriver
  val connection = driver.connection(List("localhost:27017"))
  val db = connection("BirdWatch")
}

````
[Mongo Connection in Version 0.9](https://github.com/matthiasn/BirdWatch/blob/2738bfdafb2a2367a79177b615adb58ce5d51c5b/app/utils/Mongo.scala)

**[ReactiveMongo](http://reactivemongo.org)** now uses an instance of the **[MongoDriver](https://github.com/zenexity/ReactiveMongo/blob/7d2328a337a9092d31801180b97e271a343abf29/driver/src/main/scala/api/api.scala)** class and its connection method. The **[MongoConnection](https://github.com/zenexity/ReactiveMongo/blob/7d2328a337a9092d31801180b97e271a343abf29/driver/src/main/scala/api/api.scala)** class still exists, but I couldn't get it to work for some reason.

I have moved the Tweet collection and basic query and insert methods into a Tweet companion object, with the intention of turning this into a lightweight **[DAO (Data Access Object)](http://en.wikipedia.org/wiki/Data_access_object)** for Tweets:

{% codeblock Tweet Companion Object lang:scala https://github.com/matthiasn/BirdWatch/blob/290c609cccbf17076074e1eb2fa4e31bb350ca37/app/models/Tweet.scala Tweet.scala %}

````scala
/** Data Access Object for Tweets*/
object Tweet {
  def rawTweets: JSONCollection = Mongo.db.collection[JSONCollection]("rawTweets")
  def insertJson(json: JsValue) = rawTweets.insert[JsValue](json)

  /** get collection size from MongoDB (fast) */
  def count: Future[Int] = Mongo.db.command(Count("rawTweets"))

  /** Query latest tweets (lazily evaluated stream, result could be of arbitrary size) */
  def jsonLatestN(n: Int): Future[List[JsObject]] = {
    val cursor: Cursor[JsObject] = rawTweets
      .find(Json.obj("text" -> Json.obj("$exists" -> true)))
      .sort(Json.obj("_id" -> -1))
      .cursor[JsObject]
    cursor.toList(n)
  }
}
````

Storing the **[JSON](http://tools.ietf.org/html/rfc4627)** from Twitter not only prevents us from throwing away data we might need in the future, it is also much simpler than having to deal with implicit **[BSONReader](https://github.com/zenexity/ReactiveMongo/blob/7d2328a337a9092d31801180b97e271a343abf29/bson/src/main/scala/handlers.scala)** and **[BSONWriter](https://github.com/zenexity/ReactiveMongo/blob/7d2328a337a9092d31801180b97e271a343abf29/bson/src/main/scala/handlers.scala)** objects as was previously the case:

{% codeblock BSON implicits (with 0.8) lang:scala https://github.com/matthiasn/BirdWatch/blob/f51dac075a6d287b58e55771497b4fd6aa00f32a/app/models/TweetImplicits.scala TweetImplicits.scala %}
````scala
  implicit object TweetBSONWriter extends BSONWriter[Tweet] {
    def toBSON(t: Tweet) = {
      BSONDocument(
        "_id" -> t.id.getOrElse(BSONObjectID.generate),
        "tweet_id" -> BSONLong(t.tweet_id),
        "screen_name" -> BSONString(t.screen_name),
        "text" -> BSONString(t.text),
        "wordCount" -> BSONInteger(t.wordCount),
        "charCount" -> BSONInteger(t.charCount),
        "location" -> BSONString(t.location),
        "profile_image_url" -> BSONString(t.profile_image_url),
        "geo" -> BSONString(t.geo.getOrElse("")),
        "created_at" -> BSONDateTime(t.created_at.getMillis)
      )
    }
  }
  
  implicit object TweetBSONReader extends BSONReader[Tweet] {
    def fromBSON(document: BSONDocument): Tweet = {
      val doc = document.toTraversable
      Tweet(
        doc.getAs[BSONLong]("tweet_id").get.value,
        doc.getAs[BSONString]("screen_name").get.value,
        doc.getAs[BSONString]("text").get.value,
        doc.getAs[BSONInteger]("wordCount").get.value,
        doc.getAs[BSONInteger]("charCount").get.value,
        doc.getAs[BSONString]("location").get.value,
        doc.getAs[BSONString]("profile_image_url").get.value,
        None,
        new DateTime(doc.getAs[BSONDateTime]("created_at").get.value),
        doc.getAs[BSONObjectID]("_id")
      )
    }
  }
````

Instead we just parse a **[JSON](http://tools.ietf.org/html/rfc4627)** string from Twitter and insert the parsed **[JsValue](https://github.com/playframework/Play20/blob/2.1.1/framework/src/play/src/main/scala/play/api/libs/json/JsValue.scala)** into the **[JSONCollection](https://github.com/zenexity/Play-ReactiveMongo/blob/a7164a1ac0832680ca0f4c3da0b6949ffea282b0/src/main/scala/play/modules/reactivemongo/jsoncollection.scala)**: 

{% codeblock Inserting into database  lang:scala https://github.com/matthiasn/BirdWatch/blob/e33ce62bb36b4a1228c2f1519de60ef3d65482bd/app/actors/TwitterClient.scala TwitterClient.scala %}
````scala
  val json = Json.parse(chunkString)

  /** persist any valid JSON from Twitter Streaming API */
  Tweet.insertJson(json)
````

This is really all there is to storing **[JSON](http://tools.ietf.org/html/rfc4627)** into MongoDB now. I don't have to worry about additional fields or other changes in the Twitter Streaming API. If it is valid **[JSON](http://tools.ietf.org/html/rfc4627)**, it will find its way into the database. Major changes to the API might break parsing into Tweets, but they would not break database persistence. 

Error and status messages from Twitter also come as **[JSON](http://tools.ietf.org/html/rfc4627)**, so they are stored as well:

````js
{ "_id" : ObjectId("…"), "disconnect" : 
  { "code" : 7, "stream_name" : "_MNehlsen-statuses237381", 
    "reason" : "admin logout" } }
````

Querying is more concise than before, making use of Json.obj instead of BSONDocuments: 

{% codeblock OLD: Query for latest Tweets lang:scala https://github.com/matthiasn/BirdWatch/blob/53b79386ef49d80a1d4d1eae1086b9aff5485fa2/app/controllers/Twitter.scala Twitter.scala %}
````scala
def latestTweetQuery: Future[List[Tweet]] = {
  val query = QueryBuilder().query(BSONDocument("created_at" -> 
    BSONDocument("$lte" -> BSONDateTime(DateTime.now.getMillis))))
    .sort("created_at" -> SortOrder.Descending)

  val cursor = Mongo.tweets.find(query)
  cursor.toList
}
````

{% codeblock NEW: Query for latest Tweets lang:scala https://github.com/matthiasn/BirdWatch/blob/4abf8f2fe50986b3dd695998a553b8a9888fce71/app/models/Tweet.scala Tweet.scala %}
````scala
def jsonLatestN(n: Int): Future[List[JsObject]] = {
  val cursor: Cursor[JsObject] = rawTweets
    .find(Json.obj("text" -> Json.obj("$exists" -> true)))
    .sort(Json.obj("_id" -> -1))
    .cursor[JsObject]
  cursor.toList(n)
}
````

This looks much neater and is also close to the syntax in the MongoDB JavaScript shell: 

{% codeblock JavaScript query in MongoDB shell  lang:javascript %}
````js
db.rawTweets.find( { "text" : { "$exists" : true} } )
  .sort( { "_id": -1 } )
````
    
Curly braces get replaced by Json.obj() and the colon gets replaced by "->". Other than that, the syntax is very close. Note the "$exists" part. This limits the results to only Tweets (and potentially error and status messages that have a "text" field, but I have not encountered those). 

The usage above with generating a List from the cursor works fine for small n, but for larger results sets (say hundreds of thousands of items) it would be a bad idea to build the list in memory first. Luckily ReactiveMongo allows us to stream the results. That itself is not new, but since version 0.9 we can limit the number of results, making this much more useful for a latestN scenario:

{% codeblock Enumerating cursor of Tweets lang:scala https://github.com/matthiasn/BirdWatch/blob/466cce67a38265e311970466b3bf5529fda54f12/app/models/Tweet.scala Tweet.scala %}
````scala
/** Enumerate latest Tweets (descending order) into specified Iteratee.
 * @param n number of results to enumerate over
 **/
def enumJsonLatestN(n: Int): Enumerator[JsObject] = {
  val cursor: Cursor[JsObject] = rawTweets
    .find(Json.obj("text" -> Json.obj("$exists" -> true)))
    .sort(Json.obj("_id" -> -1))
    .cursor[JsObject]
  cursor.enumerate(n)
}
````

With this we create an Enumerator of JsObjects that streams the results into an Iteratee. The usage of this is simple once we understand what this pattern means. Check out my previous **[Iteratee article](http://matthiasnehlsen.com/blog/2013/04/23/iteratee-can-i-have-that-in-a-sentence/)**, hope it helps a little bit.

This allows us to stream results into an Iteratee that will do whatever we need, in this case just doing a simple foreach:

````scala
val dbTweetIteratee = Iteratee.foreach[JsObject] {
  json => TweetReads.reads(json) match {
    case JsSuccess(t: Tweet, _) =>   
      tweetChannel.push(WordCount.wordsChars(t)) // word and char count for each t
    case JsError(msg) => println(json)
  }
}
Tweet.enumJsonLatestN(500)(dbTweetIteratee)
````

I currently do not enumerate the results into an Iteratee because the Tweets would appear in the wrong order in the UI and I cannot easily reverse the direction in which the Tweets are enumerated without an auto-incrementing counter in MongoDB to determine from where to start enumerating in ascending order (from position [collectionsize - n]). But this is more a problem of the UI, the next versions will certainly make use of this pattern.

The only thing I was still missing is an easy way to get the size of a collection. In the shell we would write:

````js
db.rawTweets.find( { "text" : { "$exists" : true} } ).count()
````

Turns out that in ReactiveMongo, we can use the Count command for this, which returns a Future[Int] with the result (see Tweet.scala above).
This allows us to do something upon return of the collection size in a non-blocking way:

{% codeblock Using Count Command lang:scala https://github.com/matthiasn/BirdWatch/blob/fd44fe45163233746b8caacc0dbba5c815e3f964/app/actors/TwitterClient.scala TwitterClient.scala %}
````scala
Tweet.count.map(c => println("Tweets: " + c))
````

Great stuff, I really like **[ReactiveMongo](http://reactivemongo.org)**. The documentation has also gotten a lot better in 0.9, compared to previous versions. Nonetheless it takes some source code reading to find some of the good stuff. I'd be more than to happy help out here and contribute to the project documentation.

-Matthias

<iframe width="160" height="400" src="https://leanpub.com/building-a-system-in-clojure/embed" frameborder="0" allowtransparency="true"></iframe>