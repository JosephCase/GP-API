'use strict';

const config = require('./config/config.js');

const navigationController = require("./controllers/navigation");
const sectionController = require("./controllers/section");
const pageController = require("./controllers/page");


const router = require('express')();

//static files
router.use('/content', express.static(__dirname + '/content'));

// non-protected routes
router.get("/navigation", (req, res) => { navigationController.getNavLinks(req, res) });
router.get("/section/:id", (req, res) => { sectionController.getSection(req, res) });
router.get("/pages/:id", (req, res) => { page.getPage(req, res) });

// protected routes
router.post("/sections/:id/pages", (req, res) => { sectionController.addPage(req, res) });
router.put("/sections/:id/pages", (req, res) => { sectionController.reOrderPages(req, res) });
router.put("/pages/:id", (req, res) => { page.updatePage(req, res) });

export default router;

