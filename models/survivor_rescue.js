const mongoose = require("mongoose");


const survivorRescueSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    date_of_rescue:{
        type : Date,

    },
    age_when_rescued: {
        type: Number
    },
    rescue_from_place: {
        type: String
    },
    rescue_from_state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "states"
    },
    rescue_from_city: {
        type: String
    },
    nature_of_the_place_of_rescue: {
        type: String
    },
    rescue_conducted_by: {
        type: String,
        enum: {
            values: ["self", "customer", "family", "local_police", "ahtu", "ngo"],
            message: '{VALUE} is not a correct value. Expected self, customer, family, local_police, ahtu, ngo'
        }
    },
    update_notes: {
        type: String
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



const SurvivorRescue = new mongoose.model("survivorRescues", survivorRescueSchema);

module.exports = SurvivorRescue;