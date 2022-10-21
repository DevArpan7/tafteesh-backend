const mongoose = require("mongoose");

const pcCurrentStatusSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
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

const PcCurrentStatus = new mongoose.model("pcCurrentStatuss",pcCurrentStatusSchema);

module.exports = PcCurrentStatus;