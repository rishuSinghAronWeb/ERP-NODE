const mongoose = require('mongoose');

const ProjectSchema = mongoose.Schema({
    name:{ type: String, require: true, default: "" },
    title: { type: String, require: true , default: "" },
    discription: { type: String, require: true , default: "" },
    attachement:[{ type: String, default: [] }],
    text: { type: String, require: true, default: ""  },
    permission: { type: String },
    cretatedBy:{ type: mongoose.Schema.ObjectId, ref: 'User' },
    projectmanager:{ type: mongoose.Schema.ObjectId, ref: 'User' },
    team:[{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    deadLine: { type: String },
    status:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('project', ProjectSchema);