const mongoose = require("mongoose");

const supplementaryFirSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    survivor_Fir: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorFirs"
    },
    // survivor_supplementary_fir: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "supplementaryFirs"
    // },
    location: {
        type: String,
        enum: {
            values: ["source", "destination"],
            message: '{VALUE} is not a correct, expected source, destination'
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
                    values: ["source", "destination", "transit"],
                    message: '{VALUE} is not a correct, expected source, destination, transit'
                }
            }
        }
    ],
    section: [
        {
            section_type: {
                type: String,
                enum: {
                    values: ["ipc", "itpa"],
                    message: '{VALUE} is not a correct, expected ipc, itpa'
                }
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
    }
}, {timestamps: true})

const SupplementaryFir = new mongoose.model("supplementaryFirs", supplementaryFirSchema);

module.exports =  SupplementaryFir;