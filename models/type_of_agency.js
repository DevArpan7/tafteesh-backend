const mongoose = require("mongoose");

const invAgencyTypeSchema = new mongoose.Schema({
    name:{
        type: String,
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

const InvAgencyType = new mongoose.model("invAgencyTypes",invAgencyTypeSchema);
module.exports=InvAgencyType;