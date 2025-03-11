const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ✅ Registration route
router.post('/register', userController.register);

// ✅ Fix login route (ensure it matches the form submission)
router.post('/login', userController.login);

// ✅ Get user by ID
router.get('/profile/:id', userController.getUser);

// ✅ Update user by ID
router.put('/update/:id', userController.updateUser);

// ✅ Delete user by ID
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;
