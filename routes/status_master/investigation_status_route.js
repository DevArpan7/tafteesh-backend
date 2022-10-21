require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const InvestigationStatus = require("../../models/status_master/investigation_status");
const SurvivorInvestigation = require("../../models/survivor_investigation");
const InvestigationStatusRoute = express.Router();

/**
 * This method is to find all Status
 */
InvestigationStatusRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let StatusData = await InvestigationStatus.find({ is_deleted: false }).sort({_id:-1});

		let customInvStatusData = JSON.parse(JSON.stringify(StatusData))

		customInvStatusData.map(e => {
			e.invStatus_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All investigation Status list",
            data: customInvStatusData,
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
 InvestigationStatusRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkInvestigationStatus = await InvestigationStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkInvestigationStatus.length){
			for (let index = 0; index < checkInvestigationStatus.length; index++) {
				if(checkInvestigationStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An investigation status already exists with this name!"})
				}
			}
		}

		const StatusData = new InvestigationStatus(req.body);
		const result = await StatusData.save();
		message = {
			error: false,
			message: "Status Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Status Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update status
 * @param str invstatusId
 */
 InvestigationStatusRoute.patch("/update/:invstatusId", isAuthenticate, async (req, res) => {
	try {
		const invStatusData = await InvestigationStatus.findOne({ _id: req.params.invstatusId });
		const existenceCheck1 = await SurvivorInvestigation.findOne({$or: [{status_of_investigation: invStatusData?.name}, {inv_status: invStatusData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This investigation status exists in other module. Can not be updated."});
		
		const checkInvestigationStatus = await InvestigationStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkInvestigationStatus.length){
			for (let index = 0; index < checkInvestigationStatus.length; index++) {
				if(checkInvestigationStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An investigation status already exists with this name!"})
				}
			}
		}
		
		const result = await InvestigationStatus.findOneAndUpdate({ _id: req.params.invstatusId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Investigation Status updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Investigation Status not updated",
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
 * @param str invstatusId
 */
InvestigationStatusRoute.patch("/delete/:invstatusId", async (req, res) => {
	try {
		const invStatusData = await InvestigationStatus.findOne({ _id: req.params.invstatusId });
		const existenceCheck1 = await SurvivorInvestigation.findOne({$or: [{status_of_investigation: invStatusData?.name}, {inv_status: invStatusData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This investigation status exists in other module. Can not be deleted."});
		
		const result = await InvestigationStatus.findOneAndUpdate({ _id: req.params.invstatusId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "Investigation Status deleted successfully!",
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


module.exports = InvestigationStatusRoute;