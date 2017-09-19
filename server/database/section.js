'use strict';

var connection = require('./sqlConnection.js').connection;

function reOrderPages(pages) {

	var query = '';

	for(var pageName in pages) {
		query += `UPDATE page SET position=${pages[pageName].position} 
					WHERE id=${pages[pageName].id};`
	}

	return new Promise((resolve, reject) => {		
		connection.query(
			query, function (err, results) {
				if(err) {
					console.log(`SQL Error re-ordering sections: ${err}`);
					reject(`${err}`);	//response report error	T#D
				} else {
					resolve();
				}
			}
		);
	})

}

exports.reOrderPages = reOrderPages;
