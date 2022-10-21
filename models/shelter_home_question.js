const mongoose = require("mongoose");

const shelterHomeQuestionSchema = new mongoose.Schema({
    question: {
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

}, {timestamps: true});

const ShelterHomeQuestion = new mongoose.model("shelterHomeQuestions", shelterHomeQuestionSchema);

module.exports = ShelterHomeQuestion;