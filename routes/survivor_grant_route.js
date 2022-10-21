require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const survivorGrant = require("../models/survivor_grant");
const survivorGrantRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const sendNotification = require("../helper/sendNotification");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const Mortgage = require("../models/mortgage");
const Court = require("../models/court");
const GrantStatus = require("../models/status_master/grant_status");
const SurvivorProfile = require("../models/survivor_profile");


/**
 * This method is to find all survivorGrant
 */

 survivorGrantRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let survivorGrantData= await survivorGrant.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
			path: "name_of_grant_compensation",
			select: "name amount  installment_number purpose_of_grant"
		},
		{
			path: "grant_status",
			select: "name"
		},
		{
			path: "escalations.escalation_status",
			select: "name"
		},
		{
			path: "purpose_of_grant_id",
			select: "name"
		}
	]).sort({_id:-1});


	let customGrantData = JSON.parse(JSON.stringify(survivorGrantData))

	customGrantData.map(e => {
		e.grant_name = e?.name_of_grant_compensation?.name
		e.applied_date =  moment(e?.applied_on.split("T")[0]).format('DD-MMM-YYYY')
		return e
	})

	
	let mortgagedata = await Mortgage.find({is_deleted:false}).sort({_id:-1});
	let courtdata = await Court.find({is_deleted:false}).sort({_id:-1});
	let grantStatusdata = await GrantStatus.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All survivor grant list",
            data: customGrantData,
			mastermortgagedata: mortgagedata,
			mastercourtdata: courtdata,
			mastergrantStatusdata: grantStatusdata
        };
		infoLogger.info({
			req: req.params, 
			res: survivorGrantData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});



/**
 * This method is to find detail survivorGrant
 */

 survivorGrantRoute.get("/detail/:survivorGrantId", isAuthenticate, async (req, res) => {
    try {
        let survivorGrantData= await survivorGrant.findOne({$and:[{ _id: req.params.survivorGrantId },{is_deleted:false}]}).populate([
			{
				path: "name_of_grant_compensation",
				select: "name amount  installment_number purpose_of_grant"
		    },
			{
				path: "grant_status",
				select: "name"
			},
			{
				path: "escalations.escalation_status",
				select: "name"
			},
			{
				path: "purpose_of_grant_id",
				select: "name"
			}
	]).sort({_id:-1});

        message = {
            error: false,
            message: "Detail survivor grant list",
            data: survivorGrantData,
        };
		infoLogger.info({
			req: req.params, 
			res: survivorGrantData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});



/**
 * This method is to create survivorGrant
 */


 survivorGrantRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const survivorGrantData = new survivorGrant(req.body);
		let survivorId = survivorGrantData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		console.log(survivorData?.date_of_trafficking);
		console.log(survivorGrantData?.applied_on);
		console.log(survivorGrantData?.received_on);
		if (survivorGrantData?.applied_on <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "applied on date should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		if (survivorGrantData?.applied_on >= survivorGrantData?.received_on) {
			message = {
				error: true,
				message: "Received on date should be after applied on date",
			};
			return res.status(200).send(message);
		}
		let result = await survivorGrantData.save();
		result = await survivorGrantData.populate([
			{
				path: "survivor",
				select: "organization user_id survivor_id survivor_name"
			}
		]);
		if (result?.survivor?.user_id) {
			let sendNotificationData = await sendNotification({
				user: result?.survivor?.user_id,
				title: "Survivor Grant Record Added",
				description: "Congratulation , "+ result?.survivor?.survivor_id +" with name "+ result?.survivor?.survivor_name +" has new grant sanctioned."
			});
		}
		message = {
			error: false,
			message: "survivor grant Added Successfully!",
			data: result,
		};
		infoLogger.info({
			req: req.body, 
			res: result, 
			method:"POST", 
			url: req.originalUrl, 
			error: false
		});
		return res.status(200).send(message);
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: err, 
			method:"POST", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "survivor grant Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update survivor grant
 */
 survivorGrantRoute.patch("/update/:survivorGrantId", isAuthenticate, async (req, res) => {
	try {
		const CheckSurvivorGrantData = await survivorGrant.findOne({$and:[
			{ _id: req.params.survivorGrantId},{is_deleted:false}
		]})
		if (!CheckSurvivorGrantData) return res.status(200).send({error: true, message: "Survivor grant not found"}) 
		let survivorId = CheckSurvivorGrantData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.applied_on && (new Date(req.body.applied_on) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Applied on date should be after date of trafficking"})
		

		/**
		 * checking to date greater than form date or not
		 */

		if (req.body.received_on && (new Date(req.body.received_on) <= new Date(CheckSurvivorGrantData?.applied_on))) return res.status(200).send({ error: true, message: "Recceived on should be after Applied on date"})

	

		const survivorGrantData = await survivorGrant.find({$and:[
			{ _id: req.params.survivorGrantId},{is_deleted:false}
		]})
		const result = await survivorGrant.findOneAndUpdate({ _id: req.params.survivorGrantId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorGrants",
					survivor: result.survivor,
                    old_data: JSON.stringify(survivorGrantData),
                    description: "SURVIVOR GRANT data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "grant",
                    note: "Change log genearted for survivor grant"
                });
            }
			message = {
				error: false,
				message: "survivor Grant updated successfully!",
				result
			};
			infoLogger.info({
				req: req.body, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor grant not updated",
			};
			errorLogger.error({
				req: req.body, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
			res.status(200).send(message);
		}
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});

/**
 * Add escalation, installment, utilization
 */
survivorGrantRoute.patch("/add-escalation-installment-utilization/:survivorGrantId", isAuthenticate, async (req, res) => {
	try {
		const survivorGrantData = await survivorGrant.find({$and:[
			{ _id: req.params.survivorGrantId},{is_deleted:false}
		]})
		const result = await survivorGrant.findOneAndUpdate({ _id: req.params.survivorGrantId}, {$push: {escalations: req.body.escalation, installments: req.body.installment, utilization_plans: req.body.utilization}}, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorGrants",
					survivor: result.survivor,
                    old_data: JSON.stringify(survivorGrantData),
                    description: "SURVIVOR GRANT data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "grant",
                    note: "Change log genearted for survivor grant"
                });
            }
			message = {
				error: false,
				message: "survivor Grant updated!",
				result
			};
			infoLogger.info({
				req: req.body, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor grant not updated",
			};
			errorLogger.error({
				req: req.body, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
			res.status(200).send(message);
		}
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});

/**
 * Delete escalation, installment, utilization
 */
 survivorGrantRoute.patch("/delete-escalation-installment-utilization/:survivorGrantId", async (req, res) => {
	try {
		const survivorGrantData = await survivorGrant.findOne({_id: req.params.survivorGrantId})
		let result;
		//to delete installments
		if (req.body.type === "installments") {
			result = await survivorGrant.updateOne(
				{ 
					_id: req.params.survivorGrantId, 
					"installments._id": req.body.refId 
				},
				{
					$set: {
						"installments.$.is_deleted": true,
						"installments.$.deleted_at": Date.now(),
						"installments.$.deleted_by": req.body.userId,
						"installments.$.deleted_by_ref": req.body.userType
					}
				}
			);
		}

		//to delete utilization_plans
		if (req.body.type === "utilization_plans") {
			result = await survivorGrant.updateOne(
				{ 
					_id: req.params.survivorGrantId, 
					"utilization_plans._id": req.body.refId 
				},
				{
					$set: {
						"utilization_plans.$.is_deleted": true,
						"utilization_plans.$.deleted_at": Date.now(),
						"utilization_plans.$.deleted_by": req.body.userId,
						"utilization_plans.$.deleted_by_ref": req.body.userType
					}
				}
			);
		}

		//to delete escalations
		if (req.body.type === "escalations") {
			result = await survivorGrant.updateOne(
				{ 
					_id: req.params.survivorGrantId, 
					"escalations._id": req.body.refId 
				},
				{
					$set: {
						"escalations.$.is_deleted": true,
						"escalations.$.deleted_at": Date.now(),
						"escalations.$.deleted_by": req.body.userId,
						"escalations.$.deleted_by_ref": req.body.userType
					}
				}
			);
		}

		//after delete
		if (result) {
			if (req.body.userId) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorGrants",
					survivor: result.survivor,
                    old_data: JSON.stringify(survivorGrantData),
                    description: "SURVIVOR GRANT data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.userId,
                    changed_by_ref: "users",
                    module: "grant",
                    note: "Change log genearted for survivor grant"
                });
            }
			message = {
				error: false,
				message: "survivor Grant "+req.body.type+" updated!",
				result
			};
			infoLogger.info({
				req: req.body, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor grant "+req.body.type+" not updated",
			};
			errorLogger.error({
				req: req.body, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
			res.status(200).send(message);
		}
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

survivorGrantRoute.delete("/delete/:survivorGrantId", isAuthenticate, async (req, res) => {
	try {
		const result = await  survivorGrant.deleteOne({ _id: req.params.survivorGrantId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "survivor Grant deleted successfully!",
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
			data: err,
		};
		res.status(200).send(message);
	}
});



/**
 * This method is to delete survivor grant
 */
survivorGrantRoute.patch("/delete/:survivorGrantId", async (req, res) => {
	try {
		const survivorGrantData = await survivorGrant.find({$and:[
			{ _id: req.params.survivorGrantId},{is_deleted:false}
		]})
		const result = await survivorGrant.findOneAndUpdate({ _id: req.params.survivorGrantId },
			{is_deleted:true , deleted_at:Date.now(), deleted_by:req.body.deleted_by, deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorGrants",
					survivor: result.survivor,
                    old_data: JSON.stringify(survivorGrantData),
                    description: "SURVIVOR GRANT data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "grant",
                    note: "Change log genearted for survivor garnt"
                });
            }
			message = {
				error: false,
				message: "survivor Grant deleted successfully!",
				result
			};
			infoLogger.info({
				req: req.params, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Operation failed!",
			};
			errorLogger.error({
				req: req.params, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});

			res.status(200).send(message);
		}
	} catch (err) {
		errorLogger.error({
			req: req.params, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
		res.status(200).send(message);
	}
});


/**
 *  This method is to search survivor grant
 */

 survivorGrantRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await survivorGrant.find({
			"$or":[{"application_number":searchText},{"name_of_grant_compensation":searchText}]}).populate({
				path:"name_of_grant_compensation",
				select:"purpose_of_grant"
			})
	
		if (result) {
			message = {
				error: false,
				message: "survivor grant search successfully!",
				data:result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor grant search failed",
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



module.exports = survivorGrantRoute;
