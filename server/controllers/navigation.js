'use strict';

const db = require("../database/navigation.js"),
	pageHelper = require("../helpers/pageHelper");;

// get the page content and send it to the client
function getNavLinks(req, res) {

	db.getNavLinks()
	.then( sections => {
		sections = pageHelper.populatePageUrls(sections);
		res.json(sections);
	})
	.catch( err => {
        console.log(err);
        res.statusCode = 500;
		res.end();	//response report error	T#D
	});

}

exports.getNavLinks = getNavLinks;
