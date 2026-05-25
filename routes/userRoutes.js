const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.addUser); // Register
router.post('/login', userController.loginUser); // Login
router.put('/:id', userController.updateUser); // Update Profile

module.exports = router;
