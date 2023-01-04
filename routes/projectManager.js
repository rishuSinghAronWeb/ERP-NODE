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


const hrController = require('../controllers/hr');
const middleWare = require('../helper/middleware');

router.post('/getUserProjects',middleWare.validateUser, hrController.getUserProjects);
router.post('/addTaskUpdate',upload.array('photos', 12), middleWare.validateUser, hrController.addTaskUpdate);
router.post('/projectdetails',middleWare.validateUser, hrController.getProject);

module.exports = router