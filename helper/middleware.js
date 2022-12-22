const User = require('../models/user');

exports.validateUser = async function (req, res, next) {
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