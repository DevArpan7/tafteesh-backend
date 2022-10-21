const mongoose = require("mongoose");

const resofProsecutionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
    
},{timestamps:true});

const ResOfProsecution = new mongoose.model("resOfProsecutions",resofProsecutionSchema);

module.exports = ResOfProsecution;