const express = require('express')
const router = express.Router()

const userController = require('../controllers/admin');
const middleWare = require('../helper/middleware');

// Retrieve all users
router.post('/all', middleWare.validateAdmin, userController.findAll);

// Create a new user
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/changePassword',middleWare.validateAdmin, userController.changePassword);
router.get('/',middleWare.validateAdmin, userController.findOne);
router.post('/delete',middleWare.validateAdmin , userController.delete);

router.post('/createProject',middleWare.validateAdmin, userController.createProject);

router.post('/createTeam',middleWare.validateAdmin, userController.createTeam);
router.get('/teams',middleWare.validateAdmin, userController.getAllTeams);
router.post('/updateTeam',middleWare.validateAdmin, userController.updateTeam);
router.post('/deleteTeam',middleWare.validateAdmin, userController.deleteTeam);


module.exports = router