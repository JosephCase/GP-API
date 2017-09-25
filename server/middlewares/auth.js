'use strict';

const JWT_SECRET = require('../../config/config.js').jwtSecret,
	jwt = require('jsonwebtoken');

exports.authenticateJWT = (req, res, next) => {

	let token = req.get('x-access-token');

	if (!token) return res.status(403).send({
		success: false,
		message: 'No Token provided'
	})

	try {
		var decoded = jwt.verify(token, JWT_SECRET);
	} catch (err) {
		res.status(401).send({
			success: false,
			message: 'Failed to authenticate token'
		});		
	}

	req.decodedJWT = decoded;
	next();
}