require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const Grant = require("../models/grant");
const survivorGrant = require("../models/survivor_grant");
const GrantRoute = express.Router();
const moment = require("moment");

/**
 * This method is to find all grant
 */

 GrantRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let GrantData = await Grant.find({is_deleted:false}).sort({_id:-1});

		let customGrantData = JSON.parse(JSON.stringify(GrantData))
		customGrantData.map(e => {
			e.created_date = moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY')
			return e
		})

        message = {
            error: false,
            message: "All Grant list",
            data: customGrantData,
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
 * This method is to create Grant
 */


 GrantRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkGrantData = await Grant.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkGrantData.length){
			for (let index = 0; index < checkGrantData.length; index++) {
				if(checkGrantData[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A grant already exists with this name!"})
				}
			}
		}

		const GrantData = new Grant(req.body);
		const result = await GrantData.save();
		message = {
			error: false,
			message: "Grant Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Grant Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update Grant
 */

 GrantRoute.patch("/update/:GrantId", isAuthenticate, async (req, res) => {
	try {
		const grantData = await Grant.findOne({ _id: req.params.GrantId }) 
		const existenceCheck1 = await survivorGrant.findOne({name_of_grant_compensation: grantData?._id})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This Grant exists in other module. Can not be updated."});

		const checkGrantData = await Grant.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkGrantData.length){
			for (let index = 0; index < checkGrantData.length; index++) {
				if(checkGrantData[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A grant already exists with this name!"})
				}
			}
		}

		const result = await Grant.findOneAndUpdate({ _id: req.params.GrantId}, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Grant updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Grant not updated",
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
 * This method is to delete Gtant
 */

//  GrantRoute.delete("/delete/:GrantId", async (req, res) => {
// 	try {
// 		const result = await  Grant.deleteOne({ _id: req.params.GrantId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Grant deleted successfully!",
// 			};
// 			res.status(200).send(message);
// 		} else {
// 			message = {
// 				error: true,
// 				message: "Operation failed!",
// 			};
// 			res.status(200).send(message);
// 		}
// 	} catch (err) {
// 		message = {
// 			error: true,
// 			message: "Operation Failed!",
// 			data: err,
// 		};
// 		res.status(200).send(message);
// 	}
// });

GrantRoute.patch("/delete/:GrantId", async (req, res) => {
	try {
		const grantData = await Grant.findOne({ _id: req.params.GrantId }) 
		const existenceCheck1 = await survivorGrant.findOne({name_of_grant_compensation: grantData?._id})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This Grant exists in other module. Can not be deleted."});

		const result = await  Grant.findOneAndUpdate({ _id: req.params.GrantId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Grant deleted successfully!",
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
			data: String(err),
		};
		res.status(200).send(message);
	}
});

module.exports = GrantRoute;
