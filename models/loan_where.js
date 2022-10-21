const mongoose = require("mongoose");

const loanwhereTypeSchema = new mongoose.Schema({
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

const  LoanWhere= new mongoose.model("loanwhere",loanwhereTypeSchema);
module.exports=LoanWhere;