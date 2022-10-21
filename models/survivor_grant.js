const mongoose = require("mongoose");

const survivorGrantSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    name_of_grant_compensation: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"grants"
    },
    applied_on: {
        type: Date
    },
    // purpose_of_grant: {
    //     type: String,
    //     enum: {
    //         values: ["housing", "sanitation", "education"],
    //         message: '{VALUE} is not a correct value. Expected Part time housing, sanitation, education'
    //     }
    // },
    purpose_of_grant_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "purposeOfGrant"
    },
    application_number: {
        type: String,
        trim: true,
        required: true
    },
    amount_requested: {
        type: Number
    },
    status: {
        type: String,
        // enum: {
        //     values: ["requested", "rejected", "approved"],
        //     message: '{VALUE} is not a correct value. Expected Part time requested, rejected, approved'
        // }
    },

    grant_status:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"grantStatus"
    },
    reference_document: {
        type: String
    },
    approved_amount: {
        type: Number
    },
    received_on: {
        type: Date
    },
    received_amount_so_far: {
        type: Number
    },
    reference_result_document: {
        type: String,
        // enum: {
        //     values: ["approval", "rejection"],
        //     message: '{VALUE} is not a correct value. Expected approval,rejection'
        // }
    },
    installments: [
        {
            installment: {
                type: String
            },
            estimated_date: {
                type: Date
            },
            amount: {
                type: Number
            },
            is_deleted: {
                type: Boolean,
                default: false
            },
            deleted_at: {
                type: Date
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
        }
    ],
    utilization_plans: [
        {
            description: {
                type: String
            },
            amount: {
                type: Number
            },
            is_deleted: {
                type: Boolean,
                default: false
            },
            deleted_at: {
                type: Date
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
        }
    ],
    escalations: [
        {
            escalated_to: {
                type:String
            },
            escalated_on: {
                type: Date
            },
            application_number: {
                type: String
            },
            amount_requested: {
                type: Number
            },
            status: {
                type: String,
                // enum: {
                //     values: ["requested", "rejected", "approved"],
                //     message: '{VALUE} is not a correct value. Expected Part time requested, rejected, approved'
                // }
            },
            escalation_status:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"grantStatus"
            },
            reference_document: {
                type: String
            },
            received_on: {
                type: Date
            },
            received_amount: {
                type: Number
            },
            reference_result_document: {
                type: String,
                enum: {
                    values: ["approval", "rejection"],
                    message: '{VALUE} is not a correct value. Expected approval,rejection'
                }
            },
            installment_number:{
                type:Number,
            },
            escalation: {
                type: Boolean
            },
            reason_for_escalation: {
                type: String,
                trim: true,
                required: true
            },
            is_deleted: {
                type: Boolean,
                default: false
            },
            deleted_at: {
                type: Date
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
        }
    ],
    installment_number:{
        type:Number
    },
    escalation:{
        type:Boolean
    },
    reason_for_escalation: {
        type: String,
        trim: true
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

const SurvivorGrant = new mongoose.model("survivorGrants", survivorGrantSchema);

module.exports = SurvivorGrant;