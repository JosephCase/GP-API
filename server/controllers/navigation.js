'use strict';

const db = require("../database/navigation.js");

// get the page content and send it to the client
function getSections(req, res) {

	db.getSections()
	.then( sections => {
		res.end(JSON.stringify(sections));
	})
	.catch( err => {
        // res.statusCode = 500;
		res.end();	//response report error	T#D
	});

}

exports.getSections = getSections;
