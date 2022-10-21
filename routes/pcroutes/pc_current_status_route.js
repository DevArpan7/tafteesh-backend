require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../../middleware/authcheck");
const PcCurrentStatus = require("../../models/pcmodel/pc_current_status");
const PcCurrentStatusRoute = express.Router();

/**
 * This method is to find all Pc current status
 */
 PcCurrentStatusRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let PcCurrentStatusData = await PcCurrentStatus.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All PcCurrent status list",
            data: PcCurrentStatusData,
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
 * This method is to create Pc current status
 */
 PcCurrentStatusRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const PcCurrentStatusData = new PcCurrentStatus(req.body);
		const result = await PcCurrentStatusData.save();
		message = {
			error: false,
			message: "PC current status Added Successfully!",
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
 * This method is to update PcCurrent status
 * @param str PcCurrentStatusId
 */
 PcCurrentStatusRoute.patch("/update/:PcCurrentStatusId", isAuthenticate, async (req, res) => {
	try {
		const result = await PcCurrentStatus.findOneAndUpdate({ _id: req.params.PcCurrentStatusId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Pc current status updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Pc current status not updated",
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
 * This method is to delete Pc current status
 * @param str PcCurrentStatusId
 */
//  PcCurrentStatusRoute.delete("/delete/:PcCurrentStatusId", async (req, res) => {
// 	try {
// 		const result = await PcCurrentStatus.deleteOne({ _id: req.params.PcCurrentStatusId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Pc current status deleted successfully!",
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


PcCurrentStatusRoute.patch("/delete/:PcCurrentStatusId", async (req, res) => {
	try {
		const result = await PcCurrentStatus.findOneAndUpdate({ _id: req.params.PcCurrentStatusId },{is_deleted:true, deleted_at:Date.now() },{new:true});
		if (result) {
			message = {
				error: false,
				message: "Pc current status deleted successfully!",
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

module.exports = PcCurrentStatusRoute;