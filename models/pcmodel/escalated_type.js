const mongoose = require("mongoose");

const escalatedTypeSchema = new mongoose.Schema({
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

const EscalatedType = new mongoose.model("escalatedTypes",escalatedTypeSchema);

module.exports = EscalatedType;