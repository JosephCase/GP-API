'use strict';

const config = require('../config/config.js');

const express = require('express');
const bodyParser = require('body-parser');

const authController = require("./controllers/auth");
const navigationController = require("./controllers/navigation");
const sectionController = require("./controllers/section");
const pageController = require("./controllers/page");

const authMiddleware = require("./middlewares/auth.js");

const router = express();

//static files
router.use(function(req, res, next) {
    console.log("Request: "  + req.url);
    next();
});
router.use('/content', express.static(global.appRoute + '/content'));

router.get('/favicon.ico', function(req, res) {
    res.status(204);
});

// non-protected routes
router.get("/navigation", navigationController.getNavLinks);
router.get("/pages", pageController.getAllPages);
router.get("/sections/:id", sectionController.getSection);
router.get("/sections/:id/pages", sectionController.getSectionPages);
router.get("/pages/:id", pageController.getPage);

router.use(bodyParser.json());

router.post("/auth", authController.authenticateWithPassword);

// protected routes
router.use(authMiddleware.authenticateJWT);

router.get("/testAuth/:id", sectionController.getSection);

router.post("/sections/:id/pages", sectionController.addPage);
router.patch("/sections/:id/pages", sectionController.reOrderPages);
router.patch("/pages/:id", pageController.updatePage);

// catch 404
router.use(function (err, req, res, next) {
	console.log(`Error handler middleware: ${err}`);
})

module.exports = router;

