const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name:{ type: String, require: true, default: "" },
    email: { type: String, require: true , default: "" },
    password: { type: String, require: true , default: "" },
    phone: { type: String, require: true, default: ""  },
    permission: { type: String },
    role: { type: String, default: "user", enum: ["user","admin","sumAdmin","employee"] },
    token: { type: String },
    is_active:  { type: Boolean, default: false },
    is_deleted:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);