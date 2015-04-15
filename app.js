var express = require ('express');

var http = require('http');

var path = require('path');

var mysql = require('mysql');

var multer = require('multer');

var chance = require('chance');

var app = express();

//app.set('port', 2345);
// var server = app.listen(1200);

app.use(multer({
  dest: './uploads/',
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
  }
}));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
var server = app.listen(process.env.PORT, function() {
    console.log('Listening to ', process.env.PORT);
});

var io = require('socket.io').listen(server);


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));

var routes = require('./routes/routes.js')(app, io);