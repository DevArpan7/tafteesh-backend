const mongoose = require("mongoose");

const changeLogSchema = new mongoose.Schema({
    targeted_data: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "targeted_data_ref"
    },
    targeted_data_ref: {
        type: String,
        enum: {
            values: ["survivorFirs","survivorRescues" ,"survivorInvestigations", "survivorChargeSheets", "supplimentaryChargesheets", "survivorDocuments", "survivorGrants", "survivorIncomes", "survivorLoans", "survivorVcs", "survivorPcs", "survivorProfiles","survivorParticipations","SurvivorNextplanActions","survivorlawyers","survivorfamilys","shelterHomes","survivorVcEscalations","survivorPcEscalations","survivorDiary","survivortraffickerProfiles"]
        }
    },
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    old_data: {
        type: String
    },
    description: {
        type: String
    },
    new_data: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    },
    changed_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "changed_by_ref"
    },
    changed_by_ref: {
        type: String,
        enum: {
            values: ["users", "admins"]
        }
    },
    module: {
        type:String,
        enum: {
            values: ["document", "rescue", "fir", "investigation", "lawyer", "participation", "chargesheet", "vc", "pc", "shelter", "next_plan", "loan", "income", "grant", "cit", "profile","family","supchargesheet","vcescalation","pcescalation","diary","trafficker"]
        }
    },
    note: {
        type: String
    }
}, {timestamps: true});

const Changelog = new mongoose.model("changelogs", changeLogSchema);

module.exports = Changelog;