require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const PcResult = require("../../models/result_master/pc_result");
const SurvivorPc = require("../../models/survivor_pc");
const PcResultRoute = express.Router();

/**
 * This method is to find all Result
 */
 PcResultRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let ResultData = await PcResult.find({ is_deleted: false }).sort({_id:-1});

		let customPcResultData = JSON.parse(JSON.stringify(ResultData))

		customPcResultData.map(e => {
			e.pcResult_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Pc Result list",
            data: customPcResultData,
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
 PcResultRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkPcResult = await PcResult.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkPcResult.length){
			for (let index = 0; index < checkPcResult.length; index++) {
				if(checkPcResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A PC result already exists with this name!"})
				}
			}
		}
		
		const ResultData = new PcResult(req.body);
		const result = await ResultData.save();
		message = {
			error: false,
			message: "PC Result Added Successfully!",
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
 * @param str pcresultId
 */
PcResultRoute.patch("/update/:pcresultId", isAuthenticate, async (req, res) => {
	try {
		const pcResultData = await PcResult.findOne({ _id: req.params.pcresultId }) 
		const existenceCheck1 = await SurvivorPc.findOne({$or: [{result_of_pc: pcResultData?.name}, {result_of_pc: pcResultData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This PC result exists in other module. Can not be updated."});
		
		if(req.body.name) {
			const checkPcResult = await PcResult.find({name: {$regex: req.body.name, $options: "i"}});
			if (checkPcResult.length){
				for (let index = 0; index < checkPcResult.length; index++) {
					if(checkPcResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
						return res.status(200).send({error: true, message: "A PC result already exists with this name!"})
					}
				}
			}
		}

		const result = await PcResult.findOneAndUpdate({ _id: req.params.pcresultId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "PC Result updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "PC Result not updated",
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
 * @param str pcresultId
 */
 PcResultRoute.patch("/delete/:pcresultId", async (req, res) => {
	try {
		const pcResultData = await PcResult.findOne({ _id: req.params.pcresultId }) 
		const existenceCheck1 = await SurvivorPc.findOne({$or: [{result_of_pc: pcResultData?.name}, {result_of_pc: pcResultData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This PC result exists in other module. Can not be deleted."});

		const result = await PcResult.findOneAndUpdate({ _id: req.params.pcresultId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "PC Result deleted successfully!",
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

module.exports = PcResultRoute;