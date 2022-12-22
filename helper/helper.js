const jwt = require('jsonwebtoken');
const { jwtSecretKey } = require('../config/db.config');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';


module.exports = {
    validateData: function (reqData, data) {
        let msgData = {
            error: false,
            msg: ""
        }
        console.log("reqData ===> ",reqData)
        console.log("reqData ===> ",reqData.length)
        if(reqData && reqData.length > 0){
            for(let i =0; i < reqData.length; i++){
                if(data[reqData[i]] && data[reqData[i]] != null && data[reqData[i]] != "null") {

                }else{
                    msgData.error = true;
                    msgData.msg = reqData[i] + " is Required";
                    break;
                }
            }
        }
        return msgData
    },
    successResponse: function (res, msg, data) {
        return (
            res.status(200).send({
                data: data,
                success: true,
                message: msg
            })
        )
    },
    successResponseWithCount: function (res, msg, data, count) {
        return (
            res.status(200).send({
                data: data,
                success: true,
                message: msg,
                count: count
            })
        )
    },
    errorResponse: function (res, msg) {
        return (
            res.status(500).send({
                success: false,
                message: msg
            })
        )
    },
    jwtToken: function (email) {
        let data = {
            time: Date(),
            email: email,
        }
        const token = jwt.sign(data, jwtSecretKey);
        return (token)
    }
}