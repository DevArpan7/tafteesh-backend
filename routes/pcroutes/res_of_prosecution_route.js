require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../../middleware/authcheck");
const ResOfProsecution = require("../../models/pcmodel/result_of_prosecution");
const ResOfProsecutionRoute = express.Router();

/**
 * This method is to find all result of prosecution
 */
 ResOfProsecutionRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let ResOfProsecutionData = await ResOfProsecution.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All Result of prosecution list",
            data: ResOfProsecutionData,
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
 * This method is to create Result of prosecution
 */
 ResOfProsecutionRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const ResOfProsecutionData = new ResOfProsecution(req.body);
		const result = await ResOfProsecutionData.save();
		message = {
			error: false,
			message: "Result of prosecution Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "PC current status Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update result of prosecution
 * @param str ResOfProsId
 */
 ResOfProsecutionRoute.patch("/update/:ResOfProsId", isAuthenticate, async (req, res) => {
	try {
		const result = await ResOfProsecution.findOneAndUpdate({ _id: req.params.ResOfProsId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "result of prosecution updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "result of prosecution not updated",
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
 * This method is to delete result of prosecution
 * @param str ResOfProsId
 */
//  ResOfProsecutionRoute.delete("/delete/:ResOfProsId", async (req, res) => {
// 	try {
// 		const result = await ResOfProsecution.deleteOne({ _id: req.params.ResOfProsId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "result of prosecution deleted successfully!",
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

 ResOfProsecutionRoute.patch("/delete/:ResOfProsId", async (req, res) => {
	try {
		const result = await ResOfProsecution.findOneAndUpdate({ _id: req.params.ResOfProsId },{is_deleted:true,deleted_at:Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "result of prosecution deleted successfully!",
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



module.exports = ResOfProsecutionRoute;