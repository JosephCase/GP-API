'use strict';

const config = require('../../config/config.js'),
 	fs = require("fs"),
	im = require('imagemagick');
	
const contentDirectory = global.appRoute + '/' + config.contentDirectory;
const imageSizes = config.imageSizes;

function saveImage(image, path) {

	if(!path || (typeof path) !== 'string') throw `Invalid file, path not equal to string`;

	// save at multiple sizes
	let promises = [];

	for (var i = imageSizes.length - 1; i >= 0; i--) {

		let width = imageSizes[i];
		let sizePath = contentDirectory + path.replace('.jpg', '_x' + width + '.jpg');

		promises.push(_resizeAndSaveImage(image.path, sizePath, width));

	}
	
	return Promise.all(promises);

}

function _resizeAndSaveImage(tempPath, targetPath, targetWidth) {

	return new Promise((resolve, reject) => {		

		im.identify(tempPath, function(err, features){
			if (err) return reject(`File system - Problem identifying image error: ${err}`);
			
			let width = (targetWidth < features.width) ? targetWidth : features.width;	//do not make the image larger

			im.resize({
				srcPath: tempPath,
				dstPath: targetPath,
				width:   width,
				filter: 'Lanczos'
			}, function(err, stdout, stderr){
				if (err) {
					return reject(`File system - Error resizing image size: ${width}, error: ${err}, stdout: ${stdout}, stderr: ${stderr}`)
				}
				return resolve();				
			});

		});	
	})
}

function deleteImage(path) {

	console.log(path);

	let promises = [];

	for (var i = imageSizes.length - 1; i >= 0; i--) {
		
		let width = imageSizes[i];
		let sizePath = contentDirectory + path.replace('.jpg', '_x' + width + '.jpg');

		promises.push(function(callback){
			
			return new Promise((resolve, reject) => {	

				fs.unlink(sizePath, function(err) {
					if(err) return reject(`Error deleting image - path: ${sizePath}, err: ${err}`);
					return resolve();
				});
			})
		})
	
	}

	return promises;
}

exports.saveImage = saveImage;
exports.deleteImage = deleteImage;