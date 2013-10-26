var sys = require('sys'),
    request = require('request'),
    mongoose = require('mongoose'),
    HashMap = require('hashmap').HashMap,
    FeedParser = require('feedparser');

module.exports.update = function(rssMap, rssModel)
{
    rssMap.forEach(function(rssUrl, topic)
    {
      var cp = 0;
      var date;
      var rssFeed;
      var string;
      console.log("topic = "+topic);
      request(rssUrl)
      .pipe(new FeedParser())
      .on('error', function(error) {
        //console.error(error);
      })
      .on('meta', function (meta) {
        //console.log('===== %s =====', meta.title);
      })
      .on('readable', function () {
         var stream = this, item;
        while (item = stream.read()) {
            if(cp < 20 && item .enclosures[0] != undefined)
            {
                //console.log("item ###########= %s", sys.inspect(item.title));
                date = new Date(Date.parse(item.pubDate));
                string = item.description;
                //string = item.description.replace(/<a\b[^>]*>(.*?)<\/a>/i,"");
                //string = string.replace(/<img\b[^>]*>(.*?)<\/img>/i,"");
                
                rssFeed = new rssModel (
                      {
                        'title':item.title, 
                        'topic':topic,
                        'content':string,
                        'link': item.link,
                        'img': item.enclosures[0].url,
                        'date': date
                      });
                
                //console.log("tittle == %s %d", rssFeed.title, cp);

                (function (rssObject) {
                  rssModel.findOne({ 'title': rssObject.title }, function (err, feed)
                  {
                    if(!feed)
                    {
                      rssObject.save(function(err){
                          //if (err) { console.log(err); }
                          //else console.log('%s Item added :  %s', topic, rssObject.title);
                      });
                    }
                    //else 
                      //console.log("%s existing : %s", topic, sys.inspect(feed.title));

                  });
                })(rssFeed);
            } 
        }
        cp++;
      });
    });
}


/*

for(var i = 0; i < names.length; i++) {
    (function (name_now) {
        Person.findOne({ name: name_now},
            function(err, doc) {
                if(!err && !doc) {
                    var personDoc = new PersonDoc();
                    personDoc.name = name_now;
                    console.log(personDoc.name);
                    personDoc.save(function(err) {});
                } else if(!err) {
                    console.log("Person is in the system");
                } else {
                    console.log("ERROR: " + err);
                }
            }
        ); 
      }  
    )(names[i]);
}
*/

module.exports.remove = function(rssMap, rssModel) {
   rssMap.forEach(function(rssUrl, topic) {
    rssModel.count({ 'topic': topic }, function (err, c)
      {
          //console.log('%s count = %d', topic, c);
          if(c > 20)
          {
            /*
              rssModel.findOne({ 'topic': 'politique' }, function(error, query) {
                if(error) {
                  console.log(error);
                }
                else if(query) {
                  query.remove(function(error) {
                    console.log("last item removed");
                  });
                }
              })
              .sort('date', -1)
              .limit(c-10);
            */
            
            rssModel.find({ 'topic': topic })
              .sort({'date': 1})
              .limit(c-20)
              .exec(function(error, queries) {
                if(error) {
                  console.log(error);
                }
                else if(queries) {
                  queries.forEach( function(doc) {
                    //console.log("%s last item removed : %s", topic, doc.title);
                    doc.remove();
                  });
              }
            });
            

          }
      });
    });
}

module.exports.read = function(rssMap, rssModel) {
  rssMap.forEach(function(rssUrl, topic) {
    rssModel.find({ 'topic': topic }, function (err, queries)
                  {
                    if(queries) {
                      queries.forEach( function(doc) {
                      
                      doc.remove(function(err) {
                          console.log("%s db inside : %s", topic, doc.title);
                      });
                    });

                  }
    });
  });
}

module.exports.updateInterval = function (rssMap, rssModel){

  setInterval(update(rssMap, rssModel), 60*1000);
}