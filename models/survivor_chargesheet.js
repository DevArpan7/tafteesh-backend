const mongoose = require("mongoose");

const survivorChargeSheetSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    survivor_investigation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorInvestigations"
    },
    location: {
        type: String,
        enum: {
            values: ["sa", "da"],
            message: '{VALUE} is not a correct, expected sa, da'
        }
    },
    charge_sheet: {
        number: {
            type: String
        },
        date: {
            type: Date
        },
        status: {
            type: String
        }
    },
    fir: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorFirs"
    },
    investigation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorInvestigations"
    },
    type_of_violation:{
        type:String
    },
    accused_included: [
        {
            name: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "traffickerProfiles"
            },
            accused_type: {
                type: String,
                enum: {
                    values: ["sa", "da", "transit"],
                    message: '{VALUE} is not a correct, expected sa, da, transit'
                }
            },
            is_deleted:{
                type: Boolean,
                default: false
            },
            notes: {
                type: String
            }
        }
    ],
    accused_not_included: [
        {
            name: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "traffickerProfiles"
            },
            accused_type: {
                type: String,
                enum: {
                    values: ["sa", "da", "transit"],
                    message: '{VALUE} is not a correct, expected sa, da, transit'
                }
            },
            is_deleted: {
                type: Boolean,
                default: false
            },
            notes: {
                type: String
            }
        }
    ],
    section: [
        {
            // section_type: {
                // type: mongoose.Schema.Types.ObjectId,
                // ref: "acts"
            // },
            // section_number: {
                // type: mongoose.Schema.Types.ObjectId,
                // ref: "sections"
            // },
            section_type: {
                type: String
            },
            section_number: {
                type: String
            },
            date_of_section_when_added_to_fir: {
                type: Date
            },
            notes: {
                type: String
            }
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

const SurvivorChargeSheet = new mongoose.model("survivorChargeSheets", survivorChargeSheetSchema);

module.exports = SurvivorChargeSheet;