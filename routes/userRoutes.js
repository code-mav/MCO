const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Reservation = require('../models/Reservation'); 

// User page
router.get('/', userController.user_index);

// User logout
router.get('/logout', userController.logout);

// API to get unavailable times for a given date and room
router.get('/api/unavailable-times', async (req, res) => {
    const { date, room } = req.query;
    
    try {
        const reservations = await Reservation.find({ date, room }).lean();
        const unavailableTimes = reservations.map(res => res.time);
        res.json(unavailableTimes);
    } catch (error) {
        console.error("Error fetching unavailable times:", error);
        res.status(500).json([]);
    }
});

// View reservations
router.get('/user_view_res', userController.view_reservations);

// Add reservation page
router.get('/user_add_res', userController.add_reservations_page);

// Add reservation
router.post('/user_add_res', userController.add_reservations);

// Edit reservation page
router.get('/user_edit_res/:id', userController.edit_reservation_page);

// Update reservation
router.put('/user_edit_res/:id', userController.update_reservation);

// Delete reservation
router.delete('/delete_reservation/:id', userController.delete_reservation);

// Get user
router.get('/profile/:id', userController.get_user);

// Edit user
router.get('/edit/:id', userController.edit_user);

// Update user
router.put('/edit/:id', userController.update_user);

// Delete user
router.delete('/edit/:id', userController.delete_user);

module.exports = router;