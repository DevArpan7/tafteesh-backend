const mongoose = require("mongoose");

const roleModuleSchema = new mongoose.Schema({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles"
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

const RoleModule = new mongoose.model("roleModules", roleModuleSchema);

module.exports = RoleModule;