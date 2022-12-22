const express = require('express')
const router = express.Router()

const userController = require('../controllers/admin');
const middleWare = require('../helper/middleware');

// Retrieve all users
router.post('/all', middleWare.validateUser, userController.findAll);

// Create a new user
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/changePassword',middleWare.validateUser, userController.changePassword);

router.post('/createProject',middleWare.validateUser, userController.createProject);

// Retrieve a single user with iduserController
router.get('/',middleWare.validateUser, userController.findOne);

// Delete a user with id
router.post('/delete',middleWare.validateUser , userController.delete);

module.exports = router