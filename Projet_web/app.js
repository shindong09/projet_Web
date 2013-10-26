var sys = require('sys'),
    express = require('express'),
    app = express(),
    path = require('path'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require('mongoose'),
    //request = require('request'),
    //htmlparser = require("htmlparser2"),
    //FeedParser = require('feedparser');
    HashMap = require('hashmap').HashMap,
    update = require('./updateFeed').update,
    remove = require('./updateFeed').remove;


mongoose.connect('mongodb://localhost/WebProject', function(err) {
  if (err) { throw err; }
});



var RssSchema = new mongoose.Schema({
  topic : { type: String, required: true },  
  content : { type: String, required: true },  
  title : { type: String, required: true, unique: true },  
  link : { type: String, required: true, unique: true },  
  img : { type: String, required: true },  
  date : { type: Date, required: true }
});


var RssModel = mongoose.model('rssFeed', RssSchema);

/*
var rssSave = new RssModel({ pseudo :  });


var rssSave.save(function (err) {
  if (err) { throw err; }
  console.log('rss ajouté avec succès !');
  // On se déconnecte de MongoDB maintenant
  //mongoose.connection.close();
});

*/

var news = new Array();

var rssMap = new HashMap();
rssMap.set("politique", "http://rss.lemonde.fr/c/205/f/3067/index.rss");
rssMap.set("technologie", "http://rss.lemonde.fr/c/205/f/3061/index.rss");
rssMap.set("international", "http://rss.lemonde.fr/c/205/f/3052/index.rss");
rssMap.set("sport", "http://rss.lemonde.fr/c/205/f/3058/index.rss");
rssMap.set("economie", "http://rss.lemonde.fr/c/205/f/3055/index.rss");





function linkify(text) {
	return '<a href="'+text.link+'" target="_blank">'+text.content+'</a>';
}


server.listen(8080);

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res)
{
    res.render('index.html');
});

//app.use(express.static(path.join(__dirname, 'Html')));

//app.set('views', __dirname + '/Html');
/*
app.get('/', function(req, res, next){
  res.render(__dirname + '/index.html');
});
*/
console.log('Server running at http://localhost:8080/');
/*

rss1.on('article', function(a) {
    socket.sockets.emit("hackernews","▸ "+linkify(a));
    console.log(sys.inspect(a)+"\n");
});
rss2.on('article', function(a) {
    socket.sockets.emit("lejournaldugeek","▸ "+linkify(a));
    console.log(sys.inspect(a)+"\n");
});
rss3.on('article', function(a) {
    socket.sockets.emit("reddit","▸ "+linkify(a));
    console.log(sys.inspect(a)+"\n");
});


pollPoli.on("article", function(a) {
    
    io.sockets.emit("hackernews","▸ "+linkify(a));
    console.log(sys.inspect(a)+"\n");
    
    var src = a.content.match(/src="([^\"]*)"/gim);
    var image = src[0].replace(/src=|"/gim, "");
    console.log(sys.inspect(image)+"\n")
    
    

  var src = a.content.match(/src="([^\"]*)"/gim);
  var image = src[0].replace(/src=|"/gim, "");
  var rssSave = new RssModel({ topic: 'Politic', 
                               content: a.content,
                               title: a.title,
                               link: a.link,
                               img: image,

  });


  var rssSave.save(function (err) {
    if (err) { throw err; }
    console.log('rss ajouté avec succès !');
    // On se déconnecte de MongoDB maintenant
    //mongoose.connection.close();
  });

});

*/

//rss1.start('http://news.ycombinator.com/rss');
//rss2.start('http://feeds.feedburner.com/LeJournalduGeek');
//rss3.start('http://www.reddit.com/.rss');
//pollPoli.start();
//poll2.start();
/*
var parser = require('blindparser');
parser.parseURL('http://rss.lemonde.fr/c/205/f/3067/index.rss', function(err, out){
    console.log(out);
});
*/
/*
var res = "";

request('http://rss.lemonde.fr/c/205/f/3067/index.rss', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    parser.read(res);
  
    //console.log(res);
  }
})

var parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
        console.log(name);
    },
    ontext: function(text){
    },
    onclosetag: function(tagname){
    }
});
*/
//console.log(res);

/*
request('http://rss.lemonde.fr/c/205/f/3067/index.rss')
  .pipe(new FeedParser())
  .on('error', function(error) {
    console.error(error);
  })
  .on('meta', function (meta) {
    console.log('===== %s =====', meta.title);
  })
  .on('readable', function () {
     var stream = this, item;
    while (item = stream.read()) {
      console.log('Got article: %s', sys.inspect(item.enclosures[0].url));
    }
  });
*/

//update(rssMap, RssModel);
//remove(rssMap, RssModel);
//read(rssMap, RssModel);


update(rssMap, RssModel);
RssModel.find()
    .sort({'date': -1})
    .limit(18)
    .exec(function(error, queries) {
      if(error) {
        console.log(error);
      }
      else if(queries) {
        var i = 0;
        queries.forEach( function(doc) {
          //io.sockets.emit("news "+cp, doc);
          news[i] = doc;
          console.log("initiate : %s %s", news[i].title, doc.topic);
          i++;
        });
      }
});

io.sockets.on('connection', function (socket) {
  /*
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  */
  for(var i=0; i<18; i++){
    socket.emit('news '+i, news[i]);
    console.log("send initiate news : "+news[i].title);
  }
});



var minutes = 15;
setInterval(function() {
  update(rssMap, RssModel);
  remove(rssMap, RssModel);

  RssModel.find()
    .sort({'date': -1})
    .limit(18)
    .exec(function(error, queries) {
      if(error) {
        console.log(error);
      }
      else if(queries) {
        var cp = 0;
        queries.forEach( function(doc) {
          io.sockets.emit("news "+cp, doc);
           news[cp] = doc;
          console.log("sending : %s %s", doc.title, doc.topic);
          cp++;
        });
      }
   });

}, minutes*60*1000);

