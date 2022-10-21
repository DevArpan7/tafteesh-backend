const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema({
    agency_type:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"invAgencyTypes"
    },
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

const Agency = new mongoose.model("agencies",agencySchema);
module.exports=Agency;