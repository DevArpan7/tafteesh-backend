const mongoose = require("mongoose");

const escalatedReasonSchema = new mongoose.Schema({
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

const EscalatedReason = new mongoose.model("escalatedReasons",escalatedReasonSchema);

module.exports = EscalatedReason;