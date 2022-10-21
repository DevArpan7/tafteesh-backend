const mongoose = require("mongoose");

const survivorVcSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    source: {
        type: String,
        enum: {
            values: ["sa", "da"],
            message: '{VALUE} is not a correct value. Expected sa, da'
        }
    },
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lawyers"
    },
    applied_at: {
       type:mongoose.Schema.Types.ObjectId,
       ref:"authoritytypes"
    },
    authority: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "authoritys"
    },
    applied_date: {
        type: Date
    },
    application_number: {
        type: String
    },
    amount_claimed: {
        type: Number
    },
    video_conferencing: {
        type: Boolean,
        default: false
    },
    vc_application: {
        type: String
    },
    date_of_order: {
        type: Date
    },
    result: {
        type: String,
        // enum: {
        //     values: ["awarded", "rejected", "awaiting"],
        //     message: '{VALUE} is not a correct value. Expected awarded, rejected, awaiting'
        // }
    },
    amount_awarded: {
        type: Number
    },
    amount_received_in_bank: {
        type: Number
    },
    amount_received_in_bank_date: {
        type: Date
    },
    difference_between_amount_claim_reward: {
        type: Number
    },
    escalation: {
        type: Boolean
    },
    reason_for_escalation: {
        type: String
    },
    status: {
        type: String,
        // enum: {
        //     values: ["Applied", "Awarded","Rejected","Escalated","Concluded"],
        //     message: '{VALUE} is not a correct value. Expected Applied, Awarded,Rejected,Escalated,Concluded'
        // }

    },
    vc_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vcstatus"
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    },
    unique_id: {
        type: String
    },
    totalEscalation: {
        type: Number,
        default: 0
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

survivorVcSchema.pre('save', async function(next) {
    try {
        this.unique_id = 'SURV-VC' + Date.now();
        next();
    } catch (error) {
        return next(error);
    }
});

const SurvivorVc = new mongoose.model("survivorVcs", survivorVcSchema);

module.exports = SurvivorVc;