const mongoose = require("mongoose");
const SurvivortraffickerProfileSchema = new mongoose.Schema({
    trafficker: [
        {
            trafficker_details:[
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "traffickerProfiles"
                }
            ],
            location:{
                type: String,
                enum: {
                    values: ["sa", "da","transit"]
                }
            },
        }
    ],
    survivor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "survivorProfiles",
    },
    social_worker:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    is_deleted: {
        type: Boolean,
        default:false
    },
    deleted_at:{
        type:Date,
    }
        
    
}, {timestamps: true});

const SurvivorTraffickerProfile = new mongoose.model("survivortraffickerProfiles", SurvivortraffickerProfileSchema);

module.exports = SurvivorTraffickerProfile;