const mongoose = require("mongoose");

const survivorLoanSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    where: {
        type: String,
        // enum: {
        //     values: ["shg", "bank", "family", "privat_money_lander", "family_member"],
        //     message: '{VALUE} is not a correct value. Expected shg, bank, family, privat_money_lander, family_member'
        // }
    },

    loan_Where:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "loanwhere"
    },
    amount: {
        type: Number
    },
    rate: {
        type: Number
    },
    purpose: {
        type: String,
        // enum: {
        //     values: [" "],
        //     message: '{VALUE} is not a correct value. Expected'
        // }
    },
    loan_purpose:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "purposeOfLoan"
    },
    received_on: {
        type: Date
    },
    tenure: {
        type: Number
    },
    repayment_per_month: {
        type: Number
    },
    total_paid_amount: {
        type: Number
    },
    reference_document: {
        name: {
            type: String
        },
        file: {
            type: String
        }
    },
    paid_log: [
        {
            total_paid: {
                type: Number
            },
            as_of_date: {
                type: Date
            },
            created_at: {
                type: Date,
                default: Date.now()
            },
            is_deleted: {
                type: Boolean,
                default: false
            },
            note: {
                type: String
            }
        }
    ],
    rate_of_interest_mode:{
        type:String,
        enum:{
            values:["yearly","monthly","weekly"],
            message:'{VALUE} is not a correct value.Yearly,Monthly,Weekly '
        }
    },
    mortgage: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "mortgages"
        }
    ],
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

const SurvivorLoan = new mongoose.model("survivorLoans", survivorLoanSchema);

module.exports = SurvivorLoan;