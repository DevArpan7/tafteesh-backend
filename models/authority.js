const mongoose = require("mongoose");

const authoritySchema = new mongoose.Schema({
    authority_type:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"authoritytypes"
    },
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

const Authority = new mongoose.model("authoritys",authoritySchema);
module.exports=Authority;