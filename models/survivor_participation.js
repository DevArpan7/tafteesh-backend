const mongoose = require("mongoose");

const survivorParticipationSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    meeting_date: {
        type: Date
    },
    participation: {
        type: String
    },
    family_support: {
        type: String
    },
    support_from_family_to_persue_case: {
        type: String
    },
    notes: {
        type: String
    },
    meeting_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
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
}, {timestamps: true})

const SurvivorParticipation = new mongoose.model("survivorParticipations", survivorParticipationSchema);

module.exports = SurvivorParticipation;