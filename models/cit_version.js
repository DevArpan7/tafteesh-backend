const mongoose = require("mongoose");

const citVersionSchema = new mongoose.Schema({
	name:{
        type: String,
        trim: true,
        required: [true, "Name is required"],
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
}, {timestamps: true});

const CitVersion = new mongoose.model("citVersions", citVersionSchema);

module.exports = CitVersion;
