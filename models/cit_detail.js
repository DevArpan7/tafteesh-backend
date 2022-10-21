const mongoose = require("mongoose");

const detailSchema = new mongoose.Schema({
    cit_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cits"
    },
    dimension_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "citDimensions"
    },
    dimension_score:{
        type:Number
    },
    dimension_detail: [
        {
            question_id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "citDimensionsQuestions"
            },
            answer:{
                type:String,
                trim: true,
                required: true,
                validate(value) {
                    const answer = value;
                    const pattern = /[a-zA-Z0-9]{1,}[,._\s]{0,}/g
                    if(!pattern.test(answer)) {
                        throw new Error("Answer only consists alphanumeric")
                    }
                }
            },
            action_needed:{
                type:Boolean,
                default:false
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

},{timestamps: true})

detailSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

const CitDetail = new mongoose.model("citdetails",detailSchema);

module.exports = CitDetail;