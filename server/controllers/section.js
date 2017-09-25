'use strict';

var config = require("../../config/config.js"),
	formidable = require("formidable"),	//do I need formiddable here?#
	db = require("../database/section.js");

function getSection(req, res) {
	var sectionId = req.params.id;

	Promise.all([db.getSection(sectionId), db.getSectionPages(sectionId)])
	
	.then( results => {
		let section = results[0];
		let pages = results[1];
		section.pages = pages;
		res.end(JSON.stringify(section));
	})
	.catch( err => {
		console.log(err);
		res.end()	//#todo
	})

}

function addPage(req, res) {

	var form = new formidable.IncomingForm();

	form.parse(req, function(err, fields) {

		if(err) {
			console.log(`Error parsing add page form: ${err}`);
			response.end();
		} else {

			var sectionId = req.params.id;

			db.addPage(sectionId, fields.name)	
			.then( page => {
				let resBody = {
					id: page.id,
					name: page.name,
					links: {
						self: `${config.rootPath}/page/${id}`
					}
				};
				res.end(JSON.stringify(resBody));
			})
			.catch( error => {
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
