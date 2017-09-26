'use strict';

const user = require('../../config/config.js').user;

exports.authenticateUser = (username) => {
	return new Promise((resolve, reject) => {
		resolve({
			username: user.username,
			password: user.password
		})
	})
}