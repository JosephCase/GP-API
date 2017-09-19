var express = require('express');
var navigation = require(".controllers/navigation");
var section = require(".controllers/section");
var page = require("./page");
var cookieParser = require('cookie-parser');
var config = require('./config/config.js');
var formidable = require("formidable");

var app = express();

//static files
app.use(express.static(__dirname + '/static'));
app.use('/content', express.static(__dirname + '/content'));

//session check
app.use(cookieParser("'verde_speranza'"));

app.post("/login", function(req, res) {
	
	var form = new formidable.IncomingForm();

	form.parse(req, function(error, fields) {
		if(error) {
			res.write('error');
		} else {

			if(fields.username == config.login.username && fields.password == config.login.password) {
				res.cookie('user', 'giusy', { signed: true });
				res.write('success');		
			} else {
				res.write('failure');
			}

		}

		res.end();

	});

});

var sessionChecker = function (req, res, next) {

	console.log('Check session for ' + req.url);

	if(req.signedCookies.user == 'giusy') {
		next();
	} else {
		console.log('REDIRECT TO LOGIN');
		res.redirect('/login.html');
	}
};

app.use(sessionChecker);


app.get("/section", function(req, res) {
	navigation.getSections(req, res);
});
// app.get("/section/:id", function(req, res) {
// 	section.getSection(req, res);
// });	TODO#
app.put("/section/:id", function(req, res) {
	section.reOrderPages(req, res);
});


app.get("/page", function(req, res) {
	page.getPage(req, res);
});
app.post("/page", function(req, res) {
	page.createPage(req, res);
});
app.patch("/page", function(req, res) {
	page.updatePage(req, res);
});

var server = app.listen(config.port, function () {

	console.log("Express Server started listening to port " + config.port);
	server.timeout = config.reqTimeout;
	
});

