const mongoose = require("mongoose");

const CitGoalSchema = new mongoose.Schema({
    cit_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cits",
        required: [true, "Please choose a proper cit"]
    },
    dimension_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "citDimensions",
        required: [true, "Please choose a proper cit dimension"]
    },
    dimension_queston:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "citDimensionsQuestions",
        required: [true, "Please choose a proper cit dimension question"]
    },
    sr_no: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    department: {
        type: String
    },
    duty_bearer: {
        type: String
    },
    targeted_date: {
        type: Date
    },
    activities: {
        type: Array
    },
    status: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }

},{timestamps: true})

const CitGoal = new mongoose.model("citGoals", CitGoalSchema);

module.exports = CitGoal;