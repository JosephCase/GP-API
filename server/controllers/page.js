'use strict';

db = require("../database/section.js");

function getPage(req, res) {

	var pageId = req.params.id;

	if(!pageId) res.end();

	Promise.all([db.getPage(pageId), db.getPageContent(pageId)])
	.then( results => {
		let page = results[0];
		page.content = results[1];

		res.end(JSON.stringify(page));
	})	
	.catch( err => {
		res.end()	//#todo
	})

}

function updatePage(req, res) {

	let id = res.params.id;

	if (!id) req.end();

	var form = new formidable.IncomingForm();
	form.multiples = true;

	form.parse(req, function(err, fields, files) {

		if(err) {
			console.log(`Error parsing update page form: ${err}`);
		}

		let content = JSON.parse(fields.content);

		Promise.both([
			_updatePageDetails(fields.pageName, files['mainImage'], fields.visible),
			_updatePageContent(content, files)
		])
		.then()
		.catch( err => {
			res.statusCode = 500;	//#TODO
			res.end();
		})

	});
}

function _updatePageDetails(id, name, mainImage, visible) {

	let promises = [];

	if(name || visible) promises.push(db.updatePageDetails(id, name, visible));
	if(mainImage) promises.push(db.getMainImagePath(id).then(path => fileSystem.saveFile(path)));

	if(promises.length > 1) {
		return new Promise((resolve, reject) => {
			Promise.All(promises)
			.then( results => {
				
			})
		}
	} else {
		return promises[0];
	}


	var tasks = [function(callback){

		if(pageName) {

			var pageUrl = pageName.toLowerCase().replace(/ /g, "-").replace(/'/g, "").replace(/"/g, "");
			db.connection.query( 
				"UPDATE page SET name=?, url=? WHERE id=?",
				[pageName, pageUrl, pageId],
				callback
			)
		} else {
			callback();
		}
	}, function(callback) {
		//if the image has changed, overwrite the old image
		if(mainImage) {
			db.connection.query( 
				"select mainImage_url from page where id = ?",
				[pageId],
				function (err, results) {
					if(err) {
						console.log(err)
					} else {
						fileController.saveFile(mainImage, results[0].mainImage_url, callback);
					}
				}
			);
		} else {
			callback();
		}
	}, function(callback) {
		if(visible) {
			visible = (visible.toLowerCase() === 'true');
			console.log(visible);
			db.connection.query( 
				"UPDATE page SET visible=? WHERE id=?",
				[visible, pageId],
				callback
			);
		} else {
			callback();
		}
	}];

	async.parallel(tasks, parent_callback);

}

function _saveMainImage(id) {

}


exports.getPage = getPage;
exports.updatePage = updatePage;
