const mongoose = require("mongoose");

const survivorVcEscalationSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    survivor_vc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorVcs"
    },
    survivor_vc_escalation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorVcEscalations"
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
    escalated_at: {
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
        default: true
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
    vc_esc_result:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"vcEscalationResults"
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
        //     values: ["Applied", "Awarded", "Rejected", "Eacalated", "Conculded"],
        //     message: '{VALUE} is not a correct value. Expected Applied/Awarded/Rejected/Eacalated/Conculde'
        // }
    },
    vc_status:{
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
    unique_id : {
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

survivorVcEscalationSchema.pre('save', async function(next) {
    try {
        this.unique_id = 'SURV-VC-ESC' + Date.now();
        next();
    } catch (error) {
        return next(error);
    }
});

const SurvivorVcEscalation = new mongoose.model("survivorVcEscalations", survivorVcEscalationSchema);

module.exports = SurvivorVcEscalation;