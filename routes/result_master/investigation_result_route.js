require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const InvestigationResult = require("../../models/result_master/investigation_result");
const SurvivorInvestigation = require("../../models/survivor_investigation");
const InvestigationResultRoute = express.Router();

/**
 * This method is to find all Result
 */
 InvestigationResultRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let ResultData = await InvestigationResult.find({ is_deleted: false }).sort({_id:-1});

		let customInvResultData = JSON.parse(JSON.stringify(ResultData))

		customInvResultData.map(e => {
			e.invResult_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All investigation Result list",
            data: customInvResultData,
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
 InvestigationResultRoute.post("/create", async (req, res) => {
	try {
		if (req.body.name) {
			const checkinvResult = await InvestigationResult.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
			if (checkinvResult.length){
				for (let index = 0; index < checkinvResult.length; index++) {
					if(checkinvResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
						return res.status(200).send({error: true, message: "A Investigation result already exists with this name!"})
					}
				}
			}
		}
		
		const ResultData = new InvestigationResult(req.body);
		const result = await ResultData.save();
		message = {
			error: false,
			message: "Result Added Successfully!",
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

/**
 * This method is to update Result
 * @param str invresultId
 */
 InvestigationResultRoute.patch("/update/:invresultId", isAuthenticate, async (req, res) => {
	try {
		const invResultData = await InvestigationResult.findOne({ _id: req.params.invresultId }) 
		const existenceCheck1 = await SurvivorInvestigation.findOne({$or: [{result_of_inv: invResultData?.name}, {result_of_inv: invResultData?._id}]})
		// return res.status(200).send({error: true, existenceCheck1});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This investigation result exists in other module. Can not be updated."});

		const checkinvResult = await InvestigationResult.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkinvResult.length){
			for (let index = 0; index < checkinvResult.length; index++) {
				if(checkinvResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A Investigation result already exists with this name!"})
				}
			}
		}

		const result = await InvestigationResult.findOneAndUpdate({ _id: req.params.invresultId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Investigation Result updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Investigation Result not updated",
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
 * @param str invresultId
 */
InvestigationResultRoute.patch("/delete/:invresultId", async (req, res) => {
	try {
		const invResultData = await InvestigationResult.findOne({ _id: req.params.invresultId }) 
		const existenceCheck1 = await SurvivorInvestigation.findOne({$or: [{result_of_inv: invResultData?.name}, {result_of_inv: invResultData?._id}]})
		// return res.status(200).send({error: true, existenceCheck1});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This investigation result exists in other module. Can not be deleted."});

		const result = await InvestigationResult.findOneAndUpdate({ _id: req.params.invresultId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "Investigation Result deleted successfully!",
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

module.exports = InvestigationResultRoute;