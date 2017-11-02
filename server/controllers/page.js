'use strict';
const config = require("../../config/config.js");
const pageData = require("../database/page.js");
const contentData = require("../database/content.js");
const imageHandler = require("../fileSystem/imageHandler.js");
const videoHandler = require("../fileSystem/videoHandler.js");
const formidable = require("formidable");	//do I need formiddable here?#
const encoder = require('htmlEncode');



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

	let embedContent = (req.query.embed === 'content');
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

	let id = req.params.id;

	if (!id) {
		console.log(`No id provided`);
		return res.status(400).json({message: "Bad request, no page ID provided.", error: `Bad request, 
			no page ID provided. ID = ${id}`});
	}

	var form = new formidable.IncomingForm();
	form.multiples = true;

	form.parse(req, function(err, fields, files) {

		if(err) {
			console.log(`Error parsing update page form: ${err}`);
			return res.status(400).json({message: "Bad request, unable to parse update page form.", error: err});
		}

		let contents = undefined;

		if(fields.content) {
			try {
				contents = JSON.parse(fields.content);
			} catch(err) {
				return res.status(400).json({message: "Bad request, unable to parse content JSON.", error: err});
			}
		}

		Promise.all([
			_updatePageDetails(id, fields.pageName, files['mainImage'], fields.visible),
			_updatePageContent(id, contents, files)
		])
		.then( results => {	
			res.json({
				sucess: true,
				message: 'Updated page details success'
			});
		})
		.catch( err => {
			console.log(err);
			return res.status(500).json({message: "Internal server error updating page details", error: err});
		})

	});
}

function _updatePageDetails(id, name, mainImage, visible) {

	let promises = [];

	if(name || visible) promises.push(pageData.updatePage(id, name, visible));
	if(mainImage) promises.push(pageData.getMainImagePath(id).then( path => { return imageHandler.saveImage(mainImage, path) }));

	return Promise.all(promises);

}

function _updatePageContent(pageId, contents = [], files = {}) {

	var promises = [];

	for (var i = 0; i < contents.length; i++) {
		let content = contents[i];

		content.pageId = pageId;
		if ((content.type === IMAGE || content.type === VIDEO) && files[content.id] ) {
			content.file = files[content.id];
		}		

		if(content.action === CREATE) {
			promises.push(_addContent(content))
		} else if(content.action === UPDATE) {
			promises.push(_editContent(content))
		} else if(content.action === DELETE) {
			promises.push(_deleteContent(content))
		} else {
			return Promise.reject(`Unrecognised action: ${content.action}`);
		}	
	}

	return Promise.all(promises);
}

function _addContent(content) {

	if(content.type === TEXT) {
		content.data = encoder.htmlEncode(content.data);	//encode the text
		return contentData.addContent(content)
	} else if(content.type === IMAGE) {
		return contentData.addFile(content).then( filePath => {return imageHandler.saveImage(content.file, filePath)})
	} else if(content.type === VIDEO) {
		return contentData.addFile(content).then( filePath => {return videoHandler.saveVideo(content.file, filePath)})
	} else {
		throw `Invalid content type: ${content.type}`;
	}
}

function _editContent(content) {

	if(content.type === TEXT) {
		content.data = encoder.htmlEncode(content.data);
		return contentData.updateContent(content);
	} else if(content.type === IMAGE) {
		return contentData.updateFile(content).then( filePath => {
			return content.file ? imageHandler.saveImage(content.file, filePath) : Promise.resolve();
		})
	} else if(content.type === VIDEO) {
		return contentData.updateFile(content).then( filePath => {
			return content.file ? videoHandler.saveVideo(content.file, filePath) : Promise.resolve();
		})
	} else {
		throw `Invalid content type: ${content.type}`
	}
}

function _deleteContent(content) {

	if(content.type === TEXT) {
		return contentData.deleteContent(content.id);
	} else if(content.type === IMAGE) {
		return contentData.deleteFile(content.id).then( filePath => {return imageHandler.deleteImage(filePath)})
	} else if(content.type === VIDEO) {
		return contentData.deleteFile(content.id).then( filePath => {return videoHandler.deleteVideo(filePath)})
	} else {
		throw `Invalid content type: ${content.type}`;
	}
}


exports.getPage = getPage;
exports.updatePage = updatePage;
