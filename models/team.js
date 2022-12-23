const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    cretatedBy:{ type: mongoose.Schema.ObjectId, ref: 'User' },
    name: { type: String, require: true },
    status:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('team', teamSchema);