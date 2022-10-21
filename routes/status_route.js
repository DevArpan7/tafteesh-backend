require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const Status = require("../models/status");
const StatusRoute = express.Router();

/**
 * This method is to find all Status
 */
 StatusRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let StatusData = await Status.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All Status list",
            data: StatusData,
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
 StatusRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const StatusData = new Status(req.body);
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
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update  status
 * @param str StatusId
 */
 StatusRoute.patch("/toggle-status/:StatusId", isAuthenticate, async (req, res) => {
	try {
		const result = await Status.findOneAndUpdate({ _id: req.params.StatusId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "status updated successfully!",
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
 * This method is to update status
 * @param str StateId
 */
 StatusRoute.patch("/update/:StatusId", isAuthenticate, async (req, res) => {
	try {
		const result = await Status.findOneAndUpdate({ _id: req.params.StatusId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Status updated successfully!",
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
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete State
 * @param str StateId
 */
// StateRoute.delete("/delete/:StateId", async (req, res) => {
// 	try {
// 		const result = await State.deleteOne({ _id: req.params.StateId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "State deleted successfully!",
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


StatusRoute.patch("/delete/:StatusId", async (req, res) => {
	try {
		const result = await Status.findOneAndUpdate({ _id: req.params.StatusId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Status deleted successfully!",
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


module.exports = StatusRoute;