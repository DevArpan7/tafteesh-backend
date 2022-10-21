require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const VcStatus = require("../../models/status_master/vc_status");
const SurvivorVc = require("../../models/survivor_vc");
const SurvivorVcEscalation = require("../../models/vc_escalation");
const VcStatusRoute = express.Router();

/**
 * This method is to find all Status
 */
VcStatusRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let StatusData = await VcStatus.find({ is_deleted: false }).sort({_id:-1});

		let customVcStatusData = JSON.parse(JSON.stringify(StatusData))

		customVcStatusData.map(e => {
			e.vcStatus_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All VCStatus list",
            data: customVcStatusData,
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
 VcStatusRoute.post("/create", async (req, res) => {
	try {
		const checkVCStatus = await VcStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkVCStatus.length){
			for (let index = 0; index < checkVCStatus.length; index++) {
				if(checkVCStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An VC status already exists with this name!"})
				}
			}
		}

		const StatusData = new VcStatus(req.body);
		const result = await StatusData.save();
		message = {
			error: false,
			message: "VCStatus Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	

	} catch (err) {
		message = {
			error: true,
			message: "VCStatus Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update status
 * @param str vcstatusId
 */
 VcStatusRoute.patch("/update/:vcstatusId", async (req, res) => {
	try {
		const vcStatusData = await VcStatus.findOne({ _id: req.params.vcstatusId }) 
		const existenceCheck1 = await SurvivorVc.findOne({$or: [{status: vcStatusData?.name}, {vc_status: vcStatusData?._id}]})
		const existenceCheck2 = await SurvivorVcEscalation.findOne({$or: [{status: vcStatusData?.name}, {vc_status: vcStatusData?._id}]})
		if (existenceCheck1 || existenceCheck2) return res.status(200).send({error: true, message: "This vc status exists in other module. Can not be updated."});

		const checkVCStatus = await VcStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkVCStatus.length){
			for (let index = 0; index < checkVCStatus.length; index++) {
				if(checkVCStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An VC status already exists with this name!"})
				}
			}
		}
		
		const result = await VcStatus.findOneAndUpdate({ _id: req.params.vcstatusId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "VCStatus updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "VCStatus not updated",
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
 * This method is to delete State
 * @param str vcstatusId
 */
VcStatusRoute.patch("/delete/:vcstatusId", async (req, res) => {
	try {
		const vcStatusData = await VcStatus.findOne({ _id: req.params.vcstatusId }) 
		const existenceCheck1 = await SurvivorVc.findOne({$or: [{status: vcStatusData?.name}, {vc_status: vcStatusData?._id}]})
		const existenceCheck2 = await SurvivorVcEscalation.findOne({$or: [{status: vcStatusData?.name}, {vc_status: vcStatusData?._id}]})
		if (existenceCheck1 || existenceCheck2) return res.status(200).send({error: true, message: "This vc status exists in other module. Can not be deleted."});
		// return res.status(200).send({error: true, existenceCheck1, existenceCheck2});

		const result = await VcStatus.findOneAndUpdate({ _id: req.params.vcstatusId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "VCStatus deleted successfully!",
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


module.exports = VcStatusRoute;