'use strict';

const config = require('../../config/config.js'),
	fs = require("fs"),
	im = require('imagemagick');

const contentDirectory = global.appRoute + '/' + config.contentDirectory;
const { imageSizes } = config;

const saveImage = async (image, path) => {

	const { path: srcImagePath } = image;
	
	try {

		if (!path || (typeof path) !== 'string') throw `Invalid file, path not equal to string`;

		const srcImageWidth = await getSrcImageWidth(srcImagePath);

		for (const width of imageSizes) {
			const targetPath = contentDirectory + path.replace('.jpg', '_x' + width + '.jpg');
			const targetWidth = (width < srcImageWidth) ? width : srcImageWidth;
			await resizeAndSaveImage(srcImagePath, targetPath, targetWidth)
		}

	} catch (err) {
		console.log(err);
	}
	// cleanup the srcImage
	await unlinkAsync(srcImagePath);
}

const getSrcImageWidth = srcImagePath => new Promise((resolve, reject) => {
	im.identify(srcImagePath, (err, imageFeatures) => {
		if (err) {
			return reject(`File system - Error identifying image,`, err);
		}
		return resolve(imageFeatures.width);
	})
})

const resizeAndSaveImage = (srcPath, dstPath, width) => new Promise((resolve, reject) => {

	im.resize({
		srcPath,
		dstPath,
		width,
		quality: 0.9,
		filter: 'Lanczos'
	}, function (err, stdout, stderr) {
		if (err) {
			return reject(`File system - Error resizing image size:`, width, `error:`, err, `stdout:`, stdout, `stderr:`, stderr)
		}
		return resolve();
	});

})

const unlinkAsync = path => new Promise(resolve => {
	fs.unlink(path, err => {
		if (err) {
			console.log(`Error deleting image - path: ${path}, err:`, err);
		}
		return resolve();
	});
})


function deleteImage(path) {

	let promises = [];

	for (var i = imageSizes.length - 1; i >= 0; i--) {

		let width = imageSizes[i];
		let sizePath = contentDirectory + path.replace('.jpg', '_x' + width + '.jpg');

		promises.push(unlinkAsync(sizePath))
	}

	return Promise.all(promises);
}

exports.saveImage = saveImage;
exports.deleteImage = deleteImage;