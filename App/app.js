var express = require('express');//Main framework
var path = require('path');
var favicon = require('serve-favicon');
var cons = require('consolidate');// Views engine

var routes = require('./routes');


var mongoose = require('mongoose');
var passport = require('passport'); //ronald

require('./models/user');
require('./passport')(passport);

mongoose.connect('mongodb://localhost:27017/LanguageCast', function(err, res){
    if(err) throw err;
    console.log('Conectado con éxito a la BD');
});

var app = express();

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));

// COMMENT IN PRODUCTION!
app.set("env", "development");

app.use(express.cookieParser());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.session({secret: 'lolllo'}));

app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

if('development' == app.get('env')){
	app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/login', function (req, res) {
	res.render("login", {
		"title" : "Please log in to LanguageCast!"
	});
})

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/login');
});

app.get('/videocall', function (req, res) {
	res.render("videocall", {
		"title" : "Videocall",
		"user"	: req.user
	});
})

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'read_stream'] }));


app.get('/auth/twitter/callback', passport.authenticate('twitter',
	{ successRedirect: '/', failureRedirect:'/login'}
));

app.get('/auth/facebook/callback', passport.authenticate('facebook',
	{ successRedirect: '/', failureRedirect:'/login'}
));


app.listen(app.get('port'), function(){
	console.log('Aplication listening in port'+ app.get('port'));
});


