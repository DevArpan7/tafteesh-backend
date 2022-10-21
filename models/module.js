const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
	name:{
        type: String,
        required: [true, "Name is required"],
        minlength: [2, "Name should contain atleast 2 letters"]
    },
    slug: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

const Module = new mongoose.model("modules", moduleSchema);

module.exports = Module;
