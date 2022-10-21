const mongoose = require("mongoose");

const dimensionSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true 
    },
    cit_version: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "citVersions"
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
   
},{timestamps: true})

const CitDimension = new mongoose.model("citDimensions",dimensionSchema);

module.exports = CitDimension;