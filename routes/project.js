const express = require('express')
const router = express.Router()
const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix+'-' +file.originalname )
    }
  })
const upload = multer({ storage: storage })


const userController = require('../controllers/admin');
const middleWare = require('../helper/middleware');

router.post('/createProject',upload.array('photos', 12),middleWare.validateUser, userController.createProject);
router.post('/addTeam',middleWare.validateUser, userController.addTeam);
router.post('/getUserProjects',middleWare.validateUser, userController.getUserProjects);
router.post('/addTaskUpdate',upload.array('photos', 12), middleWare.validateUser, userController.addTaskUpdate);
router.post('/project',middleWare.validateUser, userController.getProject);

module.exports = router