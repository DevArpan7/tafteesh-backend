const mongoose = require("mongoose");

const survivorProfileSchema = new mongoose.Schema({
	organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: [false, "Organization is required"]
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [false, "User is required"]
    },
    survivor_id: {
        type: String
    },
    survivor_name: {
        type: String,
        required: [false, "Survivor name is required"]
    },
    /**
     * Picture should be image url
     */
    picture: [
        {
            type: String
        }
    ],

    /**
     * Picture should be file url
     */
    consent_form: {
        type: String
    },
    /**
     * gender should be in between these three
     */
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "transgender"],
            message: '{VALUE} is not a correct gender'
        }
    },
    phone_no: {
        type: String,
        // validate(value) {
        //     if(value.length !== 10) {
        //         throw new Error("Length should be 10")
        //     }
        // }
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "states",
        required: [false, "State is required"]
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "districts",
        required: [false, "District is required"]
    },
    block: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blocks",
        required: [false, "Block is required"]
    },
    village_name: {
        type: String,
        trim: true
    },
    panchayat_name: {
        type: String,
        trim: true
    },
    police_station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "policestations",
        required: [false, "Police station is required"]
    },
    shg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shgs",
        required: [false, "SHG is required"]
    },
    collectives: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "collectives",
        required: [false, "Collectives are required"]
    },
    date_of_birth: {
        type: Date,
        trim: true,
        required: true
    },
    age_now: {
        type: Number,
    },
    date_of_trafficking: {
        type: Date,
        //validate: [dateValidator, 'Date of trafficking must be greater than Date of birth'] 
        
    },
    age_when_trafficked: {
        type: Number,
    },
    
    rescuing_police_station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "policestations",
        required: [false, "Police station is required"]
    },
    
    /**
     * Choose between single/divorced/married/widowed
     */
    marital_status: {
        type: String,
        enum: {
            values: ["single", "divorced", "married", "widowed"],
            message: '{VALUE} is not a correct marital status'
        }
    },
    no_of_children: {
        type: Number,
        default: 0
    },
    status_in_tafteesh: {
        type: String,
        // enum: {
        //     values: ["active", "dropped-out", "tentative"],
        //     message: '{VALUE} is not a correct status in tafteesh'
        // } 
    },
    surv_status:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorStatus"
    },
    aadhar_card: {
        status: Boolean,
        file: String
    },
   
    //Newly added
    pincode:{
        type:Number
    },
    address_Line1:{
        type:String,
    },
    no_of_family_member:{
        type:Number,
    },
    notes_for_status_change:{
        type:String,
    },
    alternate_contact_No:{
        type: String,
        // validate(value) {
        //     if(value.length !== 10) {
        //         throw new Error("Length should be 10")
        //     }
        // }
    },
    upload_support_doc:{
        status:Boolean,
        file:String
    },
    /**
     * Highest educational qualification
     */
    educational_qualification: {
        status: Boolean,
        file: String
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    updated_by: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users"
            },
            date: {
                type: Date
            }
        }
    ],
    is_deleted: {
        type: Boolean,
        default: false
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
    },
    approval: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

survivorProfileSchema.pre('save', async function(next) {
    try {
        this.survivor_id = 'SURV' + Date.now();
        next();
    } catch (error) {
        return next(error);
    }
});

// function dateValidator(value) {
//     return this.date_of_birth <= value;
//   }


const SurvivorProfile = new mongoose.model("survivorProfiles", survivorProfileSchema);

module.exports = SurvivorProfile;
