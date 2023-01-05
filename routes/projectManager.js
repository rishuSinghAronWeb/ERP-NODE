const express = require('express')
const router = express.Router()

const hrController = require('../controllers/hr');
const middleWare = require('../helper/middleware');

router.post('/getUserProjects',middleWare.validateUser, hrController.getUserProjects);
router.post('/addTaskUpdate', middleWare.validateUser, hrController.addTaskUpdate);
router.post('/projectdetails',middleWare.validateUser, hrController.getProject);

module.exports = router