const mongoose = require("mongoose");

const lawyerSchema = new mongoose.Schema({
	name:{
        type: String,
        trim: true,
        required: [true, "Name is required"],
        minlength: [2, "Name should contain atleast 2 letters"]
    },
    location:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "states",
        required: [true, "Location is required"],
    },
    blockId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "blocks"
    },
    name_of_group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "lawyercategories",
    },
    category: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "lawyercategories",
        }
    ],
    court: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "courts"
        }
    ],
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

const Lawyer = new mongoose.model("lawyers", lawyerSchema);

module.exports = Lawyer;
