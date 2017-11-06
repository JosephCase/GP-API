'use strict';

const config = require('../../config/config.js'),
 	fs = require("fs"),
	ffmpeg = require('fluent-ffmpeg');
	
const contentDirectory = global.appRoute + '/' + config.contentDirectory;
const videoFormats = config.videoFormats;


var processingVideos = {}; //list of videos being converted atm

function saveVideo(video, path) {

	//we keep a record of the videos converting, as we will not wait for them to finish before sending a response
	processingVideos[path] = ffmpeg(video.path);

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
			processingVideos[path].output(contentDirectory + path + '.' + videoFormats[i].ext)
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

		let formatPath = contentDirectory + path + '.' + videoFormats[i].ext;

		promises.push(new Promise((resolve, reject) => {

				fs.unlink(formatPath, function(err) {
					if(err) {
						return reject(`Could't delete video: ${err}`);
					}
					return resolve();
				});				
			})
		)
	}

	//if the video is still being converted we need to stop it
	if(processingVideos[path]) {
		processingVideos[path].on('error', function() {
			delete processingVideos[path];
			return Promise.all(promises);
		});
		processingVideos[path].kill();
	} else {
		return Promise.all(promises);		
	}
}

exports.saveVideo = saveVideo;
exports.deleteVideo = deleteVideo;