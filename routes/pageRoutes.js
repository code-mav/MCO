const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Home page (index.ejs)
router.get('/', (req, res) => {
  if (req.session.userId) {
    // If user is logged in, load user from DB
    User.findById(req.session.userId).then((user) => {
      res.render('index', { user });
    }).catch((err) => {
      console.error(err);
      res.render('index', { user: null });
    });
  } else {
    res.render('index', { user: null });
  }
});

// Login page (login.ejs)
router.get('/login', (req, res) => {
  // If already logged in, redirect to /user
  if (req.session.userId) return res.redirect('/user');
  res.render('login', { user: null });
});

// Register page (register.ejs)
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/user');
  res.render('register', { user: null });
});

// User main page (user.ejs)
router.get('/user', async (req, res) => {
  // If not logged in, redirect to login
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const user = await User.findById(req.session.userId).lean();
    res.render('user', { user });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
});

// User check profile page
router.get('/user_check_profile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  try {
    const user = await User.findById(req.session.userId).lean();
    res.render('user_check_profile', { user });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
});

// User edit account page
router.get('/user_edit_acc', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  try {
    const user = await User.findById(req.session.userId).lean();
    res.render('user_edit_acc', { user });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

module.exports = router;
