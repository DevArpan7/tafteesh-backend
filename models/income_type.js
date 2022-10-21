const mongoose = require("mongoose");

const earningTypeSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
},{timestamps:true});

const EarningType = new mongoose.model("earningTypes",earningTypeSchema);
module.exports = EarningType;