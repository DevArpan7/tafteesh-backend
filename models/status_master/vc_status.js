const mongoose = require("mongoose");

const vcStatusSchema = new mongoose.Schema({
	name: {
        type: String,
        trim: true,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    },
    deleted_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "deleted_ref"
    },
    deleted_ref: {
        type: String,
        enum: {
            values: ["users", "admins"],
            message: "Expected values users/admins"
        }
    }
}, {timestamps: true});

const VcStatus = new mongoose.model("vcstatus", vcStatusSchema);

module.exports = VcStatus;
