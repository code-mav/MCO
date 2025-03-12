const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin page
router.get('/', adminController.admin_index);

// Admin logout
router.get('/logout', adminController.logout);

// View all reservations
router.get('/admin_view_res', adminController.view_all_reservations);

// Add reservation page
router.get('/admin_add_res', adminController.add_reservations_page);

// Add reservation
router.post('/admin_add_res', adminController.add_reservations);

// Edit reservation page
router.get('/admin_edit_res/:id', adminController.edit_reservation_page);

// Update reservation
router.put('/admin_edit_res/:id', adminController.update_reservation);

// Delete reservation
router.delete('/delete_reservation/:id', adminController.delete_reservation);

// Get admin profile
router.get('/admin_profile/:id', adminController.get_admin);

// Edit admin profile
router.get('/edit_admin/:id', adminController.edit_admin);

// Update admin profile
router.put('/edit_admin/:id', adminController.update_admin);

// Edit other admin profile
router.get('/edit_other_admin/:id', adminController.edit_other_admin);

// Update other admin profile
router.put('/edit_other_admin/:id', adminController.update_other_admin);

// Delete admin
router.delete('/delete_admin/:id', adminController.delete_admin);

// Get all users
router.get('/admin_manage_acc', adminController.get_all_users);

// Add user page
router.get('/add_user', adminController.add_user_page);

// Add a new user
router.put('/add_user', adminController.add_user);

// Edit user page
router.get('/edit_user/:id', adminController.edit_user_page);

// Update user
router.put('/edit_user/:id', adminController.update_user);

// Delete user
router.delete('/delete_user/:id', adminController.delete_user);

module.exports = router;