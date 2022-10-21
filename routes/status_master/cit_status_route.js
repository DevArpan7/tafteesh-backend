require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../../middleware/authcheck");
const CIT = require("../../models/cit");
const CitStatus = require("../../models/status_master/cit_status");
const CitStatusRoute = express.Router();

/**
 * This method is to find all Status
 */
CitStatusRoute.get("/list", async (req, res) => {
    try {
        let StatusData = await CitStatus.find({ is_deleted: false }).sort({_id:-1});

		let customCitStatusData = JSON.parse(JSON.stringify(StatusData))
		customCitStatusData.map(e => {
			e.citStatus_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Cit Status list",
            data: customCitStatusData,
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
 CitStatusRoute.post("/create", async (req, res) => {
	try {
		const checkCITStatus = await CitStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkCITStatus.length){
			for (let index = 0; index < checkCITStatus.length; index++) {
				if(checkCITStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An CIT status already exists with this name!"})
				}
			}
		}
		
		const StatusData = new CitStatus(req.body);
		const result = await StatusData.save();
		message = {
			error: false,
			message: "Cit status Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Cit status Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update status
 * @param str StateId
 */
 CitStatusRoute.patch("/update/:StatusId", async (req, res) => {
	try {
		const citStatusData = await CitStatus.findOne({ _id: req.params.StatusId }) 
		const existenceCheck1 = await CIT.findOne({$or: [{status: citStatusData?.name}, {status_of_cit: citStatusData?._id}]})
		// return res.status(200).send({error: true, existenceCheck1});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This CIT status exists in other module. Can not be Updated."});

		const checkCITStatus = await CitStatus.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkCITStatus.length){
			for (let index = 0; index < checkCITStatus.length; index++) {
				if(checkCITStatus[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An CIT status already exists with this name!"})
				}
			}
		}

		const result = await CitStatus.findOneAndUpdate({ _id: req.params.StatusId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Cit status updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Cit status not updated",
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
CitStatusRoute.patch("/delete/:StatusId", async (req, res) => {
	try {
		const citStatusData = await CitStatus.findOne({ _id: req.params.StatusId }) 
		const existenceCheck1 = await CIT.findOne({$or: [{status: citStatusData?.name}, {status_of_cit: citStatusData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This CIT status exists in other module. Can not be deleted."});

		const result = await CitStatus.findOneAndUpdate({ _id: req.params.StatusId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "Cit status deleted successfully!",
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


module.exports = CitStatusRoute;