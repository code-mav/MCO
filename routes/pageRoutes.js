const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Reservation = require('../models/Reservation'); // Ensure this model exists

// Home page (index.ejs)
router.get('/', async (req, res) => {
  try {
    const user = req.session.userId ? await User.findById(req.session.userId).lean() : null;
    res.render('index', { user });
  } catch (error) {
    console.error(error);
    res.render('index', { user: null });
  }
});

// Login page (login.ejs)
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/user');
  res.render('login', { user: null });
});

// Register page (register.ejs)
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/user');
  res.render('register', { user: null });
});

// User Dashboard (user.ejs)
router.get('/user', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const user = await User.findById(req.session.userId).lean();
    res.render('user', { user });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
});

// User Profile (Check Profile)
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

// User Profile (Edit Account)
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

// User Add Reservation Page (GET)
router.get('/user_add_res', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const user = await User.findById(req.session.userId).lean();
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0]; // Default to today
    res.render('user_add_res', { user, selectedDate });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
});

// ✅ Add a Reservation (POST)
router.post('/user_add_res', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const { location, room, date, time } = req.body;

  try {
    const user = await User.findById(req.session.userId);
    const userName = `${user.firstName} ${user.lastName}`;

    // Check if the room is already reserved at the same date & time
    const existingRes = await Reservation.findOne({ location, room, date, time });
    if (existingRes) {
      return res.status(400).send('❌ This room is already reserved at the selected time.');
    }

    // Create and save the new reservation
    const newReservation = new Reservation({
      userId: req.session.userId,
      userName,
      location,
      room,
      date,
      time,
    });

    await newReservation.save();
    console.log("✅ Reservation saved:", newReservation);

    res.redirect('/user_view_res'); // Redirect after successful booking
  } catch (error) {
    console.error("❌ Error adding reservation:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
});


/// View Reservations (GET) 
router.get('/user_view_res', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  try {
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0]; // Default to today
    const reservations = await Reservation.find({ userId: req.session.userId, date: selectedDate }).lean();
    const user = await User.findById(req.session.userId).lean();
    
    res.render('user_view_res', { user, reservations, selectedDate });
  } catch (error) {
    console.error("❌ Error fetching reservations:", error);
    res.render('user_view_res', { user: req.session.user, reservations: [], selectedDate: new Date().toISOString().split('T')[0] });
  }
});


// Delete Reservation (POST)
router.post('/delete_reservation/:id', async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/user_view_res');
  } catch (error) {
    console.error("❌ Error deleting reservation:", error);
    res.redirect('/user_view_res');
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

module.exports = router;
