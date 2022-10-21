const mongoose = require('mongoose');

const pendingActionSchema = new mongoose.Schema({
    survivor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    module: {
        type: String,
        enum: {
            values: ["fir", "rescue", "cit"]
        }
    },
    description: {
        type: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

const PendingAction = new mongoose.model("pendingActions",pendingActionSchema);

module.exports = PendingAction;