const mongoose = require("mongoose");

const mortgageSchema = new mongoose.Schema({
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

},{timestamps: true})

const Mortgage = new mongoose.model("mortgages",mortgageSchema);

module.exports =  Mortgage;