const mongoose = require("mongoose");

const lawyerCategorySchema = new mongoose.Schema({
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

const LawyerCategory = new mongoose.model("lawyercategories", lawyerCategorySchema);

module.exports = LawyerCategory;
