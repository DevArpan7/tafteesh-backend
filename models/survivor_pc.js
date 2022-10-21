const mongoose = require("mongoose");

const survivorPcSchema = new mongoose.Schema({
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
    doc_path: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "doc_ref"
    },
    doc_ref: {
        type: String,
        enum: {
            values: ["survivorFirs", "survivorInvestigations", "survivorChargeSheets"],
            message: "Please select between - survivorFirs/survivorInvestigations/survivorChargeSheets"
        }
    },
    started_date: {
        type: Date
    },
    why: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pcWhys"
    },
    court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courts"
    },
    current_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pcCurrentStatuss"
    },
    result_of_prosecution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "resOfProsecutions"
    },
    document_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "documentTypes"
    },
    document_url: {
        type: String
    },
    result_of_pc: {
        type: String,
        // enum: {
        //     values: ["success", "rejected", "awaiting"],
        //     message: '{VALUE} is not a correct value. Expected success, rejected, awaiting'
        // }
    },
    escalation_required: {
        type: Boolean,
        default: false
    },
    escalation_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "escalatedTypes"
    },
    escalation_reason: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "escalatedReasons"
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

survivorPcSchema.pre('save', async function(next) {
    try {
        this.unique_id = 'SURV-PC' + Date.now();
        next();
    } catch (error) {
        return next(error);
    }
});

const SurvivorPc = new mongoose.model("survivorPcs", survivorPcSchema);

module.exports = SurvivorPc;