const mongoose = require("mongoose");

const authorityTypeSchema = new mongoose.Schema({
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

const AuthorityType = new mongoose.model("authoritytypes",authorityTypeSchema);
module.exports=AuthorityType;