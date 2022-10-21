const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true
    },
    is_required: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    },
    deleted_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "deleted_by_ref"
    },
    deleted_by_ref: {
        type: String,
        enum: {
            values: ["users", "admins"]
        }
    }
    
},{timestamps:true});

const Document = new mongoose.model("documents",documentSchema);

module.exports = Document;