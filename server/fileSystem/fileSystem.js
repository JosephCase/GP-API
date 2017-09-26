'use strict';

const config = require('../../config/config.js'),
 	fs = require("fs"),
	im = require('imagemagick'),
	ffmpeg = require('fluent-ffmpeg');
	
const contentDirectory = __dirname + '/' + config.contentDirectory;
const imageSizes = config.imageSizes;
const videoFormats = config.videoFormats;

var convertList = {}; //list of videos being converted atm

function saveImage(image, path) {

	console.log(image);

	if((typeof image) !== 'string') throw `Invalid file, path not equal to string`;

	// save at multiple sizes
	let promises = [];

	for (var i = imageSizes.length - 1; i >= 0; i--) {

		let width = imageSizes[i];
		let sizePath = contentDirectory + path.replace('.jpg', '_x' + width + '.jpg');

		promises.push(_resizeAndSaveImage(image, sizePath, width));

	}
	
	return Promise.all(promises)

}

function _resizeAndSaveImage(image, path, targetWidth) {

	return new Promise((resolve, reject) => {		

		im.identify(image, function(err, features){
			if (err) return reject(`File system - Problem identifying image error: ${err}`);
			
			let width = (targetWidth < features.width) ? targetWidth : features.width;	//do not make the image larger

			im.resize({
				srcPath: image,
				dstPath: path,
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

function saveVideo(video, path) {

	//we keep a record of the videos converting, as we will not wait for them to finish before sending a response
	processingVideos[path] = ffmpeg(path);

	return new Promise((resolve, reject) => {

		//Video conversion event listeners
		processingVideos[path]
		.on('start', function() {
			return resolve();
		})
		.on('error', function(err, stout, stderr) {
		    if(err != 'Error: ffmpeg was killed with signal SIGKILL') {	//this is when we're stopping the convesion intetionally
				return reject(`There was a problem saving the video: ${err}`)
		    }
			if (processingVideos[path]) delete processingVideos[path];
		})
		.on('end', function() {
			console.log('VIDEO SAVED: ' + path);
			delete processingVideos[path];
		});

		// create the outputs
		for (var i = 0; i < videoFormats.length; i++) {
			processingVideos[path].output(path + '.' + videoFormats[i].ext)
				.videoCodec(videoFormats[i].codec)	
				.videoBitrate(1500)
				.fps(25)
				.size('?x720')
				.format(videoFormats[i].ext);		
		}

		// run the conversion
		processingVideos[path].run();

	})
}


function deleteVideo(path) {

	var promises = [];

	for (var i = videoFormats.length - 1; i >= 0; i--) {

		let formatPath = path + '.' + videoFormats[i].ext;

		promises.push(function(){
			return new Promise((resolve, reject) => {

				fs.unlink(formatPath, function(err) {
					if(err) {
						return reject(`Could't delete video: ${err}`);
					}
					return resolve();
				});				
			})
		})
	}

	//if the video is still being converted we need to stop it
	if(convertList[path]) {
		convertList[path].on('error', function() {
			delete convertList[path];
			return Promise.all(promises);
		});
		convertList[path].kill();
	} else {
		return Promise.all(promises);		
	}
}


exports.saveImage = saveImage;
exports.saveVideo = saveVideo;
exports.deleteImage = deleteImage;
exports.deleteVideo = deleteVideo;