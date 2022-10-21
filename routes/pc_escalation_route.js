require("dotenv").config();
const express = require("express");
const generateChangelog = require("../helper/generateChangeLog");
const PcEscalation = require("../models/pc_escalation");
const PcEscalationRoute = express.Router();

const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const SurvivorPc = require("../models/survivor_pc");

/**
 * This method is to find all PcEscalation
 */

 PcEscalationRoute.get("/list/:SurvivorPcId", isAuthenticate, async (req, res) => {
    try {
        let PcEscalationData = await PcEscalation.find({$and:[{ survivor_pc: req.params.SurvivorPcId },{is_deleted:false}]}).populate([
			{
				path: "current_status",
				select:"name"
			},
			{
				path: "escalted_type",
				select: "name"
			},
			{
				path: "document_type",
				select: "name"
			},
			{
				path: "escalation_reason",
				select: "name"
			},
			{
				path: "esc_result",
				select: "name"
			},

		]).sort({_id:-1});

        message = {
            error: false,
            message: "All PC Escalation list",
            data: PcEscalationData,
        };
		infoLogger.info({
			req: req.params, 
			res: PcEscalationData, 
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
            data: String(err),
        };
        res.status(200).send(message);
    }
});



/**
 * This method is to find detail PcEscalation
 * @param str PcescalationId
 */

 PcEscalationRoute.get("/detail/:PcescalationId", isAuthenticate, async (req, res) => {
    try {
        let PcEscalationData = await PcEscalation.findOne({$and:[{ _id: req.params.PcescalationId },{is_deleted:false}]}).populate([
			{
				path: "current_status",
				select:"name"
			},
			{
				path: "escalted_type",
				select: "name"
			},
			{
				path: "document_type",
				select: "name"
			},
			{
				path: "escalation_reason",
				select: "name"
			},
			{
				path: "esc_result",
				select: "name"
			},

		]).sort({_id:-1});

        message = {
            error: false,
            message: "Detail PC Escalation list",
            data: PcEscalationData,
        };
		infoLogger.info({
			req: req.params, 
			res: PcEscalationData, 
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
 * This method is to create PcEscalation
 */


 PcEscalationRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const PcEscalationData = new PcEscalation(req.body);
		let survivorPcId = PcEscalationData?.survivor_pc
		console.log(survivorPcId);
		// let survivorPcData = await SurvivorPc.findOne({_id: {$in: survivorPcId}});
		// console.log(survivorPcData?.started_date);
		console.log(PcEscalationData?.pc_started_date);
		console.log(PcEscalationData?.date_of_escalation);
		console.log(PcEscalationData?.date_of_file);
		if (PcEscalationData?.date_of_escalation <= PcEscalationData?.pc_started_date) {
			message = {
				error: true,
				message: "Date of escalation should be after PC started date",
			};
			return res.status(200).send(message);
		}
		
		if (PcEscalationData?.date_of_file <= PcEscalationData?.pc_started_date) {
			message = {
				error: true,
				message: "Date of file should be after PC started date",
			};
			return res.status(200).send(message);
		}
		const result = await PcEscalationData.save();
		message = {
			error: false,
			message: "PC Escalation Added Successfully!",
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
			message: "PC Escalation Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update pcEscalation
 */

 PcEscalationRoute.patch("/update/:PcescalationId", isAuthenticate, async (req, res) => {
	try {
		const CheckSurvivorPcEscalationData = await PcEscalation.findOne({$and:[
			{ _id: req.params.PcescalationId},{is_deleted:false}
		]})
		if (!CheckSurvivorPcEscalationData) return res.status(200).send({error: true, message: "Survivor pc escalation not found"}) 
		let survivorPcId = CheckSurvivorPcEscalationData?.survivor_pc
		console.log(survivorPcId);
		let survivorPcData = await SurvivorPc.findOne({_id: {$in: survivorPcId}});

		/**
		 * checking form date of escalation greater than pc started date or not
		 */
		 if (req.body.date_of_escalation && (new Date(req.body.date_of_escalation) <= new Date(CheckSurvivorPcEscalationData?.pc_started_date))) return res.status(200).send({ error: true, message: "Date of escalation should be after PC started date"})

		 
		/**
		 * checking form date of file greater than pc started date or not
		 */
		 if (req.body.date_of_file && (new Date(req.body.date_of_file) <= new Date(CheckSurvivorPcEscalationData?.pc_started_date))) return res.status(200).send({ error: true, message: "Date of file should be after PC started date"})


		const PcEscalationData = await PcEscalation.find({$and:[
			{ _id: req.params.PcescalationId},{is_deleted:false}
		]})
		const result = await PcEscalation.findOneAndUpdate({ _id: req.params.PcescalationId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorPcEscalations",
                    old_data: JSON.stringify(PcEscalationData),
                    description: "Survivor Pc escalation data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "pcescalation",
                    note: "Change log genearted for Survivor PC escalation"
                });
            }
			message = {
				error: false,
				message: "PC Escalation updated successfully!",
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
				message: "PC Escalation not updated",
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
 * This method is to delete PcEscalation
 */

//  PcEscalationRoute.delete("/delete/:PcescalationId", async (req, res) => {
// 	try {
// 		const result = await  PcEscalation.deleteOne({ _id: req.params.PcescalationId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "PcEscalation deleted successfully!",
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



PcEscalationRoute.patch("/delete/:PcescalationId", async (req, res) => {
	try {
		const PcEscalationData = await PcEscalation.find({$and:[
			{ _id: req.params.PcescalationId},{is_deleted:false}
		]})
		const result = await  PcEscalation.findOneAndUpdate({ _id: req.params.PcescalationId },
			{is_deleted: true, deleted_at: Date.now(), deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorPcEscalations",
                    old_data: JSON.stringify(PcEscalationData),
                    description: "Survivor Pc escalation data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "pcescalation",
                    note: "Change log genearted for Survivor Pc escalation"
                });
            }
			message = {
				error: false,
				message: "PC Escalation deleted successfully!",
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


module.exports = PcEscalationRoute;
