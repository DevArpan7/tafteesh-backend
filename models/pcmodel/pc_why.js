const mongoose = require("mongoose");

const pcWhySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"],
        
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
    
},{timestamps:true});

const PcWhy = new mongoose.model("pcWhys",pcWhySchema);

module.exports = PcWhy;