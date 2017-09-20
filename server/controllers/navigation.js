'use strict';

const db = require("../database/navigation.js");

// get the page content and send it to the client
function getNavLinks(req, res) {

	db.getNavLinks()
	.then( sections => {
		res.end(JSON.stringify(sections));
	})
	.catch( err => {
        // res.statusCode = 500;
		res.end();	//response report error	T#D
	});

}

exports.getNavLinks = getNavLinks;
