'use strict';

var connection = require('./sqlConnection.js').connection;

function getPage(id) {

	return new Promise((resolve, reject) => {

		connection.query(
			`SELECT name, mainImage_url, id, visible FROM page where id = ${id}`,
			function (err, results) {
				if(err) {
					console.log(`SQL error getting page details from database: ${err}`);
					reject(err);
				}

				resolve(results[0]);

			}
		);

	})
}

function getPageContent(id) {

	return new Promise((resolve, reject) => {

		connection.query(
			`SELECT content.* FROM page
				inner join content
					on content.page_id = page.id and page.id = ${id}
					ORDER BY position`,
			function (err, results) {
				if(err) {
					console.log(`SQL error getting page content from database: ${err}`);
					reject(err);
				}

				resolve(results);

			}
		);

	})
}


exports.getPage = getPage;
exports.getPageContent = getPageContent;
