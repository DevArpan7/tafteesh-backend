const mongoose = require("mongoose");

const shgSchema = new mongoose.Schema({
	name:{
        type: String,
        trim: true,
        required: [true, "Name is required"],
    },
    status: {
        type: Boolean,
        default: true
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
}, {timestamps: true});

const Shg = new mongoose.model("shgs", shgSchema);

module.exports = Shg;
