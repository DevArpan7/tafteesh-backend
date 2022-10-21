require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const Organization = require("../models/organization");
const OrganizationRoute = express.Router();

/**
 * This method is to find all Organizations
 */
OrganizationRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let OrganizationData = await Organization.find({is_deleted:false}).populate([
			{
				path:"state_name",
				select:"name"
			},
			{
				path:"city_name",
				select:"name"
			}
		]).sort({_id:-1});
		let count = OrganizationData.length;

		let customOrganizationData = JSON.parse(JSON.stringify(OrganizationData))

		customOrganizationData.map(e => {
			e.org_city_name = e?.city_name?.name
			e.org_state_name = e?.state_name?.name
			return e
		})
		
        message = {
            error: false,
            message: "All Organization list",
            data: customOrganizationData,
			totalcount:count,
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
 * This method is to create Organization
 */
OrganizationRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkOrganization = await Organization.findOne({$and: [{is_deleted: false}, {$or: [{phone: req.body.phone}, {email: req.body.email}]}]})
		if (checkOrganization && checkOrganization.phone == req.body.phone) {
			message = {
				error: true,
				message: "An organiztion already exist with this phone!",
			};
			return res.status(200).send(message);
		}
		if (checkOrganization && checkOrganization.email == req.body.email) {
			message = {
				error: true,
				message: "An organiztion already exist with this email!",
			};
			return res.status(200).send(message);
		}
		const OrganizationData = new Organization(req.body);
		const result = await OrganizationData.save();
		message = {
			error: false,
			message: "Organization Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: String(err),
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Organization status
 * @param str OrganizationId
 */
OrganizationRoute.patch("/toggle-status/:OrganizationId", isAuthenticate, async (req, res) => {
	try {
		const result = await Organization.findOneAndUpdate({ _id: req.params.OrganizationId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Organization status updated successfully!",
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
 * This method is to update Organization
 * @param str OrganizationId
 */
OrganizationRoute.patch("/update/:OrganizationId", isAuthenticate, async (req, res) => {
	try {
		// const checkOrganization = await Organization.findOne({$or: [{phone: req.body.phone}, {email: req.body.email}]})
		// if (checkOrganization && checkOrganization.phone == req.body.phone) {
		// 	message = {
		// 		error: true,
		// 		message: "An organiztion already exist with this phone!",
		// 	};
		// 	return res.status(200).send(message);
		// }
		// if (checkOrganization && checkOrganization.email == req.body.email) {
		// 	message = {
		// 		error: true,
		// 		message: "An organiztion already exist with this email!",
		// 	};
		// 	return res.status(200).send(message);
		// }
		const result = await Organization.findOneAndUpdate({ _id: req.params.OrganizationId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Organization updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Organization not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message:  String(err),
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete Organization
 * @param str OrganizationId
 */
// OrganizationRoute.delete("/delete/:OrganizationId", async (req, res) => {
// 	try {
// 		const result = await Organization.deleteOne({ _id: req.params.OrganizationId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Organization deleted successfully!",
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


OrganizationRoute.patch("/delete/:OrganizationId", async (req, res) => {
	try {
		const result = await Organization.findOneAndUpdate({ _id: req.params.OrganizationId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Organization deleted successfully!",
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
 *  This method is to search OrganiZation
 */

 OrganizationRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await Organization.find({
			"$or":[{"name":{"$regex":searchText,$options: 'i' }},{"email":{"$regex":searchText,$options: 'i' }},{"phone":{"$regex":searchText,$options: 'i' }},{"address":{"$regex":searchText,$options: 'i' }}]})
	
		if (result) {
			message = {
				error: false,
				message: "Organization search successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "OrganiZation search failed",
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


module.exports = OrganizationRoute;