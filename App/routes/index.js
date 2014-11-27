var express = require('express');

exports.index = function(req, res) {
	res.render("index", {
		"title"		: "Welcome to LanguageCast",
		"age"		: "21",
		"country"	: "Mexico",
		"user"		: req.user
	});
};