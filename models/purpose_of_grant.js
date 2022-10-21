const mongoose = require("mongoose");

const purposeOfGrantTypeSchema = new mongoose.Schema({
    grant_name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "grants",
    },
    name:{
        type:String,
        trim: true,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
},{timestamps:true});

const PurposeOfGrant = new mongoose.model("purposeOfGrant",purposeOfGrantTypeSchema);
module.exports = PurposeOfGrant;