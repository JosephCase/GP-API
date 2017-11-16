'use strict';

var config = require("../../config/config.js"),
	formidable = require("formidable"),	//do I need formiddable here?#
	db = require("../database/section.js"),
	pageHelper = require("../helpers/pageHelper"),
	imageHandler = require("../fileSystem/imageHandler.js");

function getSection(req, res) {
	let sectionId = req.params.id;

	let promises = [];
	let embedPages = (req.query.embed === 'pages');
	let filterVisible = (req.query.visible && req.query.visible.toLowerCase() === 'true');

	promises.push(db.getSection(sectionId));
	if (embedPages) promises.push(db.getSectionPages(sectionId));

	Promise.all(promises)	
	.then( results => {
		let section = results[0];
		if(embedPages && results.length > 1) {			
			let pages = pageHelper.populatePageUrls(results[1]);
			if(filterVisible) pages = pageHelper.filterVisible(pages);
			section.pages = pages;
		}

		res.json(section);
	})
	.catch( err => {
		console.log(err);
		res.status(500).json({message: "Internal server error retrieving section details.", error: err})	//#todo
	})

}

function getSectionPages(req, res) {
	let sectionId = req.params.id;

	db.getSectionPages(sectionId)
	.then( pages => {
		pages = pageHelper.populatePageUrls(pages);
		// if(filterVisible) pages = pageHelper.filterVisible(pages);
		res.json(pages);
	})
	.catch( err => {
		console.log(err);
		res.status(500).json({message: "Internal server error retrieving section pages.", error: err})	//#todo
	})

}



function addPage(req, res) {

	var form = new formidable.IncomingForm();
	let resBody;

	form.parse(req, function(err, fields, files) {

		if(err) {
			console.log(`Error parsing add page form: ${err}`);
			res.status(400).json({message: "Bad request, error parsing add page form.", error: err});
		} else {

			var sectionId = req.params.id;

			db.addPage(sectionId, fields.name)	
			.then( page => {
				resBody = {
					id: page.id,
					name: page.name,
					visible: page.visible,
					mainImageUrl: page.mainImage_url,
					links: {
						self: `/pages/${page.id}`
					}
				};
				if(!files.mainImage) return Promise.resolve();
				
				return imageHandler.saveImage(files.mainImage, page.mainImage_url);
			})
			.then(() => {
				res.status(201).json(resBody);				
			})
			.catch( err => {
				console.log(err)
				res.status(500).json({message: "Internal server error creating page.", error: err});

			})
		}
	});
}

function reOrderPages(req, res) {

	let pages = req.body;

	db.reOrderPages(pages)
	.then(() => {
		res.end();
	})
	.catch( err => {
		console.log(err)
		res.status(500).json({message: "Internal server error re-ordering pages.", error: err});
	});

}

exports.getSection = getSection;
exports.getSectionPages = getSectionPages;
exports.addPage = addPage;
exports.reOrderPages = reOrderPages;
