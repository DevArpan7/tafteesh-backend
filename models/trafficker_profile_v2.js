const mongoose = require("mongoose");
const traffickerProfileSchema = new mongoose.Schema({
    trafficker_name: {
        type: String,
        required: [true, "Trafficker name is required"]
    },
    /**
     * gender should be in between these "male/ female/ transgender"
     */
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "transgender"],
            message: '{VALUE} is not a correct gender'
        }
    },
    // is_trafficker: {
    //     type: Boolean,
    //     default: true
    // },
    age: {
        type: Number,
        validate(value) {
            const age = Number(value);
            if(age < 10 || age > 130) {
                throw new Error("Age should be in between 10-130")
            }
        }
    },
    residential_address: {
        type: String
    },
    identification_mark: {
        type: String
    },
    image: [
        {
            type:String,
        }
    ],
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
    
}, {timestamps: true});

traffickerProfileSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

const TraffickerProfile = new mongoose.model("traffickerProfiles", traffickerProfileSchema);


module.exports = TraffickerProfile;