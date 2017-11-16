'use strict';

var connection = require('./sqlConnection.js').connection;

function getPage(id) {

	return new Promise((resolve, reject) => {

		connection.query(
			`SELECT name, mainImage_url, id, visible, parentPage_id FROM page where id = ?`,
			id,
			function (err, results) {
				if(err) {
					reject(`SQL error getting page details, ${err}`);
				}

				resolve(results[0]);

			}
		);

	})
}

function updatePage(id, name, visible) {

	let setStatement = {};
	if(name) setStatement.name = name;
	if(visible) setStatement.visible = (visible.toLowerCase() === 'true');

	return new Promise((resolve, reject) => {

		connection.query( 
			`UPDATE page SET ? WHERE id=?`,
			[setStatement, id],
			function(err, results) {
				if(err) {
					reject(`SQL error updating page details, ${err}`);
				}
				resolve();
			}
		)
	})

}

function getMainImagePath(id) {

	return new Promise((resolve, reject) => {

		connection.query( 
			`SELECT mainImage_url FROM page WHERE id = ?`,
			id,
			function(err, results) {
				if(err) {
					return reject(`SQL error getting main image path, ${err}`);
				}
				if(!results[0]) return reject('SQL: Invalid page ID');
				resolve(results[0].mainImage_url);
			}
		)
	})
}

exports.getPage = getPage;
exports.updatePage = updatePage;
exports.getMainImagePath = getMainImagePath;
