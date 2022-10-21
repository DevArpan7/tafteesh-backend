const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
	name:{
        type: String,
        trim: true,
        required: [true, "Name is required"],
    },
    stateId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "states",
        required: [true, "State Id is required"],
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

const City = new mongoose.model("cities", citySchema);

module.exports = City;
