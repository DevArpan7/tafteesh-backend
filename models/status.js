const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
	status_type:{
        type: String
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
}, {timestamps: true});

const Status = new mongoose.model("statuss", statusSchema);

module.exports = Status;
