const mongoose = require("mongoose");

const survivorFirSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    location: {
        type: String,
        enum: {
            values: ["sa", "da"],
            message: '{VALUE} is not a correct, expected sa, da'
        }
    },
    policeStation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "policestations"
    },
    name_of_defacto_complainer: {
        type: String
    },
    relation_with_defacto_complainer: {
        type: String
    },
    gd_number: {
        type: String
    },
    date_of_gd: {
        type: Date
    },
    issue_mention_in_gd: {
        type: String
    },
    issues_in_fir: {
        type: String
    },
    fir: {
        source: {
            type: String,
            enum: {
                values: ["sa", "da"],
                message: '{VALUE} is not a correct, expected sa, da'
            }
        },
        number: {
            type: String
        },
        date: {
            type: Date
        }
    },
    accused: [
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
    section: [
        {
            // section_type: {
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: "acts"
            // },
            // section_number: {
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: "sections"
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

const SurvivorFir = new mongoose.model("survivorFirs", survivorFirSchema);

module.exports = SurvivorFir;