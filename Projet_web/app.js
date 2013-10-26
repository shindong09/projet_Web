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

var minutes = 15;
var topicUser = "";
var chosenTopic = false;

io.set('log level', 1);

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

var initiate = false;

update(rssMap, RssModel);
RssModel.find()
    .sort({'date': -1})
    .limit(18)
    .exec(function(error, queries) {
      var cp = 0;
      if(error) {
        console.log(error);
      }
      else if(queries) {
        var i = 0;
        queries.forEach( function(doc) {
          io.sockets.emit("news "+cp, doc);
          news[i] = doc;

          if(!initiate)
            initiate = true;

          console.log("initiate : %s %s", news[i].title, doc.topic);
          i++;
        });
      }
});


io.sockets.on('connection', function (socket) {
 

  socket.on('politique', function (socket) {

    //console.log("politique");
    topicUser = "politique";
    chosenTopic = true;
    emitNewsTopic(topicUser);

  });  

  socket.on('international', function (socket) {


  topicUser = "international";
  chosenTopic = true;
  emitNewsTopic(topicUser);

  }); 

  socket.on('technologie', function (socket) {


    topicUser = "technologie";
    chosenTopic = true;
    emitNewsTopic(topicUser);

  }); 

  socket.on('sport', function (socket) {


    topicUser = "sport";
    chosenTopic = true;
    emitNewsTopic(topicUser);

  }); 

  socket.on('economie', function (socket) {


    topicUser = "economie";
    chosenTopic = true;
    emitNewsTopic(topicUser);

  });   

  socket.on('actualite', function (socket) {


    topicUser = "";
    chosenTopic = false;
    emitNewsNoTopic();

  }); 
  
  
  console.log("initiate");

  for(var i=0; i<18; i++){
    socket.emit('news '+i, news[i]);
    //console.log("send initiate news : "+news[i].title);
  }
});

emitNewsTopic = function(topic) {
  RssModel.find({'topic': topic})
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
          if(initiate)
           news[cp] = doc;
          console.log("sending : %s %s", doc.title, doc.topic);
          cp++;
        });
      }
   });
}

emitNewsNoTopic = function() {
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
          if(initiate)
           news[cp] = doc;
          console.log("sending : %s %s", doc.title, doc.topic);
          cp++;
        });
      }
   });
}



setInterval(function() {
  update(rssMap, RssModel);
  remove(rssMap, RssModel);
  if(chosenTopic)
    emitNewsTopic(topicUser);
  else
    emitNewsNoTopic();
}, minutes*60*1000);

