require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const VcEscalationResult = require("../../models/result_master/vc_escalation_result");
const VcEscalation = require("../../models/vc_escalation");
const VcEscalationResultRoute = express.Router();

/**
 * This method is to find all Result
 */
 VcEscalationResultRoute.get("/list",isAuthenticate, async (req, res) => {
    try {
        let ResultData = await VcEscalationResult.find({ is_deleted: false }).sort({_id:-1});

		let customVcEscalationData = JSON.parse(JSON.stringify(ResultData))

		customVcEscalationData.map(e => {
			e.vcEscalation_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Vc Escalation Result list",
            data: customVcEscalationData,
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
 * This method is to create Result
 */
 VcEscalationResultRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkVcEscResult = await VcEscalationResult.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkVcEscResult.length){
			for (let index = 0; index < checkVcEscResult.length; index++) {
				if(checkVcEscResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A VC escalation result already exists with this name!"})
				}
			}
		}

		const ResultData = new VcEscalationResult(req.body);
		const result = await ResultData.save();
		message = {
			error: false,
			message: "VC Escalation Result Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Result Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

// /**
//  * This method is to update Result
//  * @param str pcescalationresultId
//  */
VcEscalationResultRoute.patch("/update/:vcescalationresultId",isAuthenticate, async (req, res) => {
	try {
		const vcEscalationResultData = await VcEscalationResult.findOne({ _id: req.params.vcescalationresultId }) 
		const existenceCheck1 = await VcEscalation.findOne({$or: [{result: vcEscalationResultData?.name}, {vc_esc_result: vcEscalationResultData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This VC Escalation result exists in other module. Can not be updated."});

		const checkVcEscResult = await VcEscalationResult.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkVcEscResult.length){
			for (let index = 0; index < checkVcEscResult.length; index++) {
				if(checkVcEscResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A VC escalation result already exists with this name!"})
				}
			}
		}

		const result = await VcEscalationResult.findOneAndUpdate({ _id: req.params.vcescalationresultId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Vc Escalation Result updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "VC Escalation Result not updated",
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
 * This method is to delete Result
 * @param str pcescalationresultId
 */
 VcEscalationResultRoute.patch("/delete/:vcescalationresultId", async (req, res) => {
	try {
		const vcEscalationResultData = await VcEscalationResult.findOne({ _id: req.params.vcescalationresultId }) 
		const existenceCheck1 = await VcEscalation.findOne({$or: [{result: vcEscalationResultData?.name}, {vc_esc_result: vcEscalationResultData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This VC Escalation result exists in other module. Can not be deleted."});

		const result = await VcEscalationResult.findOneAndUpdate({ _id: req.params.vcescalationresultId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "VC Escalation Result deleted successfully!",
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
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete Result
 * @param str pcescalationresultId
 */


 VcEscalationResultRoute.delete("/delete/:vcescalationresultId",isAuthenticate,  async (req, res) => {
	try {
		const result = await VcEscalationResult.deleteOne({ _id: req.params.vcescalationresultId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Pc Escalation Result deleted successfully!",
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



module.exports = VcEscalationResultRoute;