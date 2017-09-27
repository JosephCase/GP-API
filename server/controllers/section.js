'use strict';

var config = require("../../config/config.js"),
	formidable = require("formidable"),	//do I need formiddable here?#
	db = require("../database/section.js"),
	pageHelper = require("../helpers/pageHelper"),
	imageHandler = require("../fileSystem/imageHandler.js");

function getSection(req, res) {
	let sectionId = req.params.id;

	let promises = [];
	var embedPages = req.query.embedPages;

	promises.push(db.getSection(sectionId));
	if (embedPages) promises.push(db.getSectionPages(sectionId));

	Promise.all(promises)
	
	.then( results => {
		let section = results[0];
		if(embedPages && results.length > 1) {			
			let pages = pageHelper.populatePageUrls(results[1]);
			section.pages = pages;
		}

		res.json(section);
	})
	.catch( err => {
		console.log(`Error: Getting section details, ${err}`);
		res.status(500).json({message: "Internal server error retrieving section details.", error: err})	//#todo
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

	var form = new formidable.IncomingForm();

	form.parse(req, function(err, pages) {
		
		if(err) {
			console.log(`Error parsing re-order section form: ${err}`);
			res.status(400).json({message: "Bad request, re-order section form.", error: err});
		} else {

			db.reOrderPages(pages)
			.then(response.end)
			.catch( err => {
				console.log(err)
				res.status(500).json({message: "Internal server error re-ordering pages.", error: err});
			})		
		}		

	});	
}

exports.getSection = getSection;
exports.addPage = addPage;
exports.reOrderPages = reOrderPages;
