require("dotenv").config();
const express = require("express");
const moment = require("moment");
const SurvivorRescue = require("../models/survivor_rescue");
const generateChangelog = require("../helper/generateChangeLog");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const sendNotification = require("../helper/sendNotification");
const PendingAction = require("../models/pending_action");
const isAuthenticate = require("../middleware/authcheck");
const State = require("../models/state");
const errorLogger = errorLoggerModule();
const SurvivorRescueRoute = express.Router();

const SurvivorProfile = require("../models/survivor_profile");
const { log } = require("winston");

/**
 * This method is to find all SurvivorRescues
 * * @param str SurvivorProfileId
 */
SurvivorRescueRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
		
        let SurvivorRescueData = await SurvivorRescue.find({$and:[
			{survivor: req.params.SurvivorProfileId},{is_deleted:false}
		]}).populate([
			{
				path: "rescue_from_state",
				select: "name"
			}
		]).sort({_id:-1});

	
		let customRescuseData = JSON.parse(JSON.stringify(SurvivorRescueData))

		customRescuseData.map(e => {
			e.state = e?.rescue_from_state?.name
			e.rescue_date =  moment(e?.date_of_rescue.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})
		let stateData = await State.find({is_deleted:false}).sort({_id: -1});
		
		const message = {
			error: false,
			message: "All Survivor Profile Rescue list",
			data: customRescuseData,
			masterStateData:stateData
		};
		infoLogger.info({
			req: req.params, 
			res: SurvivorRescueData, 
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
 * This method is to fetch Rescue Profile detail
 *  @param str SurvivorRescueId
 */

 SurvivorRescueRoute.get("/detail/:SurvivorRescueId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorRescueData = await SurvivorRescue.findOne({_id: req.params.SurvivorRescueId}).populate([
			{
				path: "rescue_from_state",
				select: "name"
			}
		]);

        message = {
            error: false,
            message: "Rescue Profile detail",
            data: SurvivorRescueData,
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorRescueData, 
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
 * This method is to create SurvivorRescue
 * * @param str SurvivorProfileId
 */
SurvivorRescueRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorRescueData = new SurvivorRescue(req.body);
		let survivorId = SurvivorRescueData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		console.log(survivorData?.date_of_trafficking);
		console.log(SurvivorRescueData?.date_of_rescue);
		if (SurvivorRescueData?.date_of_rescue <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "Date of rescue should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		let result = await SurvivorRescueData.save();
		result = await SurvivorRescueData.populate([
			{
				path: "survivor",
				select: "organization user_id survivor_id survivor_name"
			}
		]);
		if (result?.survivor?.user_id) {
			let sendNotificationData = await sendNotification({
				user: result?.survivor?.user_id,
				title: "Survivor Profile Rescue Added",
				description: "Rescue record for "+ result?.survivor?.survivor_id +" added successfully ,add FIR ASAP"
			});
			let checkPendingActionData = await PendingAction.findOneAndUpdate({$and: [{ survivor: result?.survivor?._id }, { module: 'rescue' }]}, {isCompleted: true});
		}

		message = {
			error: false,
			message: "Survivor Rescue Added Successfully!",
			data: result,
		};
		infoLogger.info({
			req: req.body, 
			res: result, 
			method:"POST", 
			url: req.originalUrl, 
			error: false
		});
		return res.status(200).send(message);
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: err, 
			method:"POST", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: String(err),
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update SurvivorRescue status
 * @param str SurvivorRescueId
 */
SurvivorRescueRoute.patch("/toggle-status/:SurvivorProfileId", isAuthenticate, async (req, res) => {
	try {
		const result = await SurvivorRescue.findOneAndUpdate({ survivor: req.params.SurvivorProfileId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "SurvivorRescue status updated successfully!",
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
				message: "Status not updated",
			};
			errorLogger.error({ message: "Survivor rescue error"});
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
 * This method is to update SurvivorRescue
 * @param str SurvivorProfileId
 */
SurvivorRescueRoute.patch("/update/:SurvivorRescueId", isAuthenticate, async (req, res) => {
	try {
		const CheckSurvivorRescueData = await SurvivorRescue.findOne({$and:[
			{ _id: req.params.SurvivorRescueId},{is_deleted:false}
		]})
		if (!CheckSurvivorRescueData) return res.status(200).send({error: true, message: "Survivor rescue not found"}) 
		let survivorId = CheckSurvivorRescueData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		/**
		 * checking date of rescue greater than trafficking date or not
		 */
		if (req.body.date_of_rescue && (new Date(req.body.date_of_rescue) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Date of rescue should be after date of trafficking"})
			
		const SurvivorRescueData = await SurvivorRescue.find({$and:[
			{ _id: req.params.SurvivorRescueId},{is_deleted:false}
		]});
	   const result = await SurvivorRescue.findOneAndUpdate({ _id: req.params.SurvivorRescueId }, req.body, {new: true});
		if (result) {
		
            // let checkPendingActionData = await PendingAction.findOneAndUpdate({$and: [{ survivor: result?.survivor }, { module: 'rescue' }]}, {isCompleted: true});

			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorRescues",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorRescueData),
                    description: "RESCUE data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "rescue",
                    note: "Change log genearted for rescue"
                });
            }
			message = {
				error: false,
				message: "Survivor Rescue updated successfully!",
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
				message: "Survivor Rescue not updated",
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
			res: String(err), 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete SurvivorRescue
 * @param str SurvivorRescueId
 */
// SurvivorRescueRoute.delete("/delete/:SurvivorRescueId", async (req, res) => {
// 	try {
// 		const result = await SurvivorRescue.deleteOne({ _id: req.params.SurvivorRescueId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "SurvivorRescue deleted successfully!",
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

/**
 * This method is to delete SurvivorRescue
 * @param str SurvivorProfileId
 */
 SurvivorRescueRoute.patch("/delete/:SurvivorRescueId", async (req, res) => {
	try {
		const SurvivorRescueData = await SurvivorRescue.find({$and:[
			{ _id: req.params.SurvivorRescueId},{is_deleted:false}
		]})
		const result = await SurvivorRescue.findOneAndUpdate({_id:req.params.SurvivorRescueId},{is_deleted: true, deleted_at: Date.now(),deleted_by:req.body.deleted_by,deleted_by_ref:req.body.deleted_by_ref},{new:true});
		
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorRescues",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorRescueData),
                    description: "RESCUE data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "rescue",
                    note: "Change log genearted for rescue"
                });
            }
			message = {
				error: false,
				message: "Survivor Rescue delete successfully!",
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
				message: "Survivor Rescue not updated",
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

module.exports = SurvivorRescueRoute;