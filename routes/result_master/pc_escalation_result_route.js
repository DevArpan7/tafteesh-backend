require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const SurvivorPcEscalation = require("../../models/pc_escalation");
const PcescalationResult = require("../../models/result_master/pc_escalation_result");
const PcescalationResultRoute = express.Router();

/**
 * This method is to find all Result
 */
 PcescalationResultRoute.get("/list",isAuthenticate, async (req, res) => {
    try {
        let ResultData = await PcescalationResult.find({ is_deleted: false }).sort({_id:-1});

		
		let customPcEscalationResultData = JSON.parse(JSON.stringify(ResultData))

		customPcEscalationResultData.map(e => {
			e.pcEscalation_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Pc Escalation Result list",
            data: customPcEscalationResultData,
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
 PcescalationResultRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkPcEscResult = await PcescalationResult.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkPcEscResult.length){
			for (let index = 0; index < checkPcEscResult.length; index++) {
				if(checkPcEscResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A PC escalation result already exists with this name!"})
				}
			}
		}

		const ResultData = new PcescalationResult(req.body);
		const result = await ResultData.save();
		message = {
			error: false,
			message: "PC Escalation Result Added Successfully!",
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
PcescalationResultRoute.patch("/update/:pcescalationresultId",isAuthenticate, async (req, res) => {
	try {
		const pcResultData = await PcescalationResult.findOne({ _id: req.params.pcescalationresultId }) 
		const existenceCheck1 = await SurvivorPcEscalation.findOne({$or: [{result_of_escalation: pcResultData?.name}, {esc_result: pcResultData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This PC escalation result exists in other module. Can not be updated."});

		if(req.body.name) {
			const checkPcEscResult = await PcescalationResult.find({name: {$regex: req.body.name, $options: "i"}});
			if (checkPcEscResult.length){
				for (let index = 0; index < checkPcEscResult.length; index++) {
					if(checkPcEscResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
						return res.status(200).send({error: true, message: "A PC escalation result already exists with this name!"})
					}
				}
			}
		}

		const result = await PcescalationResult.findOneAndUpdate({ _id: req.params.pcescalationresultId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "PC Escalation Result updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "PC Escalation Result not updated",
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
 PcescalationResultRoute.patch("/delete/:pcescalationresultId", async (req, res) => {
	try {
		const pcResultData = await PcescalationResult.findOne({ _id: req.params.pcescalationresultId }) 
		const existenceCheck1 = await SurvivorPcEscalation.findOne({$or: [{result_of_escalation: pcResultData?.name}, {esc_result: pcResultData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This PC escalation result exists in other module. Can not be deleted."});

		const result = await PcescalationResult.findOneAndUpdate({ _id: req.params.pcescalationresultId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "PC Escalation Result deleted successfully!",
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

module.exports = PcescalationResultRoute;