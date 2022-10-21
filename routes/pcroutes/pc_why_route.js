require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../../middleware/authcheck");
const PcWhy = require("../../models/pcmodel/pc_why");
const PcWhyRoute = express.Router();

/**
 * This method is to find all PcWhy
 */
 PcWhyRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let PcWhyData = await PcWhy.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All Pcwhy list",
            data: PcWhyData,
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
 * This method is to create PcWhy
 */
 PcWhyRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const PcWhyData = new PcWhy(req.body);
		const result = await PcWhyData.save();
		message = {
			error: false,
			message: "PCWhy Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Pcwhy Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update Pcwhy
 * @param str PoliceStationId
 */
 PcWhyRoute.patch("/update/:PcWhyId", isAuthenticate, async (req, res) => {
	try {
		const result = await PcWhy.findOneAndUpdate({ _id: req.params.PcWhyId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "PcWhy updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "PcWhy not updated",
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
 * This method is to delete PcWhy
 * @param str PoliceStationId
 */
 PcWhyRoute.patch("/delete/:PcWhyId", async (req, res) => {
	try {
		const result = await PcWhy.findOneAndUpdate({ _id: req.params.PcWhyId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "PcWhy deleted successfully!",
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


// PcWhyRoute.delete("/delete/:PcWhyId", async (req, res) => {
// 	try {
// 		const result = await PcWhy.deleteOne({ _id: req.params.PcWhyId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "PcWhy deleted successfully!",
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



module.exports = PcWhyRoute;