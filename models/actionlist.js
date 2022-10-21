const mongoose = require("mongoose");

const actionlistSchema = new mongoose.Schema({
    cit_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cits"
    },
    serial_number: {
        type: Number
    },
    dimension_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "citDimensions"
    },
    dimension_score: {
        type: Number
    },
    data_question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "citDimensionsQuestions"
    },
    cit_detail_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "citdetails"
    },
    department:{
        type: String
    },
    duty_bearer:{
        type:String
    },
    targated_date:{
        type:Date
    },
    activity_detail: [
        {
            activity: {
                type: String
            },
            status: {
                type: Boolean,
                default: false
            }
        }
    ],
    status:{
        type:String,
        // enum: {
        //     values: ["closed", "pending"],
        //     message: '{VALUE} is not a correct value. Expected closed,pending'
        // }
    },
    is_prioritized: {
        type: Boolean,
        default: true
    }
   
   
},{timestamps: true})

const ActionList = new mongoose.model("actionLists",actionlistSchema);

module.exports = ActionList;