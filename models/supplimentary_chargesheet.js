const mongoose = require("mongoose");

const supplimentaryChargesheetSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    survivor_chargesheet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorChargeSheets"
    },
    supplimentary_chargesheet_number: {
        type: String
    },
    date: {
        type: Date
    },
    act: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "acts"
        type:String
    },
    section: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "sections"
        type:String
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    deleted_at: {
        type: Date,
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
}, { timestamps: true });

const SupplimentaryChargesheet = new mongoose.model("supplimentaryChargesheets", supplimentaryChargesheetSchema);

module.exports = SupplimentaryChargesheet;