const User = require('../models/user.js');
const { successResponse, errorResponse } = require('../helper/helper');

exports.findAll = (req, res) => {
    User.find()
        .then(users => {
            return(successResponse(res, "User All Data", users))
        }).catch(err => {
            return(errorResponse(res, err.message || "Something went wrong while getting list of users."))
        });
};

// Create and Save a new User
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        return(errorResponse(res,"Please fill all required field."))
    }
    // Create a new User
    const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.last_name,
        phone: req.body.last_name
    });
    // Save user in the database
    user.save()
        .then(data => {
            return(successResponse(res, "User Create Success", data))
        }).catch(err => {
            return(errorResponse(res,err.message || "Something went wrong while creating new user."))
        });
};

// Find a single User with a id
exports.findOne = (req, res) => {
    User.findById(req.params.id)
        .then(user => {
            if (!user) {
            return(errorResponse(res,`User not found with id ${req.params.id}`))
            }
            return(successResponse(res, "User Find By Id Success", user))
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return(errorResponse(res,`User not found with id ${req.params.id}`))
            }    
            return(errorResponse(res,err.message || "Something went wrong while creating new user."))        
        });
};

// Update a User identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        return(errorResponse(res, "Please fill all required field"))
    }
    // Find user and update it with the request body
    User.findByIdAndUpdate(req.params.id, {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.last_name,
        phone: req.body.last_name
    }, { new: true })
        .then(user => {
            if (!user) {
                return(errorResponse(res,`user not found with id ${req.params.id}`))
            }
            return(successResponse(res, "User Data Found", user))
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return(errorResponse(res,`user not found with id ${req.params.id}`))
            }
            return(errorResponse(res,`user not found with id ${req.params.id}`))
        });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then(user => {
            if (!user) {
                return(errorResponse(res,`user not found with id ${req.params.id}`))
            }
            return(successResponse(res, "User Deleted Successfully", {}))
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return(errorResponse(res,`user not found with id ${req.params.id}`))
            }
            return(errorResponse(res,`user not found with id ${req.params.id}`))
        });
};