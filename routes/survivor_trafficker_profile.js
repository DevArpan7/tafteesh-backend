require("dotenv").config();
const express = require("express");
const generateChangelog = require("../helper/generateChangeLog");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const errorLogger = errorLoggerModule();
const SrvTraffickerProfile = require("../models/survivor_trafficker");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorChargeSheet = require("../models/survivor_chargesheet");
const TraffickerProfile = require("../models/trafficker_profile_v2");
const isAuthenticate = require("../middleware/authcheck");
const SrvTraffickerProfileRoute = express.Router();

/**
 * This method is to find all Trafficker Profiles
 */
SrvTraffickerProfileRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let SrvTraffickerProfileData;
        
        if (req.params.socialWorker) {
            SrvTraffickerProfileData = await SrvTraffickerProfile.find({
                $and: [
                    {is_deleted: false},
                    {social_worker: req.params.socialWorker}
                ]
            }).populate([
				{
					path:"trafficker.trafficker_details",
					select:"trafficker_name residential_address"
				},
				{
					path:"social_worker",
					select:"fname lname"
				},
				{
					path:"survivor",
					select:"survivor_name"
				},
			]).sort({_id: -1});
        } else {
            SrvTraffickerProfileData = await SrvTraffickerProfile.find({is_deleted:false}).populate([
				{
					path:"trafficker.trafficker_details",
					select:"trafficker_name residential_address"
				},
				{
					path:"social_worker",
					select:"fname lname"
				},
				{
					path:"survivor",
					select:"survivor_name"
				},
			]).sort({_id: -1});
        }

        message = {
            error: false,
            message: "All Trafficker Profile list",
            data: SrvTraffickerProfileData,
        };
		infoLogger.info({
			req: req.params, 
			res: SrvTraffickerProfileData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * survival trafficker list by survivorProfileId
 */

SrvTraffickerProfileRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
		
        let SrvTraffickerProfileData  = await SrvTraffickerProfile.findOne({$and: [{survivor: req.params.SurvivorProfileId}]}).populate([
			{
				path:"trafficker.trafficker_details",
				select:"trafficker_name residential_address"
			},
			{
				path:"social_worker",
				select:"fname lname"
			},
			{
				path:"survivor",
				select:"survivor_name"
			},
		]);
		// .findOne({$and:[
		// 	{survivor: req.params.SurvivorProfileId}
		// ]}).populate([
		// 	{
		// 		path:"trafficker.trafficker_details",
		// 		select:"trafficker_name residential_address"
		// 	},
		// 	{
		// 		path:"social_worker",
		// 		select:"fname lname"
		// 	},
		// 	{
		// 		path:"survivor",
		// 		select:"survivor_name"
		// 	},
		// ]).sort({_id:-1});

		let traffickerData = await TraffickerProfile.find({is_deleted:false}).sort({_id:-1})

		const message = {
			error: false,
			message: "All Survivor Trafficker list",
			data: SrvTraffickerProfileData,
			mastertraffickerData: traffickerData
		};
		infoLogger.info({
			req: req.params, 
			res: SrvTraffickerProfileData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
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
SrvTraffickerProfileRoute.get("/detail/:SrvtraffickerProfileId", async (req, res) => {
    try {
        let SrvTraffickerProfileData = await SrvTraffickerProfile.findOne({_id: req.params.SrvtraffickerProfileId}).populate([
			{
				path:"trafficker.trafficker_details",
				select:"trafficker_name residential_address"
			},
			{
				path:"social_worker",
				select:"fname lname"
			},
			{
				path:"survivor",
				select:"survivor_name"
			},
		]);
	
        message = {
            error: false,
            message: "Trafficker Profile detail",
            data: SrvTraffickerProfileData,
        };
		infoLogger.info({
			req: req.params, 
			res: SrvTraffickerProfileData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});



/**
 * This method is to fetch Trafficker Action List
 */
 SrvTraffickerProfileRoute.get("/action-list/:TraffickerId", isAuthenticate, async (req, res) => {
    try {

		let survivorList = await SrvTraffickerProfile.find({
			"trafficker.trafficker_details": req.params.TraffickerId
		}).populate([
			{
				path: "trafficker.trafficker_details",
				select: "trafficker_name residential_address"
			},
			{
				path:"social_worker",
				select:"fname lname",
				populate:{
					path:"organization",
					select:"name",
				},
			},
			{
				path:"survivor",
				select:"survivor_name"
			}
		]);
		
		let traffickerImages = await TraffickerProfile.findOne({
			_id: req.params.TraffickerId
		}).select("image");
		
		let traffickerChargesheet = await SurvivorChargeSheet.find({
			$or: [
				{"accused_included.name": req.params.TraffickerId},
				{"accused_not_included.name": req.params.TraffickerId}
			]
		}).populate([
			{
				path: "accused_included.name",
				select: "trafficker_name residential_address"
			},
			{
				path: "accused_not_included.name",
				select: "trafficker_name residential_address"
			}
		]);

		let traffickerFir = await SurvivorFir.find({
			$or: [
				{"accused.name": req.params.TraffickerId}
			]
		}).populate([
			{
				path: "accused.name",
				select: "trafficker_name residential_address"
			}
		]);

        message = {
            error: false,
            message: "Trafficker Profile detail",
            survivorList, 
			traffickerImages, 
			traffickerChargesheet, 
			traffickerFir
        };
		// infoLogger.info({
		// 	req: req.params, 
		// 	res: {survivorList, traffickerImages, traffickerChargesheet, traffickerFir}, 
		// 	method:"GET", 
		// 	url: req.originalUrl, 
		// 	error: false
		// });
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
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
SrvTraffickerProfileRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		let survivorTraffickers = [{
			trafficker_details: req.body.traffickers,
			location: req.body.location
		}];
		
		// return res.status(200).send(survivorTraffickers);
		const SrvTraffickerProfileDataExist = await SrvTraffickerProfile.findOne({ survivor: req.body.survivor })

		if (SrvTraffickerProfileDataExist) {
			let existingTrfckr = SrvTraffickerProfileDataExist.trafficker.filter(e => e.location == req.body.location);
			if (existingTrfckr[0]?.trafficker_details.length) {

				console.log("survivorTraffickers[0].trafficker_details",survivorTraffickers[0].trafficker_details);
				existingTrfckr[0]?.trafficker_details.forEach(element => {
					if (!survivorTraffickers[0].trafficker_details.includes(String(element))) {				
						console.log(String(element), "not includes");
						
						survivorTraffickers[0].trafficker_details.push(element)
					}
				});
				let SrvTraffickerProfileData = await SrvTraffickerProfile.findOneAndUpdate(
					{ survivor: req.body.survivor }, 
					{
						$pull: {"trafficker": {"location": req.body.location}}
					},
					{
						new: true
					}
				);
				// if (req.body.user) {
				// 	let changeLogData = await generateChangelog({
				// 		targeted_data: SrvTraffickerProfileData?._id,
				// 		targeted_data_ref: "survivortraffickerProfiles",
				// 		survivor: req.body.survivor,
				// 		old_data: JSON.stringify(SrvTraffickerProfileData),
				// 		description: "Trafficker data added",
				// 		new_data: JSON.stringify(SrvTraffickerProfileDataExist),
				// 		status: false,
				// 		changed_by: req.body.user,
				// 		changed_by_ref: "users",
				// 		module: "trafficker",
				// 		note: "Change log genearted for trafficker"
				// 	});
				// }
			}
		}
		
		// return res.status(200).send("survivorTraffickers");

		const SrvTraffickerProfileData = await SrvTraffickerProfile.findOneAndUpdate(
			{ survivor: req.body.survivor }, 
			{
				$push: {trafficker: survivorTraffickers},
				survivor: req.body.survivor,
				social_worker: req.body.user
			},
			{
				upsert: true,
				new: true
			}
		);

		if (req.body.user && SrvTraffickerProfileDataExist) {
			let changeLogData = await generateChangelog({
				targeted_data: SrvTraffickerProfileData?._id,
				targeted_data_ref: "survivortraffickerProfiles",
				survivor: req.body.survivor,
				old_data: JSON.stringify(SrvTraffickerProfileDataExist),
				description: "Trafficker data added",
				new_data: JSON.stringify(SrvTraffickerProfileData),
				status: false,
				changed_by: req.body.user,
				changed_by_ref: "users",
				module: "trafficker",
				note: "Change log genearted for trafficker"
			});
		}

		message = {
			error: false,
			message: "Trafficker Profile Added Successfully!",
			data: SrvTraffickerProfileData,
		};
		infoLogger.info({
			req: req.params, 
			res: SrvTraffickerProfileData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
		return res.status(200).send(message);
	} catch (err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Trafficker Profile not added!",
			data: err,
		};
		return res.status(200).send(message);
	}
});


SrvTraffickerProfileRoute.patch("/delete-trafficker/:id", isAuthenticate, async (req, res) => {
	try {
		let survivorTraffickers = [{
			trafficker_details: req.body.traffickers,
			location: req.body.location
		}];
		let SrvTraffickerProfileData = await SrvTraffickerProfile.findOneAndUpdate(
			{ _id: req.params.id }, 
			{
				$pull: {"trafficker": {"location": req.body.location}}
			},
			{
				new: true
			}
		);
		if (SrvTraffickerProfileData) {
			const oldData = SrvTraffickerProfileData;
			SrvTraffickerProfileData = await SrvTraffickerProfile.findOneAndUpdate(
				{ _id: req.params.id }, 
				{
					$push: {trafficker: survivorTraffickers},
				},
				{
					new: true
				}
			);

			if (SrvTraffickerProfileData.social_worker) {
				let changeLogData = await generateChangelog({
					targeted_data: SrvTraffickerProfileData?._id,
					targeted_data_ref: "survivortraffickerProfiles",
					survivor: req.body.survivor,
					old_data: JSON.stringify(oldData),
					description: "Trafficker data added",
					new_data: JSON.stringify(SrvTraffickerProfileData),
					status: false,
					changed_by: SrvTraffickerProfileData.social_worker,
					changed_by_ref: "users",
					module: "trafficker",
					note: "Change log genearted for trafficker"
				});
			}
		}

		const delModuleName = (req.body.location.length > 2) ? req.body.location.charAt(0).toUpperCase() + req.body.location.slice(1) : req.body.location.toUpperCase();

		message = {
			error: false,
			message: "Trafficker deleted from " + delModuleName + " Successfully!",
			data: SrvTraffickerProfileData,
		};
		infoLogger.info({
			req: req.body, 
			res: SrvTraffickerProfileData, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: false
		});
		return res.status(200).send(message);
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: String(err), 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Trafficker not removed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
})

/**
 * This method is to update Trafficker Profile status
 * @param str SrvTraffickerProfileId
 */
SrvTraffickerProfileRoute.patch("/toggle-status/:SrvTraffickerProfileId", isAuthenticate, async (req, res) => {
	try {
		const result = await SrvTraffickerProfile.findOneAndUpdate({ _id: req.params.SrvTraffickerProfileId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Trafficker Profile status updated successfully!",
			};
			infoLogger.info({
				req: req.body, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Status not updated",
			};
			errorLogger.error({ message: "Survivor trafficker error"});
			res.status(200).send(message);
		}
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
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
 * @param str SrvTraffickerProfileId
 */
SrvTraffickerProfileRoute.patch("/update/:SrvTraffickerProfileId", isAuthenticate, async (req, res) => {
	try {
		const SrvTraffickerProfileData = await SrvTraffickerProfile.find({$and:[
			{ _id: req.params.SurvivorRescueId},{is_deleted:false}
		]})
		const result = await SrvTraffickerProfile.findOneAndUpdate({ _id: req.params.SrvTraffickerProfileId }, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivortraffickerProfiles",
					survivor: result.survivor,
                    old_data: JSON.stringify(SrvTraffickerProfileData),
                    description: "Trafficker data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "trafficker",
                    note: "Change log genearted for trafficker"
                });
            }
			message = {
				error: false,
				message: "Trafficker Profile updated successfully!",
				result
			};
			infoLogger.info({
				req: req.body, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Trafficker Profile not updated",
			};
			errorLogger.error({
				req: req.body, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
			res.status(200).send(message);
		}
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete Trafficker Profile
 * @param str SrvTraffickerProfileId
 */
SrvTraffickerProfileRoute.delete("/delete/:SrvTraffickerProfileId", isAuthenticate, isAuthenticate, async (req, res) => {
	try {
		const result = await SrvTraffickerProfile.deleteOne({ _id: req.params.SrvTraffickerProfileId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Trafficker Profile deleted successfully!",
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
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});



SrvTraffickerProfileRoute.patch("/delete/:SrvTraffickerProfileId", async (req, res) => {
	try {
		const SrvTraffickerProfileData = await SrvTraffickerProfile.find({$and:[
			{ _id: req.params.SurvivorRescueId},{is_deleted:false}
		]})
		const result = await SrvTraffickerProfile.findOneAndUpdate({ _id: req.params.SrvTraffickerProfileId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivortraffickerProfiles",
					survivor: result.survivor,
                    old_data: JSON.stringify(SrvTraffickerProfileData),
                    description: "Trafficker data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "trafficker",
                    note: "Change log genearted for trafficker"
                });
            }
			message = {
				error: false,
				message: "Trafficker Profile deleted successfully!",
				result
			};
			infoLogger.info({
				req: req.params, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Operation failed!",
			};
			errorLogger.error({
				req: req.params, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
			res.status(200).send(message);
		}
	} catch (err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});


/**
 *  This method is to search Trafficker_profile
 */

 SrvTraffickerProfileRoute.post("/search", isAuthenticate, isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await SrvTraffickerProfile.find({"trafficker":searchText})
	
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
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});


module.exports = SrvTraffickerProfileRoute;