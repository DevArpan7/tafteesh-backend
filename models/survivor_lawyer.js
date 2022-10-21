const mongoose = require("mongoose");

const survivorlawyerSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    source: {
        type: String,
        enum: {
            values: ["sa", "da"],
            message: '{VALUE} is not a correct value. Expected sa, da'
        }
    },
    name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "lawyers"
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "lawyercategories"

    },
    isleading:{
        type:Boolean
    },
    from_date:{
        type:Date,
    },
    to_date:{
        type:Date,
        //validate: [dateValidator, 'To date must be greater than form date']

    },
    leading_at:{
        type: String,
        enum: {
            values: ["vc","pc","both"],
            message: '{VALUE} is not a correct value. Expected vc,pc,both'
        }
    },
    updated_notes:{
        type:String
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    deleted_at:{
        type:Date
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
}, {timestamps: true});


// function dateValidator(value) {
//     return this.from_date <= value;
//   }


const SurvivorLawyer = new mongoose.model("survivorlawyers", survivorlawyerSchema);

module.exports = SurvivorLawyer;
