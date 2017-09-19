'use strict';

var formidable = require("formidable"),	//do I need formiddable here?#
	db = 

// get section TODO #

function reOrderPages(request, response) {

	var form = new formidable.IncomingForm();

	form.parse(request, function(error, pages) {
		
		if(error) {
			console.log(`Error parsing re-order section form: ${error}`);
			response.end();	//response report error	T#D
		} else {

			reOrderPages(pages)
			.then(response.end)
			.catch( err => {
				// res.statusCode = 500;
				res.end();	//response report error	T#D
			})		
		}		

	});	
}

exports.reOrderPages = reOrderPages;
