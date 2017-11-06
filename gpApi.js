'use strict';

global.appRoute = __dirname;

const config = require('./config/config.js');
const app = require('./server/router.js');

app.listen(config.port, () => {

	console.log(`Express Server started listening to port ${config.port}`);
	app.timeout = config.reqTimeout;
	
});