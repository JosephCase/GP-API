'use strict';
const config = require("../../config/config.js");
const pageData = require("../database/page.js");
const contentData = require("../database/content.js");
const imageHandler = require("../fileSystem/imageHandler.js");
const videoHandler = require("../fileSystem/videoHandler.js");

// content types
const TEXT = config.contentTypes.TEXT ;
const IMAGE = config.contentTypes.IMAGE ;
const VIDEO = config.contentTypes.VIDEO ;

// action types
const CREATE = config.actionTypes.CREATE ;
const UPDATE = config.actionTypes.UPDATE ;
const DELETE = config.actionTypes.DELETE ;

function getPage(req, res) {

	var pageId = req.params.id;

	if(!pageId) res.end();

	let embedContent = req.query.embedContent;
	let promises = [];

	promises.push(pageData.getPage(pageId));
	if(embedContent) promises.push(contentData.getContentByPageId(pageId));

	Promise.all(promises)
	.then( results => {
		let page = results[0];
		page.content = results[1];

		res.json(page);
	})	
	.catch( err => {
		console.log(err);
		res.status(500).json({message: "Internal server error retrieving page details.", error: err});
	})

}

function updatePage(req, res) {

	let id = res.params.id;

	if (!id) {
		console.log(`No id provided`);
		res.status(400).json({message: "Bad request, no page ID provided.", error: `Bad request, 
			no page ID provided. ID = ${id}`});
	}

	var form = new formidable.IncomingForm();
	form.multiples = true;

	form.parse(req, function(err, fields, files) {

		if(err) {
			console.log(`Error parsing update page form: ${err}`);
			res.status(500).json({message: "Bad request, unable to parse update page form.", error: err});
		}

		let contents = JSON.parse(fields.content);

		Promise.all([
			_updatePageDetails(id, fields.pageName, files['mainImage'], fields.visible),
			_updatePageContent(contents, files)
		])
		.then( results => {	
			res.end();
		})
		.catch( err => {
			console.log(err);
			res.status(500).json({message: "Internal server error updating page details", error: err});
		})

	});
}

function _updatePageDetails(id, name, mainImage, visible) {

	let promises = [];

	if(name || visible) promises.push(pageData.updatePage(id, name, visible));
	if(mainImage) promises.push(pageData.getMainImagePath(id).then( path => { return imageHandler.saveImage(mainImage, path) }));

	return Promise.all(promises);

}

function _updatePageContent(contents, files) {

	var promises = [];

	for(var propertyName in contents) {

		let content = contents[propertyName];

		if ((content.type === IMAGE || content.type === VIDEO) && files[propertyName] ) {
			content.file = files[propertyName];
		}		

		if(content.action === CREATE) {
			promises.push(_addContent(content))
		} else if(content.action === UPDATE) {
			promises.push(_editContent(content))
		} else if(content.action === DELETE) {
			promises.push(_deleteContent(content))
		} else {
			throw `Unrecognised action: ${content.action}`;
		}

	}

	return Promise.All(promises);
}

function _addContent(content, file) {

	if(content.type === TEXT) {
		content.data = encoder.htmlEncode(content.data);	//encode the text
		return contentData.addContent(content)
	} else if(content.type === IMAGE) {
		return contentData.addFile(content).then( filePath => {return imageHandler.saveImage(filePath, file)})
	} else if(content.type === VIDEO) {
		return contentData.addFile(content).then( filePath => {return videoHandler.saveVideo(filePath, file)})
	} else {
		throw `Invalid content type: ${content.type}`;
	}
}

function _editContent(content) {

	if(content.type === TEXT) {
		content.data = encoder.htmlEncode(content.data);
		return contentData.editContent(content);
	} else if(content.type === IMAGE) {
		return contentData.editFile(content).then(filePath => {return imageHandler.saveImage(filePath, content.file)})
	} else if(content.type === VIDEO) {
		return contentData.editFile(content).then(filePath => {return videoHandler.saveVideo(filePath, content.file)})
	} else {
		throw `Invalid content type: ${content.type}`
	}
}

function _deleteContent(content) {

	if(content.type === TEXT) {
		return contentData.deleteContent(content.id);
	} else if(content.type === IMAGE) {
		return contentData.deleteFile(content.id).then( filePath => {return imageHandler.deleteImage(filePath, file)})
	} else if(content.type === VIDEO) {
		return contentData.deleteFile(content.id).then( filePath => {return videoHandler.deleteVideo(filePath, file)})
	} else {
		throw `Invalid content type: ${content.type}`;
	}
}


exports.getPage = getPage;
exports.updatePage = updatePage;
