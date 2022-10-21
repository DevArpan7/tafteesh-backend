require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../../middleware/authcheck");
const EscalatedReason = require("../../models/pcmodel/escalated_reason");
const EscalatedReasonRoute = express.Router();

/**
 * This method is to find all escalatedReason
 */
 EscalatedReasonRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let EscalatedReasonData = await EscalatedReason.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All Escalated Reason list",
            data: EscalatedReasonData,
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
 * This method is to create Escalated Reason
 */
 EscalatedReasonRoute.post("/create", isAuthenticate, async (req, res) => {
	try {

		const EscalatedReasonData = new EscalatedReason(req.body);
		const result = await EscalatedReasonData.save();
		message = {
			error: false,
			message: "Escalated Reason Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Escalated reason Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update Escalated Reason
 * @param str EscalatedResId
 */
 EscalatedReasonRoute.patch("/update/:EscalatedResId", isAuthenticate, async (req, res) => {
	try {
		const result = await EscalatedReason.findOneAndUpdate({ _id: req.params.EscalatedResId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Escalated reason updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Escalated reason not updated",
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

 EscalatedReasonRoute.patch("/delete/:EscalatedResId", async (req, res) => {
	try {
		const result = await EscalatedReason.findOneAndUpdate({ _id: req.params.EscalatedResId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Escalated reason deleted successfully!",
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



//  EscalatedReasonRoute.delete("/delete/:EscalatedResId", async (req, res) => {
// 	try {
// 		const result = await EscalatedReason.deleteOne({ _id: req.params.EscalatedResId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Escalated reason deleted successfully!",
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

module.exports = EscalatedReasonRoute;