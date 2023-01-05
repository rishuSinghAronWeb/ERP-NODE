const User = require('../models/user');
const Project = require('../models/project');
const Leave = require('../models/leaves');
const Attendance = require('../models/attendance');
const upload = require('../helper/awsimageupload');
const ImageUpload = upload.single('image');
const Team = require('../models/team');
const { successResponse, errorResponse, jwtToken, successResponseWithCount, validateData } = require('../helper/helper');


exports.findAll = async (req, res) => {
    let data = req.body
    let validity = validateData(['shortBy', 'page', 'size', 'order'], req.body)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let userCount = await User.aggregate([
        { $group: { _id: null, myCount: { $sum: 1 } } }
    ])
    User.aggregate([
        { $skip: ((Number(data.page) - 1) * Number(data.size)) },
        { $sort: { [`${data.shortBy}`]: Number(data.order) } }
    ]).then(users => {
        return (successResponseWithCount(res, "User All Data", users, userCount[0].myCount))
    }).catch(err => {
        console.log("err ====> ", err)
        return (errorResponse(res, err.message || "Something went wrong while getting list of users."))
    });
};
// Create and Save a new User
exports.login = async (req, res) => {
    try {
        let validity = validateData(['password', 'email'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        let verifyEmail = await User.findOne({ email: req.body.email })
        if (!verifyEmail) {
            return (errorResponse(res, "Email Not exist."))
        }
        var hashedPassword = require('crypto').createHash('sha256').update(req.body.password).digest('hex');
        if (hashedPassword != verifyEmail.password) {
            return (errorResponse(res, "Invalid Password."))
        }
        let newTYoken = jwtToken(req.body.email)
        // Save user in the database
        User.findOneAndUpdate({ _id: verifyEmail._id }, { token: newTYoken }, { new: true, upsert: true }, function (err, result) {
            if (err) {
                return (errorResponse(res, err.message || "Something went wrong while creating new user."))
            }
            if (result) {
                return (successResponse(res, "Login Success", result))
            }
        })
    } catch (e) {
        return (errorResponse(res, e || "Something went wrong while creating new user."))
    }
};

// Create and Save a new User
exports.register = async (req, res) => {
    try {
        ImageUpload(req, res, async function (err, resp) {
            if (err) {
                return console.log('errrrr', err)
            }
            console.log("req.file ==> ", req.file)
            let validity = validateData(['name', 'employeId', 'password', 'email', 'phone', 'role'], req.body)
            if (validity && validity.error) {
                return (errorResponse(res, validity.msg))
            }
            let verifyEmail = await User.findOne({ email: req.body.email })
            if (verifyEmail) {
                return (errorResponse(res, "Email Already exist."))
            }
            let employeIdExist = await User.findOne({ employeId: req.body.employeId })
            if (employeIdExist) {
                return (errorResponse(res, "Employe Id Already exist."))
            }
            let image = null;
            if (req.file && req.file.location) image = req.file.location
            var hashedPassword = require('crypto').createHash('sha256').update(req.body.password).digest('hex');
            let newTYoken = jwtToken(req.body.email)
            // Create a new User
            const user = new User({
                employeId: req.body.employeId,
                token: newTYoken,
                name: req.body.name,
                password: hashedPassword,
                team: req.body.team,
                email: req.body.email,
                phone: req.body.phone,
                role: req.body.role,
                is_active: true,
                is_verified: true,
                is_deleted: false
            });
            // Save user in the database
            user.save()
                .then(data => {
                    return (successResponse(res, "User Create Success", data))
                }).catch(err => {
                    return (errorResponse(res, err.message || "Something went wrong while creating new user."))
                });
        })
    } catch (e) {
        return (errorResponse(res, e || "Something went wrong while creating new user."))
    }
};

// Create and Save a new User
exports.updateProfileImage = async (req, res) => {
    try {
        ImageUpload(req, res, async function (err, resp) {
            if (err) {
                return console.log('errrrr', err)
            }
            console.log("req.file ==> ", req.file)
            if (!req.file) {
                return (errorResponse(res, "Image Is require."))
            }
            let image = null;
            if (req.file && req.file.location) image = req.file.location
            User.findOneAndUpdate({ _id: req.decode._id }, { image: image }, { new: true }, function (err, result) {
                if (err) {
                    return (errorResponse(res, err.message || "Something went wrong while updateing profile."))
                }
                if (result) {
                    return (successResponse(res, "Change profile Success", result))
                }
            })
        })
    } catch (e) {
        return (errorResponse(res, e || "Something went wrong while updateing profile."))
    }
};

// Create and Save a new User
exports.changePassword = async (req, res) => {
    try {
        let validity = validateData(['cnfPassword', 'password'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        console.log("req.decode ===> ", req.decode)
        if (!req.body.password) {
            return (errorResponse(res, "Password is required."))
        }
        if (!req.body.cnfPassword) {
            return (errorResponse(res, "Confirm Password is required."))
        }
        let verifyUser = await User.findOne({ _id: req.decode._id })
        if (!verifyUser) {
            return (errorResponse(res, "User Not Found."))
        }
        if (req.body.password != req.body.cnfPassword) {
            return (errorResponse(res, "New Password And Confirm Password is Not Same."))
        }
        var hashedPassword = require('crypto').createHash('sha256').update(req.body.password).digest('hex');
        // Save user in the database
        User.findOneAndUpdate({ _id: verifyUser._id }, { password: hashedPassword }, { new: true, upsert: true }, function (err, result) {
            if (err) {
                return (errorResponse(res, err.message || "Something went wrong while creating new user."))
            }
            if (result) {
                return (successResponse(res, "Change Password Success", result))
            }
        })
    } catch (e) {
        return (errorResponse(res, e || "Something went wrong while creating new user."))
    }
};

// Find a single User with a id
exports.findOne = (req, res) => {
    User.findById(req.decode.id)
        .then(user => {
            if (!user) {
                return (errorResponse(res, `User not found with id ${req.decode.id}`))
            }
            return (successResponse(res, "User Find By Id Success", user))
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return (errorResponse(res, `User not found with id ${req.decode.id}`))
            }
            return (errorResponse(res, err.message || "Something went wrong while creating new user."))
        });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    User.findByIdAndRemove(req.decode.id)
        .then(user => {
            if (!user) {
                return (errorResponse(res, `user not found with id ${req.decode.id}`))
            }
            return (successResponse(res, "User Deleted Successfully", {}))
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return (errorResponse(res, `user not found with id ${req.decode.id}`))
            }
            return (errorResponse(res, `user not found with id ${req.decode.id}`))
        });
};

// Delete a User with the specified id in the request
exports.checkInAttendance = async (req, res) => {
    let data = req.body
    let validity = validateData(['userId'], data)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let userExist = await User.findOne({ _id: req.body.userId })
    if (!userExist) {
        return (errorResponse(res, "User Not exist."))
    }
    let todatyData = new Date()
    const getDate = todatyData.getDate()
    const getMonth = todatyData.getMonth()
    const getFullYear = todatyData.getFullYear()
    const toDay = `${getDate}/${getMonth}/${getFullYear}`
    let findQuerry = {
        user: data.userId,
        date: toDay
    }
    let updateQuerry = {
        cretatedBy: req.decode._id,
        user: data.userId,
        checkInTime: todatyData,
        date: toDay,
        status: true
    }
    Attendance.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            return (successResponse(res, "Check In Success", result))
        }
    })
};

// Delete a User with the specified id in the request
exports.getAttendances = async (req, res) => {
    let data = req.body
    let validity = validateData(['userId'], data)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let userExist = await User.findOne({ _id: req.body.userId })
    if (!userExist) {
        return (errorResponse(res, "User Not exist."))
    }
    let findQuerry = {
        user: data.userId
    }
    Attendance.find(findQuerry, async function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            return (successResponse(res, "Attendances In Success", result))
        }
    })
};

// Delete a User with the specified id in the request
exports.checkOutAttendance = async (req, res) => {
    let data = req.body
    let validity = validateData(['userId'], data)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let userExist = await User.findOne({ _id: req.body.userId })
    if (!userExist) {
        return (errorResponse(res, "User Not exist."))
    }
    let todatyData = new Date()
    const getDate = todatyData.getDate()
    const getMonth = todatyData.getMonth()
    const getFullYear = todatyData.getFullYear()
    const toDay = `${getDate}/${getMonth}/${getFullYear}`
    let findQuerry = {
        user: data.userId,
        date: toDay
    }
    let attachementExist = await Attendance.findOne(findQuerry)
    if (!attachementExist) {
        return (errorResponse(res, "Chack In first."))
    }
    const seconds = Math.floor((new Date(todatyData).getTime() - new Date(attachementExist.checkInTime).getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = minutes / 60;
    let minutesOnly = 0
    let hourlyOnly = 0
    if (minutes > 0) {
        let alldata = hours.toString().split(".")
        hourlyOnly = alldata[0]
        minutesOnly = Math.floor(alldata[1] * 60)
    }
    let updateQuerry = {
        cretatedBy: req.decode._id,
        user: data.userId,
        checkOutTime: todatyData,
        date: toDay,
        totalHr: hourlyOnly,
        totalMin: minutesOnly.toString().slice(0, 2),
        status: data.status || true
    }
    if (req.body.extraLeave) {
        updateQuerry.extraLeave = req.body.extraLeave
    }
    Attendance.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            return (successResponse(res, "Check In Success", result))
        }
    })
};

// Create and Save a new User
exports.requestLeave = async (req, res) => {
    try {
        let validity = validateData(['leaveType', 'fromDate', 'toDate', 'numberOfDays', 'reason'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        // let verifyEmail = await User.findOne({ email: req.body.email })
        // if (verifyEmail) {
        //     return (errorResponse(res, "Email Already exist."))
        // }
        // Create a new User
        const leave = new Leave({
            employeName: req.decode.name,
            employeId: req.decode.employeId,
            leaveType: req.body.leaveType,
            fromDate: req.body.fromDate,
            toDate: req.body.toDate,
            numberOfDays: Number(req.body.numberOfDays || 1),
            reason: req.body.reason,
            userId: req.decode._id,
            status: 'Pending'
        });
        // Save user in the database
        leave.save()
            .then(data => {
                return (successResponse(res, "Leave Create Success", data))
            }).catch(err => {
                return (errorResponse(res, err.message || "Something went wrong while creating new Leave."))
            });
    } catch (e) {
        return (errorResponse(res, e || "Something went wrong while creating new user."))
    }
};

// Create and Save a new User
exports.checkLeaveStatus = async (req, res) => {
    try {
        let data = req.body
        let validity = validateData(['shortBy', 'page', 'size', 'order'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        let userCount = await Leave.aggregate([
            { $group: { _id: null, myCount: { $sum: 1 } } }
        ])
        Leave.aggregate([
            { $skip: ((Number(data.page) - 1) * Number(data.size)) },
            { $sort: { [`${data.shortBy}`]: Number(data.order) } }
        ]).then(users => {
            return (successResponseWithCount(res, "Leave All Data", users, userCount[0].myCount))
        }).catch(err => {
            console.log("err ====> ", err)
            return (errorResponse(res, err.message || "Something went wrong while getting list of Leave."))
        });
    } catch (e) {
        return (errorResponse(res, e || "Something went wrong while getting list of Leave."))
    }
};

