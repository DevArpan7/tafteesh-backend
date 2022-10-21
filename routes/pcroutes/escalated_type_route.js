require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../../middleware/authcheck");
const EscalatedType = require("../../models/pcmodel/escalated_type");
const EscalatedTypeRoute = express.Router();

/**
 * This method is to find all escalatedType
 */
 EscalatedTypeRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let EscalatedTypeData = await EscalatedType.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All Escalated Type list",
            data:EscalatedTypeData ,
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
 * This method is to create Escalated Type
 */
 EscalatedTypeRoute.post("/create", isAuthenticate, async (req, res) => {
	try {

		const EscalatedTypeData = new EscalatedType(req.body);
		const result = await EscalatedTypeData.save();
		message = {
			error: false,
			message: "Escalated type Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Escalated type Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update Escalated Type
 * @param str EscalatedId
 */
 EscalatedTypeRoute.patch("/update/:EscalatedId", isAuthenticate, async (req, res) => {
	try {
		const result = await EscalatedType.findOneAndUpdate({ _id: req.params.EscalatedId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Escalated Type updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Escalated Type not updated",
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
 * This method is to delete Esacalated type
 * @param str EscalatedId
 */
//  EscalatedTypeRoute.delete("/delete/:EscalatedId", async (req, res) => {
// 	try {
// 		const result = await EscalatedType.deleteOne({ _id: req.params.EscalatedId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Escalated Type deleted successfully!",
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


EscalatedTypeRoute.patch("/delete/:EscalatedId", async (req, res) => {
	try {
		const result = await EscalatedType.findOneAndUpdate({ _id: req.params.EscalatedId },{is_deleted:true,deleted_at:Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Escalated Type deleted successfully!",
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

module.exports = EscalatedTypeRoute;