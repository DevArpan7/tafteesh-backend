const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
	number:{
        type: String,
        trim: true,
        required: [true, "setionNumber name is required"],
        minlength: [2, "setionNumber name should be contains 2 letters"],
    },
    act:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"acts"
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
    
}, {timestamps: true});

const Section = new mongoose.model("sections",sectionSchema);

module.exports = Section;