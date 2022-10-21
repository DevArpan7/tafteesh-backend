require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Agency = require("../models/agency_name");
const SurvivorInvestigation = require("../models/survivor_investigation");
const InvAgencyType = require("../models/type_of_agency");
const InvAgencyTypeRoute = express.Router();

/**
 * This method is to find all  Investigation Agency
 */
 InvAgencyTypeRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let InvAgencyTypeData = await InvAgencyType.find({is_deleted:false}).sort({_id:-1});

			
		let customInvAgencyTypeData = JSON.parse(JSON.stringify(InvAgencyTypeData))

		customInvAgencyTypeData.map(e => {
			e.type_of_agency_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Investigation Agency type list",
            data: customInvAgencyTypeData,
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
 * This method is to create  Investigation Agency
 */
 InvAgencyTypeRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkAgency = await InvAgencyType.findOne({name: {$regex: req.body.name, $options: "i"}});
		if (checkAgency) return res.status(200).send({error: true, message: "An agency type already exists with this name!"});

		const InvAgencyTypeData = new InvAgencyType(req.body);
		const result = await InvAgencyTypeData.save();
		message = {
			error: false,
			message: "Investigation Agency Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Investigation Agency Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update InvAgencyType
 * @param str invAgencyId
 */
 InvAgencyTypeRoute.patch("/update/:invAgencyId", isAuthenticate, async (req, res) => {
	try {
		const invAgencyData = await InvAgencyType.findOne({_id:req.params.invAgencyId});

		const existenceCheck1 = await SurvivorInvestigation.findOne({$or: [{inv_agency_name: invAgencyData._id}, {type_of_investigation_agency: invAgencyData.name}]})
		const existenceCheck2 = await Agency.findOne({$or: [{agency_type: invAgencyData._id}]})

		if (existenceCheck1 || existenceCheck2) return res.status(200).send({error: true, message: "This agency type exists in other module. Can not be updated."});

		const result = await InvAgencyType.findOneAndUpdate({ _id: req.params.invAgencyId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Investigation Agency updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Investigation Agency type not updated",
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
 * This method is to delete AuthorityType
 * @param str AuthorityTypeId
 */
//  AuthorityTypeRoute.delete("/delete/:AuthorityTypeId", async (req, res) => {
// 	try {
// 		const result = await AuthorityType.deleteOne({ _id: req.params.AuthorityTypeId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Authority type deleted successfully!",
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

InvAgencyTypeRoute.patch("/delete/:invAgencyId", async (req, res) => {
	try {
		const invAgencyData = await InvAgencyType.findOne({_id:req.params.invAgencyId});

		const existenceCheck1 = await SurvivorInvestigation.findOne({$or: [{inv_agency_name: invAgencyData._id}, {type_of_investigation_agency: invAgencyData.name}]})
		const existenceCheck2 = await Agency.findOne({$or: [{agency_type: invAgencyData._id}]})

		if (existenceCheck1 || existenceCheck2) return res.status(200).send({error: true, message: "This agency type exists in other module. Can not be deleted."});

		const result = await InvAgencyType.findOneAndUpdate({_id:req.params.invAgencyId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Investigation Agency delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Investigation Agency  not deleted",
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


module.exports = InvAgencyTypeRoute;