const mongoose = require("mongoose");
const bycrpt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    userNo: {
        type: String
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: [true,  "Organization is required"]
    },
    shg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shgs",
    },
    collective: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "collectives",
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "roles",
        required: [true, "User need to be assigned to a role"]
    },
	fname:{
        type: String,
        trim: true,
        required: [true, "First name is required"],
        minlength: [2, "First name minimum contains 2 letters"],
    },
	lname:{
        type: String,
        trim: true,
        required: [true, "Last name is required"],
        minlength: [2, "Last name minimum contains 2 letters"],
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
    dob: {
        type: Date,
    },
    image: {
        type: String
    },
    email:{
        type: String,
        trim: true,
        required: [true, "Email is required"],
        validate(value) {
            const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z-.]+$/g
            if(!pattern.test(value)) {
                throw new Error("Wrong email format.")
            }
        }
    },
    mobile:{
        type: String,
        required: [true, "Mobile no. is required"],
        trim: true,
        validate(value) {
            if(value.length !== 10) {
                throw new Error("mobile no should be a 10 digit number")
            }
        }
    },
    alternative_ph_no:{
        type: String,
        trim: true,
        validate(value) {
            if(value.length !== 10) {
                throw new Error("mobile no should be a 10 digit number")
            }
        }
    },
    username:{
        type: String,
        minlength: [2, "Username minimum contains 2 letters"],
        trim: true,
    },
    password: {
		type: String,
        trim: true,
        minlength: [6, "Password minimum contains 6 characters"],
		required: false,
	},
    emailOtp: {
        type: Number,
        default: 1234
    },
    mobileOtp: {
        type: Number,
        default: 1234
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        minlength: [2, "Username minimum contains 2 letters"],
    },
    block: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blocks"
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "districts"
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "states"
    },
    city: {
        type: String,
        minlength: [2, "Username minimum contains 2 letters"],
    },
    pin: {
        type: String,
        minlength: [6, "Pin minimum contains 6 characters"],
    },
    status: {
        type: Boolean,
        default: true
    },
    reporting_to: {
        type: String
    },
    remember_me:{
        type:Boolean,
        default:false
    },
    last_login_time:{
        type:Date
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    },
    terms_and_conditions: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

userSchema.pre("save", async function(next) {
	if(this.isModified("password")) {
		this.password = await bycrpt.hash(this.password, 10);
		this.confirmPassword = undefined;
	}
    this.userNo = "USER" + Date.now();
    this.username = this.userNo;
	next();
})

userSchema.pre("updateOne", async function(next) {
	try {
        this.options.runValidators = true;
		if(this._update.password) {
			this._update.password = await bycrpt.hash(this._update.password, 10);
		}
		next();
	} catch (err) {
		return next(err);
	}
})

userSchema.pre("findOneAndUpdate", async function(next) {
	try {
        this.options.runValidators = true;
		if(this._update.password) {
			this._update.password = await bycrpt.hash(this._update.password, 10);
		}
		next();
	} catch (err) {
		return next(err);
	}
})


const User = new mongoose.model("users", userSchema);

module.exports = User;