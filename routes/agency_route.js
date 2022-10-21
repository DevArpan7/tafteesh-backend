require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Agency = require("../models/agency_name");
const SurvivorInvestigation = require("../models/survivor_investigation");
const AgencyRoute = express.Router();

/**
 * This method is to find all Agency by agency type
 */
 AgencyRoute.get("/list/:AgencytypeId", isAuthenticate, async (req, res) => {
    try {
        let AgencyData = await Agency.find({$and:[{agency_type:req.params.AgencytypeId},{is_deleted:false}]}).sort({_id:-1}).populate([
			{
				path:"agency_type",
				select:"name"
			}
		]);

        message = {
            error: false,
            message: "All Agency list",
            data: AgencyData,
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
 * This method is to find all Authority
 */
 AgencyRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let AgencyData = await Agency.find({$and:[{is_deleted:false}]}).populate([
			{
				path:"agency_type",
				select:"name"
			}
		]).sort({_id:-1});

		let customAgencyData = JSON.parse(JSON.stringify(AgencyData))

		customAgencyData.map(e => {
			e.agency_type_name = e?.agency_type?.name
			e.agency_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Agency list",
            data: customAgencyData,
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
 * This method is to create Agency
 */
 AgencyRoute.post("/create", async (req, res) => {
	try {
		const checkAgency = await Agency.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {agency_type: req.body.agency_type}]});
		if (checkAgency.length) return res.status(200).send({error: true, message: "A same agency already exists!"})

		const AgencyData = new Agency(req.body);
		const result = await AgencyData.save();
		message = {
			error: false,
			message: "Agency Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Agency Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update Agency
 * @param str AgencyId
 */
 AgencyRoute.patch("/update/:AgencyId", isAuthenticate, async (req, res) => {
	try {
		const existenceCheck = await SurvivorInvestigation.findOne({inv_agency_name: req.params.AgencyId});
		const checkAgency = await Agency.findOne({name: {$regex: req.body.name, $options: "i"}});
		if (checkAgency || existenceCheck) return res.status(200).send({error: true, message: "This agency alreday exists. Can not be updated."});

		const checkAgencyData = await Agency.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {agency_type: req.body.agency_type}]});
		if (checkAgencyData.length) return res.status(200).send({error: true, message: "A same agency already exists!"})

		const result = await Agency.findOneAndUpdate({ _id: req.params.AgencyId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Agency  updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Agency  not updated",
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
 * This method is to delete Authority
 * @param str AuthorityId
 */
//  AuthorityRoute.delete("/delete/:AuthorityId", async (req, res) => {
// 	try {
// 		const result = await Authority.deleteOne({ _id: req.params.AuthorityId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Authority deleted successfully!",
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


AgencyRoute.patch("/delete/:AgencyId", async (req, res) => {
	try {

		const existenceCheck = await SurvivorInvestigation.findOne({inv_agency_name: req.params.AgencyId})
		if (existenceCheck) return res.status(200).send({error: true, message: "This agency exists in other module. Can not be deleted."});
		const result = await Agency.findOneAndUpdate({_id:req.params.AgencyId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Agency  delete successfully!",
				result
			};
			return res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Agency not deleted",
			};
			return res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


module.exports = AgencyRoute;