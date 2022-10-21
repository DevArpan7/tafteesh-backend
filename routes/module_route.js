require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const Module = require("../models/module");
const ModuleRoute = express.Router();
/**
 * This method is to find all Modules
 */
ModuleRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let ModuleData = await Module.find({}).sort({_id:-1});

        message = {
            error: false,
            message: "All Module list",
            data: ModuleData,
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
 * This method is to create Module
 */
ModuleRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const ModuleData = new Module(req.body);
		const result = await ModuleData.save();
		message = {
			error: false,
			message: "Module Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Module status
 * @param str ModuleId
 */
ModuleRoute.patch("/toggle-status/:ModuleId", isAuthenticate, async (req, res) => {
	try {
		const result = await Module.findOneAndUpdate({ _id: req.params.ModuleId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Module status updated successfully!",
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
 * This method is to update Module
 * @param str ModuleId
 */
ModuleRoute.patch("/update/:ModuleId", isAuthenticate, async (req, res) => {
	try {
		const result = await Module.findOneAndUpdate({ _id: req.params.ModuleId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Module updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Module not updated",
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

ModuleRoute.delete("/delete/:ModuleId", isAuthenticate, async (req, res) => {
	try {
		const result = await Module.deleteOne({ _id: req.params.ModuleId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Module deleted successfully!",
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


module.exports = ModuleRoute;