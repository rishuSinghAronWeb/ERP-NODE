const express = require('express')
const router = express.Router()

const hrController = require('../controllers/hr');
const middleWare = require('../helper/middleware');

router.post('/register', hrController.register);
router.post('/login', hrController.login);
router.post('/getUserProjects',middleWare.validateHr, hrController.getUserProjects);
router.post('/addTaskUpdate', middleWare.validateUser, hrController.addTaskUpdate);
router.post('/projectdetails',middleWare.validateHr, hrController.getProject);

router.post('/approveLeaved',middleWare.validateHr, hrController.approveLeaved);


module.exports = router