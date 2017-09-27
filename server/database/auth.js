'use strict';

const user = require('../../config/config.js').user;

exports.getUser = (username) => {
	return new Promise((resolve, reject) => {

		connection.query( 
			`SELECT username, password FROM user
				WHERE username = ${username}`,
			function(err, results) {
				if(err) {
					return reject(`SQL error getting user, ${err}`);
				}
				return resolve(results[0]);
			}
		)
	})
}