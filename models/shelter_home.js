const mongoose = require("mongoose");

const shelterHomeSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
	source:{
        type: String
    },
    shelter_home: {
        type: String
    },
    from_date: {
        type: Date
    },
    to_date: {
        type: Date
    },
    journey: [
        {
            question: {
                type: String,
                trim: true
            },
            question_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "shelterHomeQuestions"
            },
            answer: {
                type: String,
                trim: true
            },
            score: {
                type: Number
            }
        }
    ],
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
}, {timestamps: true});

const shelterHome = new mongoose.model("shelterHomes", shelterHomeSchema);

module.exports = shelterHome;