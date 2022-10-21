const mongoose = require("mongoose");

const grantSchema = new mongoose.Schema({
    name:{
        type:String
    },
    amount:{
        type:Number
    },
    installment_number:{
        type:Number
    },
    // purpose_of_grant: {
    //     type: String,
    //     // enum: {
    //     //     values: ["housing", "sanitation", "education"],
    //     //     message: '{VALUE} is not a correct value. Expected Part time housing, sanitation, education'
    //     // }
    // },
    // purpose_of_grant_Id:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "purposeOfGrant",
    // },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
},{timestamps: true})

const Grant = new mongoose.model("grants",grantSchema);

module.exports = Grant;