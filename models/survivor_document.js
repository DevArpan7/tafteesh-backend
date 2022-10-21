const mongoose = require("mongoose");

const survivorDocumentSchema = new mongoose.Schema({
    survivor_profile:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"survivorProfiles"
    },
    document_type: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"documents"
    },
    about: {
        type: String
    },
    file: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    },
    inactive_reason: {
        type: String
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
}, {timestamps: true});

const SurvivorDocument = new mongoose.model("survivorDocuments", survivorDocumentSchema);

module.exports = SurvivorDocument;