const User = require('../models/user');

exports.validateUser = async function (req, res, next) {
    let userToken = req.headers.authorization
    let userExist = await User.findOne({ token: userToken })
    if (userExist) {
        console.log("userExist ===> ",userExist)
        if(userExist.role != 'user'){
            return res.status(200).send({
                success: false,
                message: "Invalid permission!"
            })
        }else{
            req.decode = userExist
            next()
        }
    } else {
        return res.status(500).send({
            success: false,
            message: "Invalid Credentials!"
        })
    }
}
exports.validateHr = async function (req, res, next) {
    let userToken = req.headers.authorization
    let userExist = await User.findOne({ token: userToken })
    if (userExist) {
        if(userExist.role != 'hr'){
            return res.status(200).send({
                success: false,
                message: "Invalid permission!"
            })
        }else{
            req.decode = userExist
            next()
        }
    } else {
        return res.status(200).send({
            success: false,
            message: "Invalid Credentials!"
        })
    }
}
exports.validateAdmin = async function (req, res, next) {
    let userToken = req.headers.authorization
    let userExist = await User.findOne({ token: userToken })
    if (userExist) {
        req.decode = userExist
        next()
    } else {
        return res.status(500).send({
            success: false,
            message: "Invalid Credentials!"
        })
    }
}
exports.validateManager = async function (req, res, next) {
    let userToken = req.headers.authorization
    let userExist = await User.findOne({ token: userToken })
    if (userExist) {
        if(userExist.role != 'manager'){
            return res.status(200).send({
                success: false,
                message: "Invalid permission!"
            })
        }else{
            req.decode = userExist
            next()
        }
    } else {
        return res.status(500).send({
            success: false,
            message: "Invalid Credentials!"
        })
    }
}
exports.commanAuth = async function (req, res, next) {
    let userToken = req.headers.authorization
    let userExist = await User.findOne({ token: userToken })
    if (userExist) {
        req.decode = userExist
        next()
    } else {
        return res.status(500).send({
            success: false,
            message: "Invalid Credentials!"
        })
    }
}