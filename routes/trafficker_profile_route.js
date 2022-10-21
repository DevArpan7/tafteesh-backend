require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const SurvivorTraffickerProfile = require("../models/survivor_trafficker");
const TraffickerProfile = require("../models/trafficker_profile_v2");
const TraffickerProfileRoute = express.Router();
const SurvivorFir = require("../models/survivor_fir");
const SurvivorChargesheet = require("../models/survivor_chargesheet");
const SupplementaryFir = require("../models/supplementary_fir");


/**
 * This method is to find all Trafficker Profiles
 */
TraffickerProfileRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let TraffickerProfileData = await TraffickerProfile.find({is_deleted:false}).sort({_id: -1});
	
		let data = [];
		for (let index = 0; index < TraffickerProfileData.length; index++) {
			const element = JSON.stringify(TraffickerProfileData[index]);
			data.push(JSON.parse(element))
			let survivorList = await SurvivorTraffickerProfile.find({
				"trafficker.trafficker_details": JSON.parse(element)?._id
			})
			data[index].is_trafficker = false
			data[index].survivor_count = 0
			if (survivorList.length) {				
				data[index].is_trafficker = true
				data[index].survivor_count = survivorList.length 
			}
		}

        message = {
            error: false,
            message: "All Trafficker Profile list",
			data,
            // data: TraffickerProfileData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to fetch Trafficker Profile detail
 */
TraffickerProfileRoute.get("/detail/:traffickerProfileId", isAuthenticate, async (req, res) => {
    try {
        let TraffickerProfileData = await TraffickerProfile.findOne({_id: req.params.traffickerProfileId})
		// .populate([
		// 	{path: "sourceArea.survivor", select: "survivor_id survivor_name"},
		// 	{path: "sourceArea.ngo_following_up", select: "uniqueId name"},
		// 	{path: "sourceArea.social_worker_following_up", select: "userNo fname lname"},
		// 	{path: "sourceArea.other_survivor", select: "survivor_id survivor_name"}
		// ]);

        message = {
            error: false,
            message: "Trafficker Profile detail",
            data: TraffickerProfileData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to create Trafficker Profile
 */
TraffickerProfileRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkTrafficker = await TraffickerProfile.find({$and: [
			{trafficker_name: {$regex: req.body.trafficker_name, $options: 'i'}},
			{gender: req.body.gender},
			{age: req.body.age},
			{residential_address: req.body.residential_address}
		]})
		if(checkTrafficker.length) return res.status(200).send({error: true, message: "A same trafficker already exists!"})

		const TraffickerProfileData = new TraffickerProfile(req.body);
		const result = await TraffickerProfileData.save();
		message = {
			error: false,
			message: "Trafficker Profile Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Trafficker Profile Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Trafficker Profile status
 * @param str TraffickerProfileId
 */
TraffickerProfileRoute.patch("/toggle-status/:TraffickerProfileId", isAuthenticate, async (req, res) => {
	try {
		const result = await TraffickerProfile.findOneAndUpdate({ _id: req.params.TraffickerProfileId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Trafficker Profile status updated successfully!",
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Status not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to update Trafficker Profile
 * @param str TraffickerProfileId
 */
TraffickerProfileRoute.patch("/update/:TraffickerProfileId", isAuthenticate, async (req, res) => {
	try {
		const check1 = await SupplementaryFir.findOne({"accused.name": req.params.TraffickerProfileId})
		const check2 = await SurvivorChargesheet.findOne({$or: [{"accused_included.name": req.params.TraffickerProfileId}, {"accused_not_included.name": req.params.TraffickerProfileId}]})
		const check3 = await SurvivorFir.findOne({"accused.name": req.params.TraffickerProfileId})
		
		// return res.status(200).send({check1, check2, check3})
		if(check1 || check2 || check3) return res.status(200).send({error: true, message: "This trafficker exists in other module. Can not be updated!"})

		const checkTrafficker = await TraffickerProfile.find({$and: [
			{trafficker_name: {$regex: req.body.trafficker_name, $options: 'i'}},
			{gender: req.body.gender},
			{age: req.body.age},
			{residential_address: req.body.residential_address}
		]})
		if(checkTrafficker.length) return res.status(200).send({error: true, message: "A same trafficker already exists!"})

		const result = await TraffickerProfile.findOneAndUpdate({ _id: req.params.TraffickerProfileId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Trafficker Profile updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Trafficker Profile not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: String(err)
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete Trafficker Profile
 * @param str TraffickerProfileId
 */
// TraffickerProfileRoute.delete("/delete/:TraffickerProfileId", async (req, res) => {
// 	try {
// 		const result = await TraffickerProfile.deleteOne({ _id: req.params.TraffickerProfileId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Trafficker Profile deleted successfully!",
// 			};
// 			res.status(200).send(message);
// 		} else {
// 			message = {
// 				error: true,
// 				message: "Operation failed!",
// 			};
// 			res.status(200).send(message);
// 		}
// 	} catch (err) {
// 		message = {
// 			error: true,
// 			message: "Operation Failed!",
// 			data: err,
// 		};
// 		res.status(200).send(message);
// 	}
// });



TraffickerProfileRoute.patch("/delete/:TraffickerProfileId", async (req, res) => {
	try {
		const check1 = await SupplementaryFir.findOne({"accused.name": req.params.TraffickerProfileId})
		const check2 = await SurvivorChargesheet.findOne({$or: [{"accused_included.name": req.params.TraffickerProfileId}, {"accused_not_included.name": req.params.TraffickerProfileId}]})
		const check3 = await SurvivorFir.findOne({"accused.name": req.params.TraffickerProfileId})
		
		// return res.status(200).send({check1, check2, check3})
		if(check1 || check2 || check3) return res.status(200).send({error: true, message: "This trafficker exists in other module. Can not be deleted!"})


		const result = await TraffickerProfile.findOneAndUpdate({ _id: req.params.TraffickerProfileId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Trafficker Profile deleted successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Operation failed!",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: String(err)
		};
		res.status(200).send(message);
	}
});


/**
 *  This method is to search Trafficker_profile
 */

 TraffickerProfileRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await TraffickerProfile.find({
			"$or":[{"trafficker_name":{"$regex":searchText,$options: 'i' }},{"identification_mark":{"$regex":searchText,$options: 'i' }}]})
	
		if (result) {
			message = {
				error: false,
				message: "Trafficker_profile search successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Trafficker_profile search failed",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: String(err)
		};
		res.status(200).send(message);
	}
});


module.exports = TraffickerProfileRoute;