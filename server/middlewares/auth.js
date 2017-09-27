'use strict';

const JWT_SECRET = require('../../config/config.js').jwtSecret,
	jwt = require('jsonwebtoken'),
	authData = require('../database/auth.js');

exports.authenticateJWT = (req, res, next) => {

	let token = req.get('x-access-token');

	if (!token) return res.status(403).json({
		success: false,
		message: 'No Token provided'
	})

	try {
		var decoded = jwt.verify(token, JWT_SECRET);
	} catch (err) {
		res.status(401).json({
			success: false,
			message: 'Failed to authenticate token'
		});		
	}

	authData.getUser(decoded.username)
	.then((user) => {
		if(!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid token'
			})
			return next();
		}
	}
	.catch(err => {
		console.log(err);
		res.status(500).json({
			message: "Internal server error retrieving users from the database.",
			error: err
		})
	})

}