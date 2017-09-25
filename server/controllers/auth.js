'use strict';

const JWT_SECRET = require('../../config/config.js').jwtSecret,
	authData = require('../database/auth.js'),
	jwt = require('jsonwebtoken');

exports.authenticateWithPassword = (res, req) => {

	let username = req.username;
	let password = req.password;

	authData.authenticateUser(username)
	.then((user) => {
		if(!user) {
			return res.status(401).send({
				success: false,
				message: 'Invalid user'
			});		
		}
		if(username.password != password) {
			return res.status(401).send({
				success: false,
				message: 'Invalid password'
			});			
		}

		let token = jwt.sign(user, JWT_SECRET, {expiresIn: '1d'});

		res.json({
			success: true,
			token: token
		})
	});
}