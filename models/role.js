const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
	name:{
        type: String,
        required: [true, "Role name is required"],
        minlength: [2, "Role name should be contains 2 letters"],
    },
    reporting_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles"
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
}, {timestamps: true});

const Role = new mongoose.model("roles", roleSchema);

module.exports = Role;