const express = require('express')
const router = express.Router()

const userController = require('../controllers/admin');
const middleWare = require('../helper/middleware');

router.post('/createProject',middleWare.validateUser, userController.createProject);
router.post('/addTeam',middleWare.validateUser, userController.addTeam);
router.post('/getUserProjects',middleWare.validateUser, userController.getUserProjects);
router.post('/addTaskUpdate', middleWare.validateUser, userController.addTaskUpdate);
router.post('/projectdetails',middleWare.validateUser, userController.getProject);

module.exports = router