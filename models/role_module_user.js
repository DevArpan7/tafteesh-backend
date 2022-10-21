const mongoose = require("mongoose");

const roleModuleUserSchema = new mongoose.Schema({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles"
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [false, "User is required"]
    },
    access: [
        {
            module: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "modules"
            },
            can_view: {
                type: Boolean
            },
            can_edit: {
                type: Boolean
            },
            can_delete: {
                type: Boolean
            }
        }
    ]
}, {timestamps: true});

const RoleModuleUser = new mongoose.model("roleModuleUsers", roleModuleUserSchema);

module.exports = RoleModuleUser;