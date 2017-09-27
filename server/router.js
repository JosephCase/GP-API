'use strict';

const config = require('../config/config.js');

const express = require('express');
const bodyParser = require('body-parser');

const authController = require("./controllers/auth");
const navigationController = require("./controllers/navigation");
const sectionController = require("./controllers/section");
const pageController = require("./controllers/page");

const authMiddleware = require("./middlewares/auth.js");

const router = require('express')();

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
router.get("/navigation", (req, res) => { navigationController.getNavLinks(req, res) });
router.get("/sections/:id", (req, res) => { sectionController.getSection(req, res) });
router.get("/pages/:id", (req, res) => { pageController.getPage(req, res) });

router.use(bodyParser.json());

router.post("/auth", (req, res) => {authController.authenticateWithPassword(req, res)});

// protected routes
router.use(authMiddleware.authenticateJWT);

router.get("/testAuth/:id", (req, res) => { sectionController.getSection(req, res) });

router.post("/sections/:id/pages", (req, res) => { sectionController.addPage(req, res) });
router.put("/sections/:id/pages", (req, res) => { sectionController.reOrderPages(req, res) });
router.patch("/pages/:id", (req, res) => { page.updatePage(req, res) });

module.exports = router;

