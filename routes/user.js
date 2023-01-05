const express = require('express')
const router = express.Router()

const userController = require('../controllers/user');
const middleWare = require('../helper/middleware');

// Retrieve all users
router.post('/all', middleWare.validateUser, userController.findAll);
// Create a new user
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/changePassword',middleWare.validateUser, userController.changePassword);

router.post('/delete',middleWare.validateUser , userController.delete);

router.post('/checkInAttendance',middleWare.validateUser, userController.checkInAttendance);
router.post('/checkOutAttendance',middleWare.validateUser, userController.checkOutAttendance);
router.post('/attendances',middleWare.validateUser, userController.getAttendances);

// common

router.get('/',middleWare.commanAuth, userController.findOne);
router.post('/requestLeave',middleWare.commanAuth, userController.requestLeave);
router.post('/checkLeave',middleWare.commanAuth, userController.checkLeaveStatus);
router.post('/updateImage', middleWare.commanAuth, userController.updateProfileImage);

module.exports = router