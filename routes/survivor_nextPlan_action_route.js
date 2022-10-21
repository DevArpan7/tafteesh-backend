require("dotenv").config();
const express = require("express");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorNextplanAction = require("../models/survivor_nextPlan_action");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const SurvivorNextplanActionRoute = express.Router();

/**
 * This method is to find all SurvivorNextplanAction
 * @param str SurvivorProfileId
 * 
 */

 SurvivorNextplanActionRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorNextplanActionData = await SurvivorNextplanAction.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]})
		.sort({_id:-1});

        const message = {
            error: false,
            message: "All SurvivorNextPlanAction list",
            data:SurvivorNextplanActionData,
		};
		infoLogger.info({
			req: req.params, 
			res: SurvivorNextplanActionData, 
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
 * This method is to create all SurvivorNextPlanAction
 * @param str SurvivorProfileId
 * 
 */

 SurvivorNextplanActionRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorNextplanActionData = new  SurvivorNextplanAction(req.body);
		const result = await  SurvivorNextplanActionData.save();
		message = {
			error: false,
			message: "Survivor NextPlan Action Added Successfully!",
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
			res: String(err), 
			method:"POST", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "SurvivorNextPlanAction Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Survivor NextPlan Action
 * @param str SurvivorProfileId
 */
 SurvivorNextplanActionRoute.patch("/update/:SurvivornextplanactionId", isAuthenticate, async (req, res) => {
	try {
		const SurvivorNextplanActionData = await SurvivorNextplanAction.find({$and:[
			{ _id: req.params.SurvivornextplanactionId},{is_deleted:false}
		]})
		const result = await  SurvivorNextplanAction.findOneAndUpdate({ _id: req.params.SurvivornextplanactionId }, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "SurvivorNextplanActions",
                    old_data: JSON.stringify(SurvivorNextplanActionData),
                    description: "SURVIVOR NEXTPLAN ACTION data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "next_plan",
                    note: "Change log genearted for survivor nextplan action"
                });
            }
			message = {
				error: false,
				message: "Survivor NextPlan Action updated successfully!",
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
				message: "SurvivorNextPlanAction not updated",
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
 * This method is to delete Survivor Investigation
 * @param str SurvivornextplanactionId
 */
 SurvivorNextplanActionRoute.delete("/delete/:SurvivornextplanactionId", isAuthenticate, async (req, res) => {
	try {
		
		const result = await SurvivorNextplanAction.deleteOne({ _id: req.params.SurvivornextplanactionId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Survivor next plan action deleted successfully!",
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

SurvivorNextplanActionRoute.patch("/delete/:SurvivornextplanactionId", isAuthenticate, async (req, res) => {
	try {
		const SurvivorNextplanActionData = await SurvivorNextplanAction.find({$and:[
			{ _id: req.params.SurvivornextplanactionId},{is_deleted:false}
		]})
		const result = await SurvivorNextplanAction.findOneAndUpdate({ _id: req.params.SurvivornextplanactionId },
			{is_deleted: true, deleted_at: Date.now(), deleted_by:req.body.deleted_by, deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "SurvivorNextplanActions",
                    old_data: JSON.stringify(SurvivorNextplanActionData),
                    description: "SURVIVOR NEXTPLAN ACTION data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "next_plan",
                    note: "Change log genearted for survivor nextplan action "
                });
            }
			message = {
				error: false,
				message: "Survivor next plan action deleted successfully!",
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

module.exports = SurvivorNextplanActionRoute;

