exports.authenticateUser = (username) => {
	return new Promise((resolve, reject) => {
		resolve({
			username: 'giusy',
			password: 'nuit123'
		})
	})
}