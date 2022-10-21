require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const SurvivorStatus = require("../../models/status_master/survivor_status");
const SurvivorProfile = require("../../models/survivor_profile");
const SurvivorStatusRoute = express.Router();

/**
 * This method is to find all Status
 */
 SurvivorStatusRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let StatusData = await SurvivorStatus.find({ is_deleted: false }).sort({_id:-1});

		
		let customsurvivorStatusData = JSON.parse(JSON.stringify(StatusData))

		customsurvivorStatusData.map(e => {
			e.survivorStatus_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All Survivor status list",
            data: customsurvivorStatusData,
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
 * This method is to create Status
 */
 SurvivorStatusRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checksurvivorStatus = await SurvivorStatus.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checksurvivorStatus.length){
			for (let index = 0; index < checksurvivorStatus.length; index++) {
				if(checksurvivorStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A Survivor status already exists with this name!"})
				}
			}
		}
		const StatusData = new SurvivorStatus(req.body);
		const result = await StatusData.save();
		message = {
			error: false,
			message: "SurvivorStatus Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "SurvivorStatus Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update status
 * @param str vcstatusId
 */
 SurvivorStatusRoute.patch("/update/:survivorStatusId", isAuthenticate, async (req, res) => {
	try {
		const survivorStatusData = await SurvivorStatus.findOne({ _id: req.params.survivorStatusId });
		const existenceCheck1 = await SurvivorProfile.findOne({$or: [{status_in_tafteesh: survivorStatusData?.name}, {surv_status: survivorStatusData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This survivor status exists in other module. Can not be updated."});

		const checkSurvivorStatusExist = await SurvivorStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkSurvivorStatusExist.length){
			for (let index = 0; index < checkSurvivorStatusExist.length; index++) {
				if(checkSurvivorStatusExist[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An survivor status result already exists with this name!"})
				}
			}
		}
		
		const result = await SurvivorStatus.findOneAndUpdate({ _id: req.params.survivorStatusId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "SurvivorStatus updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "SurvivorStatus not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err.toString(),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete State
 * @param str vcstatusId
 */
 SurvivorStatusRoute.patch("/delete/:survivorStatusId", async (req, res) => {
	try {
		const survivorStatusData = await SurvivorStatus.findOne({ _id: req.params.survivorStatusId });
		const existenceCheck1 = await SurvivorProfile.findOne({$or: [{status_in_tafteesh: survivorStatusData?.name}, {surv_status: survivorStatusData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This survivor status exists in other module. Can not be deleted."});
		const result = await SurvivorStatus.findOneAndUpdate({ _id: req.params.survivorStatusId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "SurvivorStatus deleted successfully!",
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


module.exports = SurvivorStatusRoute;