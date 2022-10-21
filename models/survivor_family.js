const mongoose = require("mongoose");

const survivorFamilySchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    name:{
        type:String
    },
    income:{
        type:Number
    },
    type:{
        type:String
    },
    address:{
        type:String
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

const SurvivorFamily = new mongoose.model("survivorfamilys", survivorFamilySchema);

module.exports = SurvivorFamily;