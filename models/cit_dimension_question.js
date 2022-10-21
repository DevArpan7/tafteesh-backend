const mongoose = require("mongoose");

const dimensionquestionSchema = new mongoose.Schema({
   cit_dimension:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "citDimensions"
   },
   data: {
        type: String
   },
   answer_type: {
        type: String,
        enum: {
            values: ['textarea', 'select', 'checkbox', 'radio'],
            message: 'Expected - textarea / select / checkbox / radio'
        }
   },
   data_existance_check: {
        type: Boolean,
        default: false
   },
   data_existance_check_from: {
        type: String,
        enum: {
            values: ["documents", "fir", "investigation", "chargesheet"],
            message: "Expected - documents / fir / investigation / chargesheet"
        }
   },
   options:[
       {
           type: String
       }
   ],
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
   
},{timestamps: true})

const CitDimensionQuestion = new mongoose.model("citDimensionsQuestions",dimensionquestionSchema);

module.exports = CitDimensionQuestion;