const mongoose = require("mongoose");

const actTypeSchema = new mongoose.Schema({
	name:{
        type: String,
        trim: true,
        required: [true, "setionType name is required"],
        minlength: [2, "setionType name should be contains 2 letters"]
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
}, {timestamps: true});

const Act = new mongoose.model("acts", actTypeSchema);

module.exports = Act;