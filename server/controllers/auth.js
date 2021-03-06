'use strict';

const JWT_SECRET = require('../../config/config.js').jwtSecret,
	authData = require('../database/auth.js'),
	jwt = require('jsonwebtoken');

exports.authenticateWithPassword = (req, res) => {

	let username = req.body.username;
	let password = req.body.password;

	authData.getUser(username)
	.then((user) => {
		if(!user) {
			return res.status(401).send({
				success: false,
				message: 'Invalid user'
			});		
		}
		if(user.password != password) {
			return res.status(401).send({
				success: false,
				message: 'Invalid password'
			});			
		}

		let token = jwt.sign({user: user.username}, JWT_SECRET, {expiresIn: '10d'});

		res.json({
			success: true,
			token: token
		})
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			message: "Internal server error retrieving users from the database.",
			error: err
		})
	})
}