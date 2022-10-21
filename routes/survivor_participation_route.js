require("dotenv").config();
const express = require("express");
const SurvivorParticipation = require("../models/survivor_participation");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorParticipationRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const errorLogger = errorLoggerModule();
/**
 * This method is to find all SurvivorParticipation
 */

 SurvivorParticipationRoute.get("/list/:SurvivorProfileId", async (req, res) => {
    try {
        let SurvivorParticipationData = await SurvivorParticipation.find({$and:[{survivor: req.params.SurvivorProfileId},{is_deleted:false}]}).populate([
			{
				path: "meeting_by",
				select: "fname lname email"
			}
		]).sort({_id: -1});

        const message = {
            error: false,
            message: "All Survivor participation list",
            data: SurvivorParticipationData,
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorParticipationData, 
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
 * This method is to create SurvivorParticipation
 */


 SurvivorParticipationRoute.post("/create", async (req, res) => {
	try {
		const SurvivorParticipationData = new SurvivorParticipation(req.body);
		const result = await SurvivorParticipationData.save();
		message = {
			error: false,
			message: "Survivor's Participation Added Successfully!",
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
			message: "Survivor's Participation Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update SurvivorParticipation
 */

 SurvivorParticipationRoute.patch("/update/:SurvivorParticipationId", async (req, res) => {
	try {
		const SurvivorParticipationData = await SurvivorParticipation.find({$and:[
			{ _id: req.params.SurvivorParticipationId},{is_deleted:false}
		]})
		const result = await SurvivorParticipation.findOneAndUpdate({ _id: req.params.SurvivorParticipationId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorParticipations",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorParticipationData),
                    description: "SURVIVOR PARTICIPATION data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "participation",
                    note: "Change log genearted for participation"
                });
            }
			message = {
				error: false,
				message: "Survivor's Participation updated successfully!",
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
				message: "Survivor's Participation not updated",
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
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		res.status(200).send(message);
	}
});

/**
 * This method is to delete SurvivorParticipation
 */

//  SurvivorParticipationRoute.delete("/delete/:SurvivorParticipationId", async (req, res) => {
// 	try {
// 		const result = await  SurvivorParticipation.deleteOne({ _id: req.params.SurvivorParticipationId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "SurvivorParticipation deleted successfully!",
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


 SurvivorParticipationRoute.patch("/delete/:SurvivorParticipationId", async (req, res) => {
	try {
		const SurvivorParticipationData = await SurvivorParticipation.find({$and:[
			{ _id: req.params.SurvivorParticipationId},{is_deleted:false}
		]})
		const result = await  SurvivorParticipation.findOneAndUpdate({ _id: req.params.SurvivorParticipationId },
			{is_deleted: true, deleted_at: Date.now(),deleted_by:req.body.deleted_by,deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorParticipations",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorParticipationData),
                    description: "SURVIVOR PARTICIPATION data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "participation",
                    note: "Change log genearted for survivor participation"
                });
            }
			message = {
				error: false,
				message: "Survivor's Participation deleted successfully!",
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

module.exports = SurvivorParticipationRoute;