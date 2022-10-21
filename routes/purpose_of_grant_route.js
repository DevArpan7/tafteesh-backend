require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const PurposeOfGrant = require("../models/purpose_of_grant");
const survivorGrant = require("../models/survivor_grant");
const PurposeOfGrantRoute = express.Router();
const moment = require("moment");

/**
 * This method is to find all  Purpose Of Grant
 */
PurposeOfGrantRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let PurposeOfGrantData = await PurposeOfGrant.find({is_deleted:false}).populate([
			{
				path:"grant_name",
				select:"name"
			}
		]).sort({_id:-1});

		let customPurposeOfGrantData = JSON.parse(JSON.stringify(PurposeOfGrantData))
		customPurposeOfGrantData.map(e => {
			e.custom_grant_name = e.grant_name?.name
			e.created_date = moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY')
			return e
		})

        message = {
            error: false,
            message: "All Purpose Of Grant list",
            data: customPurposeOfGrantData,
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
 * This method is to find all  Purpose Of Grant
 */
 PurposeOfGrantRoute.get("/list/:grantID", isAuthenticate, async (req, res) => {
    try {
        let PurposeOfGrantData = await PurposeOfGrant.find({$and:[{grant_name:req.params.grantID},{is_deleted:false}]}).populate([
			{
				path:"grant_name",
				select:"name"
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All Purpose Of Grant list",
            data: PurposeOfGrantData,
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
 * This method is to create AuthorityType
 */
PurposeOfGrantRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkPurposeOfGrantData = await PurposeOfGrant.findOne({$and: [{name: {$regex: req.body.name, $options: "i"}}, {grant_name: req.body.grant_name}]});
		if (checkPurposeOfGrantData) return res.status(200).send({error: true, message: "A same purpose of grant already exists!"});

		const PurposeOfGrantData = new PurposeOfGrant(req.body);
		const result = await PurposeOfGrantData.save();
		message = {
			error: false,
			message: "Purpose Of Grant Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Purpose Of Grant type Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update AuthorityType
 * @param str purposeOfGrantId
 */
PurposeOfGrantRoute.patch("/update/:purposeOfGrantId", isAuthenticate, async (req, res) => {
	try {
		const existenceCheck1 = await survivorGrant.findOne({purpose_of_grant_id: req.params.purposeOfGrantId})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This purpose of Grant exists in other module. Can not be updated."});
		
		const checkPurposeOfGrantData = await PurposeOfGrant.findOne({$and: [{name: {$regex: req.body.name, $options: "i"}}, {grant_name: req.body.grant_name}]});
		if (checkPurposeOfGrantData) return res.status(200).send({error: true, message: "A same purpose of grant already exists!"});

		const result = await PurposeOfGrant.findOneAndUpdate({ _id: req.params.purposeOfGrantId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Purpose of grant updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Purpose of grant not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete AuthorityType
 * @param str AuthorityTypeId
 */
PurposeOfGrantRoute.delete("/delete/:purposeOfGrantId", async (req, res) => {
	try {
		const existenceCheck1 = await survivorGrant.findOne({purpose_of_grant_id: req.params.purposeOfGrantId})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This purpose of Grant exists in other module. Can not be deleted."});

		const result = await PurposeOfGrant.deleteOne({ _id: req.params.purposeOfGrantId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Purpose of grant deleted successfully!",
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

PurposeOfGrantRoute.patch("/delete/:purposeOfGrantId", async (req, res) => {
	try {
		const purposeOfGrantData = await PurposeOfGrant.findOne({ _id: req.params.purposeOfGrantId }) 
		const existenceCheck1 = await survivorGrant.findOne({purpose_of_grant_id: purposeOfGrantData?._id})
		
		if (existenceCheck1) return res.status(200).send({error: true, message: "This purpose of grant exists in other module. Can not be deleted."});

		const result = await PurposeOfGrant.findOneAndUpdate({_id:req.params.purposeOfGrantId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Purpose Of Grant delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Purpose Of Grant  not deleted",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});


module.exports = PurposeOfGrantRoute;