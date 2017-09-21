'use strict';
const config = require("../../config.config.js");
const db = require("../database/section.js");

// content types
const TEXT = config.contentTypes.TEXT ;
const IMAGE = config.contentTypes.IMAGE ;
const VIDEO = config.contentTypes.VIDEO ;

// action types
const ADD = config.actionTypes.ADD ;
const EDIT = config.actionTypes.EDIT ;
const DELETE = config.actionTypes.DELETE ;

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
			res.statusCode = 500;	//#TODO
			res.end();
		}

		let content = JSON.parse(fields.content);

		Promise.both([
			_updatePageDetails(id, fields.pageName, files['mainImage'], fields.visible),
			_updatePageContent(id, content, files)
		])
		.then( results => {	
			for (var i = results.length - 1; i >= 0; i--) {
				if !results[i] return false;
				break;
			}
			return 
		})
		.then( results => {	
			res.end() ;
		})
		.catch( err => {
			res.statusCode = 500;	//#TODO
			res.end();
		})

	});
}

function _updatePageDetails(id, name, mainImage, visible) {

	let promises = [];

	if(name || visible) promises.push(db.updatePageDetails(id, name, visible));
	if(mainImage) promises.push(db.getMainImagePath(id).then( path => return fileSystem.saveFile(mainImage, path)));

	return Promise.all(promises);

}

function _updatePageContent(id, content, files) {

	var promises = [];

	for(var propertyName in content) {

		(function(content, file){
			if(content.action === ADD) {
				promises.push(_addContent(content, file))
			} else if(content.action === EDIT) {
				promises.push(_editContent(content, file))
			} else if(content.action === DELETE) {
				promises.push(_deleteContent(content))
			} else {
				console.log('Unrecognised action: ' + content.action);
				return false;
				// return Promise.reject(); ??
			}
		}(content[propertyName], files[propertyName]));

	}

	return Promise.All(promises);
}

function _editContent(content, file) {

	if(file && content.type === IMAGE) {
		return db.editContent(content.id, content, file).then(filePath => {return fileSystem.saveImage(filePath, file)})
	} else if(file && content.type === VIDEO) {
		return db.editContent(content.id, content, file).then(filePath => {return fileSystem.saveVideo(filePath, file)})
	} else {
		return db.editContent(content.id, content);
	}
}

function _deleteContent(content) {

	return db.deleteContent(content.id).then(result => {
		if(content.type === IMAGE) {
			let filePath = result;
			return fileSystem.deleteImage(filePath)
		} else if(content.type === VIDEO) {
			let filePath = result;
			return fileSystem.deleteVideo(filePath)
		}
		return result;
	})
}

function _addContent(content, file) {

	if(content.type === TEXT) {
		return db.addContent(content)
	} else if(file && content.type === IMAGE) {
		return db.addContent(content).then( filePath => {return fileSystem.saveImage(filePath, file)})
	} else if(file && content.type === VIDEO) {
		return db.addContent(content).then( filePath => {return fileSystem.saveVideo(filePath, file)})
	} else {
		return false;
	}
}

exports.getPage = getPage;
exports.updatePage = updatePage;
