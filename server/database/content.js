'use strict';

var connection = require('./sqlConnection.js').connection;

exports.getContentByPageId = function(id) {

	return new Promise((resolve, reject) => {

		connection.query(
			`SELECT * FROM content
				WHERE page.id = ${id}
					ORDER BY position`,
			function (err, results) {
				if(err) {
					return reject(`SQL error getting page content from database: ${err}`);
				}

				return resolve(results);

			}
		);

	})
}

exports.addContent = function(content) {

	return new Promise((resolve, reject) => {
		db.connection.query( 
			`INSERT INTO content
				VALUES (NULL, ${content.type}, ${content.data}, ${content.lang}, 
				${content.}, ${content.position}, ${content.pageId})`
			function(err) {
				if(err) return reject(`SQL error adding content: ${err}`)
				return resolve();
			}
		);
	})
}

// #TODO
exports.addFile = function(content) {
	db.connection.query( 
		`INSERT INTO content
			VALUES (NULL, ${content.type}, '', ${content.lang}, 
			${content.}, ${content.position}, ${content.pageId});
			UPDATE content set content = CONCAT('file_', LAST_INSERT_ID(), ${(content.type == 'img') ? '.jpg' : '')}) 
				where id = LAST_INSERT_ID();
			SELECT content from content where id = LAST_INSERT_ID()`
		function(err, results) {
			if(err) return reject(`SQL error adding file content: ${err}`);
			let path = results[2][0].content
			return resolve(path);
		}
	);
}

exports.updateContent = function(content) {

	return new Promise((resolve, reject) => {

		db.connection.query( 
			`UPDATE content SET 
				content =	COALESCE(${content.data},content),
				size =		COALESCE(${content.size},size),
				language =	COALESCE(${content.lang},language),
				position =	COALESCE(${content.position},position)
					WHERE id = ${content.id}`
			function (err) {
				if(err) {
					return reject(`SQL error updating content: ${err}`)
				}
				return resolve();
			}
		);
	})
}

exports.updateFile = function(content) {
	
	return new Promise((resolve, reject) => {

		db.connection.query( 
			`UPDATE content SET
				size 	 =	COALESCE(${content.size},size),
				language =	COALESCE(${content.lang},language),
				position =	COALESCE(${content.position},position)
					WHERE id = ${content.id};
			SELECT content FROM content WHERE id = ${content.id}`
			function (err, results) {
				if(err) {
					return reject(`SQL error updating file: ${err}`)
				}
				let path = results[1][0]; 
				return resolve(path);
			}
		);
	})		
}

exports.deleteContent = function(id) {

	return new Promise((resolve, reject) => {

		db.connection.query(
			`DELETE FROM content WHERE id=${id};`,
			function(err, results) {
				if(err) return reject(`SQL error deleting content: ${err}`);
				let path = results[0][0].content;
				return resolve(path);
			}
		});
	}
}

exports.deleteFile = function(id) {
	return new Promise((resolve, reject) => {

		db.connection.query(
			`SELECT content FROM content WHERE id=${id};
			DELETE FROM content WHERE id=${id};`,
			function(err, results) {
				if(err) return reject(`SQL error deleting file: ${err}`);
				let path = results[0][0].content;
				return resolve(path);
			}
		});
	}	
}