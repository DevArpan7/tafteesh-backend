const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
    uniqueId:{
        type: String,
        //default: "ORG" + Date.now()
    },
	name:{
        type: String,
        required: [true, "Name is required"],
        minlength: [2, "Name should contain atleast 2 letters"]
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        validate(value) {
            const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z-.]+$/g
            if(!pattern.test(value)) {
                throw new Error("Wrong email format.")
            }
        }
    },
    phone:{
        type: String,
        required: [true, "Phone is required"],
    },
    contactPersion:{
        type: String,
        required: [true, "Contact Persion is required"],
    },
    website:{
        type: String,
        required: [true, "Website is required"],
    },
    address:{
        type: String,
        required: [true, "Address is required"],
    },
    state:{
        type: String,
        //required: [true, "State is required"],
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "states",
        // required: [true, "Location is required"],
    },
    state_name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "states",
        required: [true, "State is required"],
    },
    city:{
        type: String,
       // required: [true, "City is required"],
    },
    city_name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        required: [true, "City is required"],
    },
    pin:{
        type: String,
        required: [true, "Pin is required"],
    },
    status: {
        type: Boolean,
        default: true
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
}, {timestamps: true});


organizationSchema.pre('save', async function(next) {
    try {
        this.uniqueId = 'ORG' + Date.now();
        next();
    } catch (error) {
        return next(error);
    }
});

organizationSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

const Organization = new mongoose.model("organizations", organizationSchema);

module.exports = Organization;
