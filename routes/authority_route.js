require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Authority = require("../models/authority");
const AuthorityRoute = express.Router();
const SurvivorVc = require("../models/survivor_vc");
const VcEscalation = require("../models/vc_escalation");

/**
 * This method is to find all Authority by authority type
 */
 AuthorityRoute.get("/list-by-id/:authorityTypeId", isAuthenticate, async (req, res) => {
    try {
        let AuthorityData = await Authority.find({$and:[{authority_type:req.params.authorityTypeId},{is_deleted:false}]}).sort({_id:-1}).populate([
			{
				path:"authority_type",
				select:"name"
			}
		]);

        message = {
            error: false,
            message: " Authority list",
            data: AuthorityData,
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
 AuthorityRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let AuthorityData = await Authority.find({$and:[{is_deleted:false}]}).populate([
			{
				path:"authority_type",
				select:"name"
			}
		]).sort({_id:-1});

		let customAuthorityData = JSON.parse(JSON.stringify(AuthorityData))
		customAuthorityData.map(e => {
			e.authority_type_name = e?.authority_type?.name
			e.authority_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All Authority list",
            data: customAuthorityData,
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
 * This method is to create Authority
 */
 AuthorityRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkAuthority = await Authority.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {authority_type : req.body.authority_type}, {is_deleted: false}]})
		if (checkAuthority.length) return res.status(200).send({error: true, message: "A same authority already exists!"})

		const AuthorityData = new Authority(req.body);
		const result = await AuthorityData.save();
		message = {
			error: false,
			message: "Authority Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Authority Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update Authority
 * @param str AuthorityId
 */
 AuthorityRoute.patch("/update/:AuthorityId", isAuthenticate, async (req, res) => {
	try {
		const authorityData = await Authority.findOne({ _id: req.params.AuthorityId });
		const existenceCheck1 = await SurvivorVc.findOne({authority: authorityData?._id});
		const existenceCheck2 = await VcEscalation.findOne({authority: authorityData?._id});
		if (existenceCheck1) return res.status(200).send({error: true, message: "This authority exists in other module. Can not be deleted."});
		if (existenceCheck2) return res.status(200).send({error: true, message: "This authority exists in other module. Can not be updated."});
		if (existenceCheck1 || existenceCheck2) return res.status(200).send({error: true, message: "This Authority exists in other module. Can not be updated."});

		const checkAuthority = await Authority.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {authority_type : req.body.authority_type}, {is_deleted: false}]})
		if (checkAuthority.length) return res.status(200).send({error: true, message: "A same authority already exists!"})

		const result = await Authority.findOneAndUpdate({ _id: req.params.AuthorityId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Authority  updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Authority  not updated",
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


AuthorityRoute.patch("/delete/:AuthorityId", async (req, res) => {
	try {
		const authorityData = await Authority.findOne({ _id: req.params.AuthorityId });
		const existenceCheck1 = await SurvivorVc.findOne({authority: authorityData?._id});
		const existenceCheck2 = await VcEscalation.findOne({authority: authorityData?._id});
		if (existenceCheck1 || existenceCheck2) return res.status(200).send({error: true, message: "This Authority exists in other module. Can not be deleted."});

		const result = await Authority.findOneAndUpdate({_id:req.params.AuthorityId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Authority  delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Authority not deleted",
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


module.exports = AuthorityRoute;