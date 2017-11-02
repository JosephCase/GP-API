'use strict';

var connection = require('./sqlConnection.js').connection;
const config = require("../../config/config.js");

const IMAGE = config.contentTypes.IMAGE ;

exports.getContentByPageId = function(id) {

	return new Promise((resolve, reject) => {

		connection.query(
			`SELECT * FROM content
				WHERE page_id = ?
					ORDER BY position`,
			id,
			function (err, results) {
				if(err) {
					return reject(`SQL error getting page content from database, ${err}`);
				}

				return resolve(results);

			}
		);

	})
}

exports.addContent = function(content) {

	return new Promise((resolve, reject) => {
		connection.query( 
			`INSERT INTO content
				VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
			[content.type, content.data, content.size, content.language, content.position, content.pageId],
			function(err) {
				if(err) return reject(`SQL error adding content, ${err}`)
				return resolve();
			}
		);
	})
}

// #TODO
exports.addFile = function(content) {


	return new Promise((resolve, reject) => {
		connection.query( 
			`INSERT INTO content
				VALUES (NULL, ?, '', ?, ?, ?, ?);
				UPDATE content set content = CONCAT('file_', LAST_INSERT_ID(), ${(content.type === IMAGE) ? "'.jpg'" : "''"}) 
					where id = LAST_INSERT_ID();
				SELECT content from content where id = LAST_INSERT_ID()`,
			[content.type, content.size, content.language, content.position, content.pageId],
			function(err, results) {

				if(err) return reject(`SQL error adding file content, ${err}`);

				let path = results[2][0].content
				return resolve(path);
			}
		);
	});
}

exports.updateContent = function(content) {

	console.log(`Content data: ${content.data}`);

	return new Promise((resolve, reject) => {

		connection.query( 
			`UPDATE content SET 
				content=COALESCE(?,content),
				size=COALESCE(?,size),
				language=COALESCE(?,language),
				position=COALESCE(?,position)
					WHERE id=?;`,
			[content.data, content.size, content.language, content.position, content.id],
			function (err) {
				if(err) {
					return reject(`SQL error updating content, ${err}`)
				}
				return resolve();
			}
		);
	})
}

exports.updateFile = function(content) {
	
	return new Promise((resolve, reject) => {

		connection.query( 
			`UPDATE content SET 
				size=COALESCE(?,size),
				language=COALESCE(?,language),
				position=COALESCE(?,position)
					WHERE id=?;
			SELECT content imagePath FROM content WHERE id = ?`,
			[content.size, content.language, content.position, content.id, content.id],
			function (err, results) {
				if(err) {
					return reject(`SQL error updating file, ${err}`)
				}
				if(!results[1][0].imagePath) return reject(`SQL: Invalid content ID: ${content.id}`);
				let path = results[1][0].imagePath;
				return resolve(path);
			}
		);
	})		
}

exports.deleteContent = function(id) {

	return new Promise((resolve, reject) => {

		connection.query(
			`DELETE FROM content WHERE id=?;`,
			id,
			function(err, results) {
				if(err) return reject(`SQL error deleting content, ${err}`);
				let path = results[0][0].content;
				return resolve(path);
			}
		);
	});
}

exports.deleteFile = function(id) {
	return new Promise((resolve, reject) => {

		connection.query(
			`SELECT content FROM content WHERE id=?;
			DELETE FROM content WHERE id=?;`,
			[id, id],
			function(err, results) {
				if(err) return reject(`SQL error deleting file, ${err}`);
				if(!results[0][0] || !results[0][0].content) return reject(`SQL error, unable to find content, id: ${id}`);
				let path = results[0][0].content;
				return resolve(path);
			}
		);
	});
}