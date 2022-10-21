const mongoose = require("mongoose");

const cITSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    assessment_date: {
        type: Date,
        required: [true, "Assesment date is requireds"]
    },
    next_assesment_date: {
        type: Date,
    },
    version: {
        type: String,
    },
    cit_version: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "citVersions"
    },
    status: {
        type: String,
        // enum: {
        //     values: ["ongoing", "closed", "completed"],
        //     message: "{VALUE} is not a correct, expected ongoing,closed,completed"
        // },
        // default: "ongoing"
    },
    status_of_cit:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "citStatus"
    },
    approval: {
        type: Boolean,
        default: false
    },
    analysis_ans: {
        type: String
    },
    caregivers: {
        type: String
    },
    worry_statements: {
        type: String
    },
    goal_statements: {
        type: String
    },
    significant_observations: {
        type: String
    },
    reference_documents: {
        type: Array
    },
    overall_score: {
        type: Number,
        validate(value) {
            const overall_score = Number(value);
            if(overall_score < 0 || overall_score > 10) {
                throw new Error("overall score must be in between 0-10")
            }
        }
    },
    cit_status: {
        type: Boolean,
        default: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    deleted_at: {
        type: Date,
    },
    unique_id: {
        type: String
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

}, { timestamps: true })

// cITSchema.pre('save', async function(next) {
//     try {
//         this.unique_id = 'SURV-CIT' + Date.now();
//         next();
//     } catch (error) {
//         return next(error);
//     }
// });

cITSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

const CIT = new mongoose.model("cits", cITSchema);

module.exports = CIT;