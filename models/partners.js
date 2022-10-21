const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    name:{
        type:String
    },
    phone_no:{
        type:String,
        required:[true,"Phone no is required"],
        type:String,
        validate(value){
            if(value.length!=10){
                throw new Error("phone no should be 10 digit") 
            }
        }
    },
    email:{
        type:String,
        validate(value) {
            const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z-.]+$/g
            if(!pattern.test(value)) {
                throw new Error("Wrong email format.")
            }
        }
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
},{timestamps: true});

partnerSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

const Partner = new mongoose.model("partners",partnerSchema);

module.exports = Partner;