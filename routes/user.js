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

// Retrieve all users
router.post('/all', middleWare.validateUser, userController.findAll);

// Create a new user
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/changePassword',middleWare.validateUser, userController.changePassword);

router.post('/checkInAttendance',middleWare.validateUser, userController.checkInAttendance);
router.post('/checkOutAttendance',middleWare.validateUser, userController.checkOutAttendance);
router.post('/attendances',middleWare.validateUser, userController.getAttendances);

router.post('/createTeam',middleWare.validateUser, userController.createTeam);
router.get('/teams',middleWare.validateUser, userController.getAllTeams);
router.post('/updateTeam',middleWare.validateUser, userController.updateTeam);
router.post('/deleteTeam',middleWare.validateUser, userController.deleteTeam);

// Retrieve a single user with iduserController
router.get('/',middleWare.validateUser, userController.findOne);

// Delete a user with id
router.post('/delete',middleWare.validateUser , userController.delete);

module.exports = router