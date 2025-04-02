const express = require('express');
const homeController = require('../controllers/homeController');
const router = express.Router();

// Home page (index.ejs)
router.get('/', homeController.home_index);

// Login page (login.ejs)
router.get('/login', homeController.login);

// Register page (register.ejs)
router.get('/register', homeController.register_get);

// Login user (login.ejs)
router.post('/login', homeController.login_post);

// Register user (register.ejs)
router.post('/register', homeController.register_post);

// About Page Route
router.get("/about", homeController.about_page);

module.exports = router;
