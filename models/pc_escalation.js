const mongoose = require("mongoose");

const survivorPcEscalationSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    survivor_pc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorPcs"
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
    pc_started_date: {
        type: Date
    },
    current_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pcCurrentStatuss"
    },
    escalted_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "escalatedTypes"
    },
    date_of_escalation: {
        type: Date
    },
    registration_number: {
        type: String
    },
    date_of_file: {
        type: Date
    },
    reason_for_writ_appeal_contemt:{
        type:String,
    },
    status_of_writ_appeal_contempt: {
        type: String,
    },
    document_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "documentTypes"
    },
    document_url: {
        type: String
    },
    result_of_escalation: {
        type: String,
        // enum: {
        //     values: ["writ", "contempt", "revisions", "petitions"],
        //     message: '{VALUE} is not a correct value. Expected writ / contempt /revisions/petitions'
        // }
    },

    esc_result:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "pcEscalationResults"
    },
    reference_fir: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorFirs"
    },
    reference_investigation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorInvestigations"
    },
    reference_chargesheet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorChargeSheets"
    },
    what_is_concluded: {
        type: String,
        enum: {
            values: ["convicted", "aquital"],
            message: '{VALUE} is not a correct value. Expected convicted, aquital'
        }
    },
    escalation_required: {
        type: Boolean,
        default: false
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

survivorPcEscalationSchema.pre('save', async function(next) {
    try {
        this.unique_id = 'SURV-PC-ESC' + Date.now();
        next();
    } catch (error) {
        return next(error);
    }
});

const SurvivorPcEscalation = new mongoose.model("survivorPcEscalations", survivorPcEscalationSchema);

module.exports = SurvivorPcEscalation;