const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
	name:{
        type: String,
        trim: true,
        required: [true, "Name is required"],
    },
    stateId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "states",
        required: [true, "State is required"],
    },
    districtId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "districts",
        required: [true, "District is required"],
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

const Block = new mongoose.model("blocks", blockSchema);

module.exports = Block;
