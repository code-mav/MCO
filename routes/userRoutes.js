const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Registration endpoint 
router.post('/register', userController.register);

// Login endpoint 
router.post('/login', userController.login);

// (Optional) CRUD endpoints
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
