'use strict';

const db = require("../database/navigation.js"),
	pageHelper = require("../helpers/pageHelper");;

// get the page content and send it to the client
function getNavLinks(req, res) {

	let filterVisible = (req.query.visible && req.query.visible.toLowerCase() === 'true');

	db.getNavLinks()
	.then( sections => {
		sections = pageHelper.populatePageUrls(sections);

		if(filterVisible) sections = pageHelper.filterVisible(sections);

		res.json(sections);
	})
	.catch( err => {
        console.log(err);
		res.status(500).json({message: "Problem getting navigation links", error: err});	//response report error	T#D
	});

}

exports.getNavLinks = getNavLinks;
