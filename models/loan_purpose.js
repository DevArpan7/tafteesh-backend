const mongoose = require("mongoose");

const purposeOfLoanTypeSchema = new mongoose.Schema({
    name:{
        type:String,
        trim: true,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
},{timestamps:true});

const PurposeOfLoan = new mongoose.model("purposeOfLoan",purposeOfLoanTypeSchema);
module.exports = PurposeOfLoan;