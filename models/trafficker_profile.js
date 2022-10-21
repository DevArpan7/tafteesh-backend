// const mongoose = require("mongoose");

// const destinationSchema = new mongoose.Schema({
//     police_station_name_fir_filed: {
//         type: String
//     },
//     police_station_district_fir_filed: {
//         type: String
//     },
//     police_station_state_fir_filed: {
//         type: String
//     },
//     fir_number_destination: {
//         type: String
//     },
//     gd_number_destination: {
//         type: String
//     },
//     year_of_fir: {
//         type: Number
//     }
// })

// const sourceAreaSchema = new mongoose.Schema({
//     police_station_name_fir_filed: {
//         type: String
//     },
//     police_station_district_fir_filed: {
//         type: String
//     },
//     police_station_state_fir_filed: {
//         type: String
//     },
//     fir_number_destination: {
//         type: String
//     },
//     gd_number_destination: {
//         type: String
//     },
//     year_of_fir: {
//         type: Number
//     },
//     /**
//      * gender should be in between these "absconding/arrested/bailed/in custody/acquited/punished"
//      */
//     status_of_prosecution: {
//         type: String,
//         enum: {
//             values: ["absconding", "arrested", "bailed", "in custody", "acquited", "punished"],
//             message: '{VALUE} is not a correct status of prosecution'
//         }
//     },
//     number_of_years_in_prisonment: {
//         type: Number
//     },
//     survivor: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "survivorProfiles"
//     },
//     block_of_survivor: {
//         type: String
//     }, 
//     district_of_survivor: {
//         type: String
//     },
//     ngo_following_up: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "organizations"
//     },
//     social_worker_following_up: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "users"
//     },
//     /**
//      * gender should be in between these "yes/no/maybe"
//      */
//     repeated_offender: {
//         type: String,
//         enum: {
//             values: ["yes", "no", "maybe"],
//             message: '{VALUE} is not a correct status of prosecution'
//         }
//     },
//     other_survivor: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "survivorProfiles"
//     },
//     memo_about_trafficker: {
//         type: String
//     }
// })

// const traffickerProfileSchema = new mongoose.Schema({
//     trafficker_name: {
//         type: String,
//         required: [true, "Trafficker name is required"]
//     },
//     /**
//      * gender should be in between these "male/ female/ transgender"
//      */
//     gender: {
//         type: String,
//         enum: {
//             values: ["male", "female", "transgender"],
//             message: '{VALUE} is not a correct gender'
//         }
//     },
//     age: {
//         type: Number
//     },
//     /**
//      * gender should be in between these "parents/siblings/relatives/neighbour/friend/unknown"
//      */
//     relation_with_survivor: {
//         type: String,
//         enum: {
//             values: ["parents", "siblings", "relatives", "neighbour", "friend", "unknown"],
//             message: '{VALUE} is not a correct reationship'
//         }
//     },
//     image: {
//         type: String
//     },
//     residential_address_source: {
//         type: String
//     },
//     residential_address_destination: {
//         type: String
//     },
//     identification_mark: {
//         type: String
//     },
//     trafficked_to: {
//         type: String
//     },
//     destination: {
//         type: destinationSchema
//     },
//     sourceArea: {
//         type: sourceAreaSchema
//     },
//     survivors: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "survivorProfiles"
//         }
//     ],
//     is_deleted: {
//         type: Boolean,
//         default:false
//     },
//     deleted_at:{
//         type:Date,
//     }
    
// }, {timestamps: true});

// const TraffickerProfile = new mongoose.model("traffickerProfiles", traffickerProfileSchema);

// module.exports = TraffickerProfile;