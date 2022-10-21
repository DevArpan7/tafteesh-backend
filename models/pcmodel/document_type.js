const mongoose = require("mongoose");

const documentTypeSchema = new mongoose.Schema({
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

const DocumentType = new mongoose.model("documentTypes",documentTypeSchema);

module.exports = DocumentType;