const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    mark_as_read: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const NotificationData = new mongoose.model("notifications",NotificationSchema);

module.exports =  NotificationData;