require("dotenv").config();
const express = require("express");
const generateChangelog = require("../helper/generateChangeLog");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const errorLogger = errorLoggerModule();
const SurvivorDiary = require("../models/survivor_diary");
const isAuthenticate = require("../middleware/authcheck");
const SurvivorDiaryRoute = express.Router();

/**
 * This method is to find all SurvivorDiary
 * 
 */

SurvivorDiaryRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let SurvivorDiaryData = await SurvivorDiary.find({is_deleted:false}).populate([
			{
				path:"survivor",
				select:"survivor_name gender village_name pincode address_Line1",
				populate:{
					path:"police_station district block state",
					select:"name",
				},
			},
			{
				path:"diary_status",
				select:"name"
			}
		])
		.sort({_id:-1});

        const message = {
            error: false,
            message: "All SurvivorDiary list",
            data:SurvivorDiaryData,
		};
		infoLogger.info({
			req: req.params, 
			res: SurvivorDiaryData, 
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
 * This method is to find detail SurvivorDiary
 *  @param str SurvivorDiaryId
 */

 SurvivorDiaryRoute.get("/detail/:SurvivorDiaryId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorDiaryData = await SurvivorDiary.findOne({$and:[
			{ _id: req.params.SurvivorDiaryId},{is_deleted:false}
		]}).populate([
			{
				path:"survivor",
				select:"survivor_name gender village_name pincode address_Line1",
				populate:{
					path:"police_station district block state",
					select:"name",
				},
			},
			{
				path:"diary_status",
				select:"name"
			}
		])
		.sort({_id:-1});

        const message = {
            error: false,
            message: "All SurvivorDiary list",
            data:SurvivorDiaryData,
		};
		infoLogger.info({
			req: req.params, 
			res: SurvivorDiaryData, 
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
 * This method is to find all SurvivorDiary
 * @param str SurvivorProfileId
 */
 SurvivorDiaryRoute.get("/list/:UserId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorDiaryData = await SurvivorDiary.find({$and:[{ user: req.params.UserId },{is_deleted:false}]}).populate([
			{
				path:"survivor",
				select:"survivor_name gender village_name pincode address_Line1",
				populate:{
					path:"police_station district block state",
					select:"name",
				},
			},
			{
				path:"diary_status",
				select:"name"
			}
		])
		
		.sort({_id:-1});

        const message = {
            error: false,
            message: "All SurvivorDiary list",
            data:SurvivorDiaryData,
		};
		infoLogger.info({
			req: req.params, 
			res: SurvivorDiaryData, 
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
 * This method is to create all SurvivorDiary
 * @param str SurvivorProfileId
 * 
 */

 SurvivorDiaryRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		let systemDate =  new Date();
		console.log(systemDate);
		const SurvivorDiaryData = new  SurvivorDiary(req.body);
		console.log(SurvivorDiaryData?.plan_date);
		console.log(SurvivorDiaryData?.next_followUp_date);
		if (SurvivorDiaryData?.plan_date <= systemDate) {
			message = {
				error: true,
				message: "Plan date cannot be less than system date",
			};
			return res.status(200).send(message);
		}
		if (SurvivorDiaryData?.plan_date >= SurvivorDiaryData?.next_followUp_date) {
			message = {
				error: true,
				message: "plan date cannot be greater than next followup date",
			};
			return res.status(200).send(message);
		}
		const result = await SurvivorDiaryData.save();
		message = {
			error: false,
			message: "Survivor Diary Added Successfully!",
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
			message: "Survivor Diary Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update SurvivorDiary
 * @param str SurvivorProfileId
 */
 SurvivorDiaryRoute.patch("/update/:SurvivorDiaryId", isAuthenticate, async (req, res) => {
	try {
		const SurvivorDiaryData = await SurvivorDiary.find({$and:[
			{ _id: req.params.SurvivorDiaryId},{is_deleted:false}
		]})
		const result = await SurvivorDiary.findOneAndUpdate({ _id: req.params.SurvivorDiaryId }, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorDiary",
                    old_data: JSON.stringify(SurvivorDiaryData),
                    description: "SURVIVOR Diary data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "diary",
                    note: "Change log genearted for survivor diary"
                });
            }
			message = {
				error: false,
				message: "Survivor Diary updated successfully!",
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
				message: "SurvivorDiary not updated",
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
 * This method is to delete Survivor Diary
 * @param str SurvivorDiaryId
 */
 SurvivorDiaryRoute.delete("/delete/:SurvivorDiaryId", isAuthenticate, async (req, res) => {
	try {
		
		const result = await SurvivorDiary.deleteOne({ _id: req.params.SurvivorDiaryId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Survivor diary deleted successfully!",
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

SurvivorDiaryRoute.patch("/delete/:SurvivorDiaryId", async (req, res) => {
	try {
		const SurvivorDiaryData = await SurvivorDiary.find({$and:[
			{ _id: req.params.SurvivorDiaryId},{is_deleted:false}
		]})
		const result = await SurvivorDiary.findOneAndUpdate({ _id: req.params.SurvivorDiaryId },
			{is_deleted: true, deleted_at: Date.now(), deleted_by:req.body.deleted_by, deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorDiary",
                    old_data: JSON.stringify(SurvivorDiaryData),
                    description: "Survivor Diary data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "diary",
                    note: "Change log genearted for survivor diary "
                });
            }
			message = {
				error: false,
				message: "Survivor diary deleted successfully!",
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

module.exports = SurvivorDiaryRoute;

