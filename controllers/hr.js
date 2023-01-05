const User = require('../models/user');
const Project = require('../models/projectBid');
const ProjectUpdate = require('../models/projectUpdate');
const Leave = require('../models/leaves');
const upload = require('../helper/awsimageupload');
const ImageUpload = upload.single('photos');
const { successResponse, errorResponse, successResponseWithCount, validateData } = require('../helper/helper');

// Create and Save a new User
exports.login = async (req, res) => {
    try {
        let validity = validateData(['password', 'email'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        let verifyEmail = await User.findOne({ email: req.body.email, role: "hr" })
        if (!verifyEmail) {
            return (errorResponse(res, "HR Not exist."))
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
            role: 'hr',
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
        { $limit: [Number(data.size)] },
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

// Create and Save a new User
exports.approveLeaved = async (req, res) => {
    try {
        let validity = validateData(['leaveId', 'status'], req.body)
        if (validity && validity.error) {
            return (errorResponse(res, validity.msg))
        }
        let leveExist = await Leave.findOne({ _id: req.body.leaveId })
        if (!leveExist) {
            return (errorResponse(res, "Invalid Leave."))
        }
        let newUpdate = await Leave.findOneAndUpdate({ _id: req.body.leaveId }, { approvedBy: req.body._id, status: req.body.status }, { new: true })
        return (successResponse(res, `Leave ${req.body.status} Success`, newUpdate))
    } catch (e) {
        return (errorResponse(res, e || "Something went wrong while getting list of Leave."))
    }
};

