'use strict';

var config = require("../../config/config.js"),
	formidable = require("formidable"),	//do I need formiddable here?#
	db = require("../database/section.js"),
	pageHelper = require("../helpers/pageHelper"),
	fileSystem = require("../fileSystem/fileSystem.js");

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
		res.status(500).end()	//#todo
	})

}



function addPage(req, res) {

	var form = new formidable.IncomingForm();
	let resBody;

	form.parse(req, function(err, fields, files) {

		if(err) {
			console.log(`Error parsing add page form: ${err}`);
			response.end();
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
				
				return fileSystem.saveImage(files.mainImage, page.mainImage_url);
			})
			.then(() => {
				res.json(resBody);				
			})
			.catch( err => {
				console.log(`Error adding new page: ${err}`)
				res.end()	//#todo
			})
		}
	});
}

function reOrderPages(req, res) {

	var form = new formidable.IncomingForm();

	form.parse(req, function(error, pages) {
		
		if(error) {
			console.log(`Error parsing re-order section form: ${error}`);
			res.end();	//response report error	T#D
		} else {

			db.reOrderPages(pages)
			.then(response.end)
			.catch( err => {
				// res.statusCode = 500;
				res.end();	//response report error	T#D
			})		
		}		

	});	
}

exports.getSection = getSection;
exports.addPage = addPage;
exports.reOrderPages = reOrderPages;
