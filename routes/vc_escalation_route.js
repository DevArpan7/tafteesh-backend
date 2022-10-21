require("dotenv").config();
const express = require("express");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorVc = require("../models/survivor_vc");

const VcEscalation = require("../models/vc_escalation");
const VcEscalationRoute = express.Router();

const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();

/**
 * This method is to find all VcEscalation
**/

VcEscalationRoute.get("/list/:survivorvcId", isAuthenticate, async (req, res) => {
    try {
        let VcEscalationData = await VcEscalation.find({
			$and:[
				{ survivor_vc: req.params.survivorvcId },
				{is_deleted:false}
			]}).populate([
				{
					path: "escalated_at",
					select:"name"
				},
				// {
				// 	path: "authority",
				// 	select: "name"
				// },
				{
					path:"vc_status",
					select:"name"
				},
				{
					path:"vc_esc_result",
					select:"name"
				}
			]).sort({_id:-1});

        message = {
            error: false,
            message: "All VC Escalation list",
            data: VcEscalationData.filter(e => !e?.survivor_vc_escalation),
        };
		infoLogger.info({
			req: req.params, 
			res: VcEscalationData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: String(err), 
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
 * This method is to find detail VcEscalation
 *  @param str SurvivorVcescalationId
**/

VcEscalationRoute.get("/detail/:SurvivorVcescalationId", isAuthenticate, async (req, res) => {
    try {
        let VcEscalationData = await VcEscalation.findOne({
			$and:[
				{ _id: req.params.SurvivorVcescalationId },
				{is_deleted:false}
			]}).populate([
				{
					path: "escalated_at",
					select:"name"
				},
				{
					path:"vc_status",
					select:"name"
				}
			]).sort({_id:-1});

        message = {
            error: false,
            message: "All VC Escalation list",
           // data: VcEscalationData.filter(e => !e?.survivor_vc_escalation),
			data:VcEscalationData
        };
		infoLogger.info({
			req: req.params, 
			res: VcEscalationData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: String(err), 
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




VcEscalationRoute.get("/list-2/:survivorvcId/:escalationId", isAuthenticate, async (req, res) => {
    try {
        let VcEscalationData = await VcEscalation.find({$and:[{ survivor_vc: req.params.survivorvcId, survivor_vc_escalation: req.params.escalationId },{is_deleted:false}]}).populate([
			{
				path: "escalated_at",
				select:"name"
			},
			// {
			// 	path: "authority",
			// 	select: "name"
			// },
			{
				path:"vc_status",
				select:"name"
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All VC Escalation list",
            data: VcEscalationData,
        };
		infoLogger.info({
			req: req.params, 
			res: VcEscalationData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: String(err), 
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
 * This method is to create VcEscalation
 */
VcEscalationRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const VcEscalationData = new VcEscalation(req.body);
		let survivorvcId = VcEscalationData?.survivor_vc
		console.log(survivorvcId);
		let survivorVCData = await SurvivorVc.findOne({_id: {$in: survivorvcId}});
		console.log(survivorVCData?.applied_date);
		console.log(VcEscalationData?.applied_date);
		if (VcEscalationData?.applied_date <= survivorVCData?.applied_date) {
			message = {
				error: true,
				message: "Vc escalation applied date should be after Vc applied date",
			};
			return res.status(200).send(message);
		}
		const result = await VcEscalationData.save();

		//flag to check
		if (req.body.flag) {
			let srvVcData = await SurvivorVc.findOneAndUpdate({_id: req.body.survivor_vc}, {$inc: { totalEscalation: 1 }});
		} else {
			let srvVcData = await SurvivorVc.findOneAndUpdate({_id: req.body.survivor_vc}, {$inc: { totalEscalation: 1 }});
			let srvVcEscData = await VcEscalation.findOneAndUpdate({
				$and: [
					{survivor_vc: req.body.survivor_vc}, 
					{survivor_vc_escalation: req.body.survivor_vc_escalation}
				]
			}, {$inc: { totalEscalation: 1 }});
		}

		message = {
			error: false,
			message: "VC Escalation Added Successfully!",
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
			message: "VcEscalation Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update VcEscalation
 */
 VcEscalationRoute.patch("/update/:SurvivorVcescalationId", isAuthenticate, async (req, res) => {
	try {
		const CheckSurvivorVcEscalationData = await VcEscalation.findOne({$and:[
			{ _id: req.params.SurvivorVcescalationId},{is_deleted:false}
		]})
		if (!CheckSurvivorVcEscalationData) return res.status(200).send({error: true, message: "Survivor Fir not found"}) 
		let survivorVcId = CheckSurvivorVcEscalationData?.survivor_vc
		console.log(survivorVcId);
		let survivorVcData = await SurvivorVc.findOne({_id: {$in: survivorVcId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.applied_date && (new Date(req.body.applied_date) <= new Date(survivorVcData?.applied_date))) return res.status(200).send({ error: true, message: "Escalation applied date should be after vc applied data"})

		const VcEscalationData = await VcEscalation.find({$and:[
			{ _id: req.params.SurvivorVcescalationId},{is_deleted:false}
		]})
		const result = await VcEscalation.findOneAndUpdate({ _id: req.params.SurvivorVcescalationId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorVcEscalations",
                    old_data: JSON.stringify(VcEscalationData),
                    description: "Survivor Vc Escalation data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "vcescalation",
                    note: "Change log genearted for Survivor Vc Escalation"
                });
            }
			message = {
				error: false,
				message: "VC Escalation updated successfully!",
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
				message: "VC Escalation not updated",
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
 * This method is to delete VcEscalation
 */

//  VcEscalationRoute.delete("/delete/:SurvivorVcescalationId", async (req, res) => {
// 	try {
// 		const result = await  VcEscalation.deleteOne({ _id: req.params.SurvivorVcescalationId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "VcEscalation deleted successfully!",
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


VcEscalationRoute.patch("/delete/:SurvivorVcescalationId", async (req, res) => {
	try {
		const VcEscalationData = await VcEscalation.find({$and:[
			{ _id: req.params.SurvivorVcescalationId},{is_deleted:false}
		]})
		const result = await  VcEscalation.findOneAndUpdate({ _id: req.params.SurvivorVcescalationId},
			{is_deleted: true, deleted_at: Date.now(), deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorVcEscalations",
                    old_data:  JSON.stringify(VcEscalationData),
                    description: "Survivor Vc Escalation data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "vcescalation",
                    note: "Change log genearted for Survivor Vc Escalation"
                });
            }
			message = {
				error: false,
				message: "VC Escalation deleted successfully!",
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

module.exports = VcEscalationRoute;