'use strict';

var connection = require('./sqlConnection.js').connection;

function getSection(id) {

	return new Promise((resolve, reject) => {		
		connection.query(
			`select
				page.id,
				page.name
				FROM page
					where id=?`,
			id, 
			function (err, results) {
				if(err) {
					return reject(`SQL Error re-ordering sections, ${err}`);
				}
				return resolve(results[0]);
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
					where parentPage_id=?`,
			id,
			function (err, results) {
				if(err) {
					return reject(`SQL Error re-ordering sections, ${err}`);
				}
				return resolve(results);
			}
		);
	});
}

function addPage(sectionId, pageName) {
	return new Promise((resolve, reject) => {
		connection.query(
			`INSERT INTO page (name, parentPage_id, visible, position) VALUES(?,?,0,0);
			UPDATE page set mainImage_url = CONCAT('mainImage_', LAST_INSERT_ID(), '.jpg') where id = LAST_INSERT_ID();
			UPDATE page set position = position + 1 WHERE parentPage_id = ? AND id != LAST_INSERT_ID();
			select id, name, visible, mainImage_url	FROM page WHERE id = LAST_INSERT_ID();`,
			[pageName,sectionId,sectionId],
			function(err, results) {
				if(err) {			
					return reject(`SQL Error adding page, ${err}`);	//response report error	T#D
				}
				return resolve(results[3][0]);
			}
		)
	});
}

function reOrderPages(pages) {

	let query = '';
	let params = [];

	pages.forEach( page => {
		query += 'UPDATE page SET position=? WHERE id=?;'
		params.push(page.position, page.id)
	});

	return new Promise((resolve, reject) => {		
		connection.query(
			query, params,
			function (err, results) {
				if(err) {
					return reject(`SQL Error re-ordering sections, ${err}`);
				}
				return resolve();
			}
		);
	})

}

exports.getSection = getSection;
exports.getSectionPages = getSectionPages;
exports.addPage = addPage;
exports.reOrderPages = reOrderPages;
