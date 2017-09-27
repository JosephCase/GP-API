'use strict';

const connection = require("./sqlConnection").connection;

// get the page content and send it to the client
function getNavLinks() {

	return new Promise ((resolve, reject) => {
		connection.query(
			`SELECT 
				page.id, 
				page.name, 
				page.isParent, 
				page.visible, 
				page.position
				FROM navigation
					LEFT JOIN page
				    	on page.id = navigation.page_id  
				        	order by position, id`,
			function (err, results) {
				if(err) {
					reject(`SQL Error getting sections, ${err}`);
				}
				resolve(results);
			}
		);
	});

}

exports.getNavLinks = getNavLinks;