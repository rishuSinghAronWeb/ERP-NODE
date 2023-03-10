const User = require('../models/user');
const Project = require('../models/project');
const ProjectUpdate = require('../models/projectUpdate');
const Attendance = require('../models/attendance');
const Team = require('../models/team');
const upload = require('../helper/awsimageupload');
const ImageUpload = upload.any();
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
        let validity = validateData(['name', 'password', 'email', 'phone', 'role'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        let verifyEmail = await User.findOne({ email: req.body.email })
        if (verifyEmail) {
            return (errorResponse(res, "Email Already exist."))
        }
        var hashedPassword = require('crypto').createHash('sha256').update(req.body.password).digest('hex');
        let newTYoken = jwtToken(req.body.email)
        // Create a new User
        const user = new User({
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
    } catch (e) {
        return (errorResponse(res, e || "Something went wrong while creating new user."))
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
exports.createProject = async (req, res) => {
    ImageUpload(req, res, async function (err, resp) {
        if (err) {
            return console.log('errrrr', err)
        }
        console.log("req.decode ===> ", req.decode)
        console.log("req.files ===> ", req.files)
        let validity = validateData(['name', 'title', 'discription', 'deadLine'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        let attachements = []
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                attachements.push(`localhost:4000/image/${req.files[i].location}`)
            }
        }
        // Create a new User
        const project = new Project({
            name: req.body.name,
            title: req.body.title,
            attachement: attachements,
            discription: req.body.discription,
            text: req.body.text,
            cretatedBy: req.decode._id,
            deadLine: req.body.name,
            status: true
        });
        // Save user in the database
        project.save()
            .then(data => {
                return (successResponse(res, "Project Create Success", data))
            }).catch(err => {
                return (errorResponse(res, err.message || "Something went wrong while creating new Project."))
            });
    })
};


// Delete a User with the specified id in the request
exports.addTeam = async (req, res) => {
    console.log("req.decode ===> ", req.decode)
    let validity = validateData(['projectId', 'userId', 'status'], req.body)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let userExist = await User.findOne({ _id: req.body.userId })
    if (!userExist) {
        return (errorResponse(res, "User Not exist."))
    }
    let projectExist = await Project.findOne({ _id: req.body.projectId })
    if (!projectExist) {
        return (errorResponse(res, "Project Not exist."))
    }
    if (projectExist && projectExist.role === "user") {
        return (errorResponse(res, "Invalid User."))
    }
    let updateQuerry = {}
    if (req.body.status === "add") {
        updateQuerry["$push"] = { team: req.body.userId }
    }
    if (req.body.status === "remove") {
        updateQuerry["$pull"] = { team: req.body.userId }
    }
    Project.findOneAndUpdate({ _id: projectExist._id }, updateQuerry, { new: true, upsert: true }, function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            return (successResponse(res, "Tream Update Success", result))
        }
    })
};

// Delete a User with the specified id in the request
exports.getUserProjects = async (req, res) => {
    let data = req.body
    if (req.decode.role != "user") {
        return (errorResponse(res, "Invalid Api."))
    }
    let validity = validateData(['shortBy', 'page', 'size', 'order'], req.body)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    console.log("63a2eb9f31df905eb9e40c25 ===> ", req.decode._id)
    let userCount = await Project.aggregate([
        { $match: { "team": { "$in": [req.decode._id] } } },
        { $group: { _id: null, myCount: { $sum: 1 } } }
    ])
    Project.aggregate([
        { $match: { team: { $in: [req.decode._id] } } },
        { $skip: ((Number(data.page) - 1) * Number(data.size)) },
        { $limit: Number(data.size) },
        { $sort: { [`${data.shortBy}`]: Number(data.order) } }
    ]).then(users => {
        return (successResponseWithCount(res, "User All Data", users, userCount[0] && userCount[0].myCount || 0))
    }).catch(err => {
        return (errorResponse(res, err.message || "Something went wrong while getting list of users."))
    });
};

// Delete a User with the specified id in the request
exports.addTaskUpdate = async (req, res) => {
    ImageUpload(req, res, async function (err, resp) {
        if (err) {
            return console.log('errrrr', err)
        }
        let data = req.body
        if (req.decode.role != "user") {
            return (errorResponse(res, "Invalid Api."))
        }
        let validity = validateData(['massage', 'hours', 'minutes', 'projectId'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        let attachements = []
        console.log("req.files ===> ", req.files)
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                attachements.push(`localhost:4000/image/${req.files[i].location}`)
            }
        }
        console.log("attachements ==> ", attachements)
        // Create a new User
        const projectUpdate = new ProjectUpdate({
            massage: data.massage,
            hours: data.hours,
            minutes: data.minutes,
            attachement: attachements,
            status: true,
            cretatedBy: req.decode._id,
            projectId: data.projectId,
            createdAt: new Date()
        });
        // Save user in the database
        projectUpdate.save()
            .then(data => {
                return (successResponse(res, "Project Create Success", data))
            }).catch(err => {
                return (errorResponse(res, err.message || "Something went wrong while creating new Project."))
            });
    })
};

// Delete a User with the specified id in the request
exports.getProject = async (req, res) => {
    let data = req.body
    let validity = validateData(['projectId', 'shortBy', 'page', 'size', 'order'], data)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    Project.findOne({ _id: data.projectId }, async function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            let allComment = await ProjectUpdate.aggregate([
                { $match: { projectId: result._id } },
                { $skip: ((Number(data.page) - 1) * Number(data.size)) },
                { $limit: Number(data.size) },
                { $sort: { [`${data.shortBy}`]: Number(data.order) } }
            ])
            let userCount = await ProjectUpdate.aggregate([
                { $match: { projectId: result._id } },
                { $group: { _id: null, myCount: { $sum: 1 } } }
            ])
            let allData = {
                projectDetail: result,
                projectUpdates: allComment,
                projectUpdatesCount: userCount[0] && userCount[0].myCount || 0
            }
            return (successResponse(res, "Project Find Success", allData))
        }
    })
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

// Delete a User with the specified id in the request
exports.updateTeam = async (req, res) => {
    let data = req.body
    let validity = validateData(['name', 'teamId'], data)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let teamExist = await Team.findOne({ _id: req.body.teamId })
    if (!teamExist) {
        return (errorResponse(res, "Team Not Exist."))
    }
    let findQuerry = {
        _id: req.body.teamId
    }
    let updateQuerry = {
        name: data.name
    }
    Team.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            return (successResponse(res, "Team Create Success", result))
        }
    })
};

// Delete a User with the specified id in the request
exports.getAllTeams = async (req, res) => {
    Team.find({}, async function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            return (successResponse(res, "Get Team Success", result))
        }
    })
};
// Delete a User with the specified id in the request
exports.createTeam = async (req, res) => {
    let data = req.body
    let validity = validateData(['name'], data)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let findQuerry = {
        name: data.name
    }
    let updateQuerry = {
        name: data.name,
        cretatedBy: req.decode._id,
        status: true
    }
    Team.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            return (successResponse(res, "Team Create Success", result))
        }
    })
};

// Delete a User with the specified id in the request
exports.deleteTeam = async (req, res) => {
    let data = req.body
    let validity = validateData(['teamId'], data)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let teamExist = await Team.findOne({ _id: req.body.teamId })
    if (!teamExist) {
        return (errorResponse(res, "Team Not Exist."))
    }
    Team.remove({ _id: req.body.teamId }, async function (err, result) {
        if (err) {
            return (errorResponse(res, err.message || "Something went wrong while Update team Member."))
        }
        if (result) {
            return (successResponse(res, "Team Delete Success", result))
        }
    })
};

