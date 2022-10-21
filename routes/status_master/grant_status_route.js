require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const GrantStatus = require("../../models/status_master/grant_status");
const survivorGrant = require("../../models/survivor_grant");
const GrantStatusRoute = express.Router();

/**
 * This method is to find all Status
 */
GrantStatusRoute.get("/list",isAuthenticate, async (req, res) => {
    try {
        let StatusData = await GrantStatus.find({ is_deleted: false }).sort({_id:-1});

		let customGrantStatusData = JSON.parse(JSON.stringify(StatusData))

		customGrantStatusData.map(e => {
			e.grantStatus_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All Grant Status list",
            data: customGrantStatusData,
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
 GrantStatusRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkGrantStatus = await GrantStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkGrantStatus.length){
			for (let index = 0; index < checkGrantStatus.length; index++) {
				if(checkGrantStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An grant status already exists with this name!"})
				}
			}
		}

		const StatusData = new GrantStatus(req.body);
		const result = await StatusData.save();
		message = {
			error: false,
			message: "Grant status Added Successfully!",
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
 * @param str StateId
 */
 GrantStatusRoute.patch("/update/:StatusId", isAuthenticate, async (req, res) => {
	try {
		const grantStatusData = await GrantStatus.findOne({ _id: req.params.StatusId });
		const existenceCheck1 = await survivorGrant.findOne({$or: [{status: grantStatusData?.name}, {grant_status: grantStatusData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This grant status exists in other module. Can not be updated."});

		const checkGrantStatus = await GrantStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkGrantStatus.length){
			for (let index = 0; index < checkGrantStatus.length; index++) {
				if(checkGrantStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An grant status already exists with this name!"})
				}
			}
		}
		
		const result = await GrantStatus.findOneAndUpdate({ _id: req.params.StatusId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Grant status updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Status not updated",
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
 * @param str StateId
 */
GrantStatusRoute.patch("/delete/:StatusId", async (req, res) => {
	try {
		const grantStatusData = await GrantStatus.findOne({ _id: req.params.StatusId });
		const existenceCheck1 = await survivorGrant.findOne({$or: [{status: grantStatusData?.name}, {grant_status: grantStatusData?._id}]});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This grant status exists in other module. Can not be deleted."});
		const result = await GrantStatus.findOneAndUpdate({ _id: req.params.StatusId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "Grant status deleted successfully!",
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


module.exports = GrantStatusRoute;