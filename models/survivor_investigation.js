const mongoose = require('mongoose');

const survivorInvestigationSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    source:{
        type:String,
        enum:{
            values:["sa","da"],
            message: '{VALUE} is not a correct, expected sa, da'
        }
    },
    type_of_investigation_agency:{
        type:String,
        // enum:{
        //     values:["AHTU","Police Station"],
        //     message:'{VALUE} is not a correct, expected AHTU,Police Station'
        // }
    },
    name_of_agency:{
        type:String,
        // enum:{
        //     values:["CID","Barvipur","Barashat"],
        //     message:'{VALUE} is not a correct, expected CID ,Barvipur,Barashat'
        // }
    },

    inv_agency_type:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "invAgencyTypes"
    },
    inv_agency_name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "agencies"
    },
    name_of_inv_officer:{
        type:String
    },
    status_of_investigation:{
        type:String,
        // enum:{
        //     values:["Ongoing","Completed"],
        //     message:'{VALUE} is not a correct, expected Ongoing,Completed'
        // }

    },
    inv_status:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "investigationStatus"
    },
    rank_of_inv_officer:{
        type:String
    },
    result_of_inv:{
        type:String,
        // enum:{
        //     values:["ChargeSheet","FRT","Pending"],
        //     message:'{VALUE} is not a correct, expected ChargeSheet,FRT,Pending'
        // }
        
    },
    ref_fir:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorFirs"
    },
    pc:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorPcs"
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
},{timestamps: true})

const SurvivorInvestigation = new mongoose.model("survivorInvestigations", survivorInvestigationSchema);

module.exports = SurvivorInvestigation;