'use strict';

var connection = require('./sqlConnection.js').connection;

function getSection(id) {

	return new Promise((resolve, reject) => {		
		connection.query(
			`select
				page.id,
				page.name
				FROM page
					where id=${id}`, 
			function (err, results) {
				if(err) {
					console.log(`SQL Error re-ordering sections: ${err}`);
					reject(err);	//response report error	T#D
				}
				resolve(results[0]);
			}
		);
	});
}

function getSectionPages(id) {

	return new Promise((resolve, reject) => {		
		connection.query(
			`select
				page.id,
				page.name,
				page.visible,
				page.position,
				page.mainImage_url
				FROM page
					where parentPage_id=${id}`, 
			function (err, results) {
				if(err) {
					console.log(`SQL Error re-ordering sections: ${err}`);
					reject(err);	//response report error	T#D
				}
				resolve(results);
			}
		);
	});
}

//# TODO add update of mainImage url after insert

function addPage(sectionId, pageName) {
	return new Promise((resolve, reject) => {
		connection.query(
			`INSERT INTO page (name, parentPage_id, visible) VALUES(${pageName},${sectionId},0);
			select id, name, visible, mainImage_url	FROM page WHERE id = LAST_INSERT_ID();`,
			function(err, results) {
				if(err) {					
					console.log(`SQL Error adding page: ${err}`);
					return reject(err);	//response report error	T#D
				}
				return resolve(results[1][0]);
			}
		)
	});
}

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
				}
				resolve();
			}
		);
	})

}

exports.getSection = getSection;
exports.getSectionPages = getSectionPages;
exports.addPage = addPage;
exports.reOrderPages = reOrderPages;
