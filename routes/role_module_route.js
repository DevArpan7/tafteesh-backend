require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const RoleModule = require("../models/role_module");
const RoleModuleRoute = express.Router();

/**
 * This method is to find all roleModules
 */
RoleModuleRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let RoleModuleData = await RoleModule.find({}).populate([
            {
                path: "role",
                select: "name"
            },
            {
                path: "access.module",
                select: "name"
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All RoleModule list",
            data: RoleModuleData,
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
 * This method is to find all roleModules by roleID
 */
 RoleModuleRoute.get("/list/:RoleId", isAuthenticate, async (req, res) => {
    try {
        let RoleModuleData = await RoleModule.findOne({role:req.params.RoleId}).populate([
            {
                path: "role",
                select: "name"
            },
            {
                path: "access.module",
                select: "name"
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All RoleModule list",
            data: RoleModuleData,
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
 * This method is to find roleModule details
 * @param str RoleModuleId
 */
RoleModuleRoute.get("/detail/:RoleModuleId", isAuthenticate, async (req, res) => {
    try {
        let RoleModuleData = await RoleModule.find({_id: req.params.RoleModuleId}).populate([
            {
                path: "role",
                select: "name"
            },
            {
                path: "access.module",
                select: "name"
            }
        ]);

        if (RoleModuleData) {
            message = {
                error: false,
                message: "RoleModule data found!",
                data: RoleModuleData,
            };
        } else {
            message = {
                error: true,
                message: "RoleModule data not found!",
            };
        }
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
 * This method is to create roleModules
 * @param str role
 * @param arrray modules
 * 
 */
RoleModuleRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
        const RoleModuleData = new RoleModule(req.body);
        const result = await RoleModuleData.save();
        message = {
            error: false,
            message: "RoleModule Added Successfully!",
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
 * This method is to update roleModules
 * @param str RoleModuleId
 */
RoleModuleRoute.patch("/update/:RoleModuleId", isAuthenticate, async (req, res) => {
	try {
		const result = await RoleModule.findOneAndUpdate({ _id: req.params.RoleModuleId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "RoleModule updated successfully!",
                result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "RoleModule not updated",
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
 * This method is to delete roleModules
 * @param str RoleModuleId
 */
RoleModuleRoute.delete("/delete/:RoleModuleId", isAuthenticate, async (req, res) => {
	try {
		const result = await RoleModule.deleteOne({ _id: req.params.RoleModuleId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "RoleModule deleted successfully!",
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "RoleModule not deleted!",
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

module.exports = RoleModuleRoute;