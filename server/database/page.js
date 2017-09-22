'use strict';

var connection = require('./sqlConnection.js').connection;

function getPage(id) {

	return new Promise((resolve, reject) => {

		connection.query(
			`SELECT name, mainImage_url, id, visible FROM page where id = ${id}`,
			function (err, results) {
				if(err) {
					reject(`SQL error getting page details: ${err}`);
				}

				resolve(results[0]);

			}
		);

	})
}

function updatePage(id, name, visible) {

	return new Promise((resolve, reject) => {

		connection.query( 
			`UPDATE page SET name=COALESCE(${name},name), visible=COALESCE(${visible},visible) WHERE id=${id}`,
			function(err, results) {
				if(err) {
					reject(`SQL error updating page details: ${err}`);
				}
				resolve();
			}
		)
	})

}

function getMainImagePath(id) {

	return new Promise((resolve, reject) => {

		connection.query( 
			`SELECT content FROM content WHERE id = ${id}`,
			function(err, results) {
				if(err) {
					reject(`SQL error getting main image path: ${err}`);
				}
				resolve(results[0]);
			}
		)
	})
}

exports.getPage = getPage;
exports.updatePage = updatePage;
exports.getMainImagePath = getMainImagePath;
