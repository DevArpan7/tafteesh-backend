const mongoose = require("mongoose");

const survivorIncomeSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    mode_of_earning: {
        type: String,
        // enum: {
        //     values: ["part time job", "full time job","business","stipend"],
        //     message: '{VALUE} is not a correct value. Expected Part time job, full time job, business, stipend'
        // }
    },
    type: {
        type: String,
        // enum: {
        //     values: ["job", "business"],
        //     message: '{VALUE} is not a correct, expected job, business'
        // }
    },
    income_mode:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "modeOfEarnings"
    },
    income_type:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "earningTypes"
    },
    amount: {
        type: Number
    },
    source: {
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

}, {timestamps: true})

const SurvivorIncome = new mongoose.model("survivorIncomes", survivorIncomeSchema);

module.exports = SurvivorIncome;