const mongoose = require("mongoose");

const modeOfEarningSchema = new mongoose.Schema({
    earning_type:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"earningTypes"
    },
    name:{
        type:String,
        required: true,
        trim: true
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
},{timestamps:true});

const ModeOfEarning = new mongoose.model("modeOfEarnings",modeOfEarningSchema);
module.exports = ModeOfEarning;