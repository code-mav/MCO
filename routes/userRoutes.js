const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User page
router.get('/', userController.user_index);

// User logout
router.get('/logout', userController.logout);

// View reservations
router.get('/user_view_res', userController.view_reservations);

// Add reservation page
router.get('/user_add_res', userController.add_reservations_page);

// Add reservation
router.post('/user_add_res', userController.add_reservations);

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
