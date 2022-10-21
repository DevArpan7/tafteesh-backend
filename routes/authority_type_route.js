require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Authority = require("../models/authority");
const AuthorityType = require("../models/authority_type");
const SurvivorVc = require("../models/survivor_vc");
const SurvivorVcEscalation = require("../models/vc_escalation");
const AuthorityTypeRoute = express.Router();

/**
 * This method is to find all AuthorityType
 */
 AuthorityTypeRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let AuthorityTypeData = await AuthorityType.find({is_deleted:false}).sort({_id:-1});

		let customAuthorityTypeData = JSON.parse(JSON.stringify(AuthorityTypeData))

		customAuthorityTypeData.map(e => {
			e.authority_type_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All Authority type list",
            data: customAuthorityTypeData,
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
 * This method is to create AuthorityType
 */
 AuthorityTypeRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkAuthorityType = await AuthorityType.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkAuthorityType.length){
			for (let index = 0; index < checkAuthorityType.length; index++) {
				if(checkAuthorityType[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An authority type already exists with this name!"})
				}
			}
		}

		const AuthorityTypeData = new AuthorityType(req.body);
		const result = await AuthorityTypeData.save();
		message = {
			error: false,
			message: "Authority type Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Authority type Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update AuthorityType
 * @param str AuthorityTypeId
 */
 AuthorityTypeRoute.patch("/update/:AuthorityTypeId", isAuthenticate, async (req, res) => {
	try {
		const chechkEsitence1 = await Authority.findOne({authority_type: req.params.AuthorityTypeId})
		const chechkEsitence2 = await SurvivorVc.findOne({applied_at: req.params.AuthorityTypeId})
		const chechkEsitence3 = await SurvivorVcEscalation.findOne({escalated_at: req.params.AuthorityTypeId})

		if (chechkEsitence1 || chechkEsitence2 || chechkEsitence3) return res.status(200).send({error: true, message: "This authority type exist in other module. Can not be updated."})

		const checkAuthorityType = await AuthorityType.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkAuthorityType.length){
			for (let index = 0; index < checkAuthorityType.length; index++) {
				if(checkAuthorityType[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An authority type already exists with this name!"})
				}
			}
		}
		
		const result = await AuthorityType.findOneAndUpdate({ _id: req.params.AuthorityTypeId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Authority type updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Authority type not updated",
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

AuthorityTypeRoute.patch("/delete/:AuthorityTypeId", async (req, res) => {
	try {
		const chechkEsitence1 = await Authority.findOne({authority_type: req.params.AuthorityTypeId})
		const chechkEsitence2 = await SurvivorVc.findOne({applied_at: req.params.AuthorityTypeId})
		const chechkEsitence3 = await SurvivorVcEscalation.findOne({escalated_at: req.params.AuthorityTypeId})

		if (chechkEsitence1 || chechkEsitence2 || chechkEsitence3) return res.status(200).send({error: true, message: "This authority type exist in other module. Can not be deleted."})

		const result = await AuthorityType.findOneAndUpdate({_id:req.params.AuthorityTypeId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Authority type delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Authority type  not deleted",
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


module.exports = AuthorityTypeRoute;