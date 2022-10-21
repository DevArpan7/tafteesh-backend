require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const VcResult = require("../../models/result_master/vc_result");
const SurvivorVc = require("../../models/survivor_vc");
const VcResultRoute = express.Router();

/**
 * This method is to find all Result
 */
 VcResultRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let ResultData = await VcResult.find({ is_deleted: false }).sort({_id:-1});

		let customVcResultData = JSON.parse(JSON.stringify(ResultData))

		customVcResultData.map(e => {
			e.vcResult_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Vc Result list",
            data: customVcResultData,
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
VcResultRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkvcResult = await VcResult.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkvcResult.length){
			for (let index = 0; index < checkvcResult.length; index++) {
				if(checkvcResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A VC result already exists with this name!"})
				}
			}
		}

		const ResultData = new VcResult(req.body);
		const result = await ResultData.save();
		message = {
			error: false,
			message: "Vc Result Added Successfully!",
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
 * @param str vcresultId
 */
 VcResultRoute.patch("/update/:vcresultId", isAuthenticate, async (req, res) => {
	try {
		const vcResultData = await VcResult.findOne({ _id: req.params.vcresultId }) 
		const existenceCheck1 = await SurvivorVc.findOne({$or: [{result: vcResultData?.name}, {result: vcResultData?._id}]})
		// return res.status(200).send({error: true, existenceCheck1});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This VC result exists in other module. Can not be updated."});

		const checkvcResult = await VcResult.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkvcResult.length){
			for (let index = 0; index < checkvcResult.length; index++) {
				if(checkvcResult[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A VC result already exists with this name!"})
				}
			}
		}

		const result = await VcResult.findOneAndUpdate({ _id: req.params.vcresultId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "VC Result updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "VC Result not updated",
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
 * @param str vcresultId
 */
 VcResultRoute.patch("/delete/:vcresultId", async (req, res) => {
	try {
		const vcResultData = await VcResult.findOne({ _id: req.params.vcresultId }) 
		const existenceCheck1 = await SurvivorVc.findOne({$or: [{result: vcResultData?.name}, {result: vcResultData?._id}]})
		// return res.status(200).send({error: true, existenceCheck1});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This VC result exists in other module. Can not be deleted."});

		const result = await VcResult.findOneAndUpdate({ _id: req.params.vcresultId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "VC Result deleted successfully!",
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

module.exports = VcResultRoute;