const User = require('../models/user');
const Project = require('../models/projectBid');
const ProjectUpdate = require('../models/projectUpdate');
const { successResponse, errorResponse, successResponseWithCount, validateData } = require('../helper/helper');

// Delete a User with the specified id in the request
exports.createProject = async (req, res) => {
    let validity = validateData(['name', 'title', 'discription', 'deadLine','price'], req.body)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let attachements = []
    if(req.files && req.files.length > 0){
        for(let i = 0; i<req.files.length; i++){
            attachements.push(`localhost:4000/image/${req.files[i].filename}`)
        }
    }
    // Create a new User
    const project = new Project({
        name: req.body.name,
        title: req.body.title,
        attachement: attachements,
        discription: req.body.discription,
        text: req.body.text,
        price: req.body.price,
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
    let data = req.body
    if (req.decode.role != "user") {
        return (errorResponse(res, "Invalid Api."))
    }
    let validity = validateData(['massage', 'hours', 'minutes', 'projectId'], req.body)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    let attachements = []
    console.log("req.files ===> ",req.files)
    if(req.files && req.files.length > 0){
        for(let i = 0; i<req.files.length; i++){
            attachements.push(`localhost:4000/image/${req.files[i].filename}`)
        }
    }
    console.log("attachements ==> ",attachements)
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
};

// Delete a User with the specified id in the request
exports.getProject = async (req, res) => {
    let data = req.body
    let validity = validateData(['projectId','shortBy', 'page', 'size', 'order'], data)
    if (validity && validity.error) {
        return (errorResponse(res, validity.msg))
    }
    Project.findOne({ _id: data.projectId },async function (err, result) {
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
