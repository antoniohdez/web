var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/login', function (req, res) {
	res.render("login", {
		"title" : "Please log in to LanguageCast!"
	});
})

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/login');
});

router.get('/videocall', function (req, res) {
	res.render("videocall", {
		"title" : "Videocall",
		"user" : req.user
	});
})

module.exports = router;
