require("dotenv").config();
const express = require("express");
const moment = require("moment");
const handleError = require("../helper/handleError");
const isAuthenticate = require("../middleware/authcheck");
const Role = require("../models/role");
const RoleRoute = express.Router();

/**
 * This method is to find all roles
 */
RoleRoute.get("/list", async (req, res) => {
    try {
        let RoleData = await Role.find({is_deleted:false}).populate([{path: "reporting_to", select: "name"}]).sort({_id:-1});

		let customRoleData = JSON.parse(JSON.stringify(RoleData))

		customRoleData.map(e => {
			e.reporting_to_name = e.reporting_to?.name;
			e.role_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Role list",
            data: customRoleData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: String(err),
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to find role details
 * @param str RoleId
 */
RoleRoute.get("/detail/:RoleId", isAuthenticate, async (req, res) => {
    try {
        let RoleData = await Role.find({_id: req.params.RoleId}).populate([{path: "reporting_to", select: "name"}]);

        if (RoleData) {
            message = {
                error: false,
                message: "Role data found!",
                data: RoleData,
            };
        } else {
            message = {
                error: true,
                message: "Role data not found!",
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
 * This method is to create roles
 * @param str name
 * @param str reporting_to
 * 
 */
RoleRoute.post("/create", isAuthenticate, async (req, res) => {
	try {

		const checkRole = await Role.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkRole.length){
			for (let index = 0; index < checkRole.length; index++) {
				if(checkRole[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A role already exists with this name!"})
				}
			}
		}
		
		const RoleData = new Role(req.body);
		const result = await RoleData.save();
		message = {
			error: false,
			message: "Role Added Successfully!",
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
 * This method is to update roles
 * @param str RoleId
 */
RoleRoute.patch("/update/:RoleId", isAuthenticate, async (req, res) => {
	try {
		const checkRole = await Role.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkRole.length){
			for (let index = 0; index < checkRole.length; index++) {
				if(checkRole[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A role already exists with this name!"})
				}
			}
		}

		const result = await Role.findOneAndUpdate({ _id: req.params.RoleId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Role updated successfully!",
                result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Role not updated",
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
 * This method is to delete roles (soft delete)
 * @param str RoleId
 */

 RoleRoute.patch("/delete/:RoleId", async (req, res) => {
	try {
		const result = await Role.findOneAndUpdate({_id:req.params.RoleId},{is_deleted: true, deleted_at: Date.now()},{new:true});
	
		if (result) {
			message = {
				error: false,
				message: "Role deleted successfully!",
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

/**
 * This method is to delete roles
 * @param str RoleId
 */
RoleRoute.delete("/delete/:RoleId", isAuthenticate, async (req, res) => {
	try {
		const result = await Role.deleteOne({ _id: req.params.RoleId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Role deleted successfully!",
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Role not deleted!",
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

module.exports = RoleRoute;