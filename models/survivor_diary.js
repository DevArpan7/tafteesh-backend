const mongoose = require("mongoose");

const survivorDiarySchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    to_do:{
        type:String
    },
    plan_date:{
        type:Date
    },
    type:{
        type:String,
        enum:{
            values:["System","Own","readonly"],
            message: '{VALUE} is not a correct value. Expected System,Own,readonly'
        }
    },
    plan_for:{
        type:String,
        enum:{
            values:["Social Worker","Lawyer","Other"],
            message: '{VALUE} is not a correct value. Expected Social Worker,Lawyer,Other'
        }
    },
    remind_before_day_planed_date:{
        type:Number,
        default:7
    },
    select:{
        type:String,
        enum:{
            values:["PC","VC","Rehab","AdvocacyTraning","FIR","ChargeSheet","Investigation", "CIT"],
            message:'{VALUE} is not a correct value. Expected PC,VC,Rehab,Advocacy Traning,FIR,ChargeSheet,Investigation,CIT'
        }
    },
    mode_of_meeting:{
        type:String,
        enum:{
            values:["Personal Visit","Online","Phone call"],
            message:'{VALUE} is not a correct value. Expected Personal Visit,Online,Phone call'
        }
    },
   
    stakeholdder_type:{
        type:String,
        enum:{
            values:["KAMO","Other NGO","Other Tafteesh partner","Survivor","Survivor family","Duty Bearer"],
            message:'{VALUE} is not a correct value. Expected KAMO,Other NGO,Other Tafteesh partner,Survivor,Survivor family,Duty Bearer'
        }
    },
    stakeholder_participants:{
        type:String
    },
    status:{
        type:String,
        // enum:{
        //     values:["Planning","Ongoing","Completed"],
        //     message:'{VALUE} is not a correct value. Expected Planning,Ongoing,Completed" '
        // }
    },
    diary_status:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "diaryStatus"
    },
    outcome:{
        type:String
    },
    next_followUp_date:{
        type:Date
    },
    next_followUp_action:{
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

const SurvivorDiary = new mongoose.model("survivorDiary",survivorDiarySchema);

module.exports = SurvivorDiary;