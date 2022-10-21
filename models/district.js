const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema({
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

const District = new mongoose.model("districts", districtSchema);

module.exports = District;
