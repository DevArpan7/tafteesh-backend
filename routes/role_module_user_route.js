require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const RoleModuleUser = require("../models/role_module_user");
const RoleModuleUserRoute = express.Router();

/**
 * This method is to find all roleModule User
 */
 RoleModuleUserRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let RoleModuleUserData = await RoleModuleUser.find({}).populate([
            {
                path: "role",
                select: "name"
            },
            {
                path: "user_id",
                select: "fname lname "
            },
            {
                path: "access.module",
                select: "name"
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All RoleModule User list",
            data: RoleModuleUserData,
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
 * This method is to find all roleModule User
 */
 RoleModuleUserRoute.get("/list/:UserId", isAuthenticate, async (req, res) => {
    try {
        let RoleModuleUserData = await RoleModuleUser.findOne({user_id:req.params.UserId}).populate([
            {
                path: "role",
                select: "name"
            },
            {
                path: "user_id",
                select: "fname lname"
            },
            {
                path: "access.module",
                select: "name"
            }
        ]).sort({_id:-1});
        message = {
            error: false,
            message: "All RoleModule User list",
            data: RoleModuleUserData,
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
 * This method is to find roleModule User details
 * @param str RoleModuleUserId
 */
 RoleModuleUserRoute.get("/detail/:RoleModuleUserId", isAuthenticate, async (req, res) => {
    try {
        let RoleModuleUserData = await RoleModuleUser.find({_id: req.params.RoleModuleUserId}).populate([
            {
                path: "role",
                select: "name"
            },
            {
                path: "user_id",
                select: "fname lname "
            },
            {
                path: "access.module",
                select: "name"
            }
        ]);

        if (RoleModuleUserData) {
            message = {
                error: false,
                message: "RoleModuleUser data found!",
                data: RoleModuleUserData,
            };
        } else {
            message = {
                error: true,
                message: "RoleModuleUser data not found!",
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
 * This method is to create roleModulesUser
 * @param str role
 * @param arrray modules
 * 
 */
 RoleModuleUserRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
        const RoleModuleUserData = new RoleModuleUser(req.body);
        const result = await RoleModuleUserData.save();
        message = {
            error: false,
            message: "RoleModuleUser Added Successfully!",
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
 * @param str RoleModuleUserId
 */
 RoleModuleUserRoute.patch("/update/:RoleModuleUserId", isAuthenticate, async (req, res) => {
	try {
		const result = await RoleModuleUser.findOneAndUpdate({ _id: req.params.RoleModuleUserId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "RoleModuleUser updated successfully!",
                result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "RoleModuleUser not updated",
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
 * This method is to delete roleModulesUser
 * @param str RoleModuleUserId
 */
 RoleModuleUserRoute.delete("/delete/:RoleModuleUserId", isAuthenticate, async (req, res) => {
	try {
		const result = await RoleModuleUser.deleteOne({ _id: req.params.RoleModuleUserId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "RoleModuleUser deleted successfully!",
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "RoleModuleUser not deleted!",
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

module.exports = RoleModuleUserRoute;