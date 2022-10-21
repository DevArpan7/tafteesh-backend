require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorVc = require("../models/survivor_vc");
const VcEscalation = require("../models/vc_escalation");
const SurvivorVcRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const VcStatus = require("../models/status_master/vc_status");
const Court = require("../models/court");
const AuthorityType = require("../models/authority_type");
const Authority = require("../models/authority");
const SurvivorLawyer = require("../models/survivor_lawyer");
const VcResult = require("../models/result_master/vc_result");
const SurvivorProfile = require("../models/survivor_profile");

/**
 * This method is to find all SurvivorVc
 */

 SurvivorVcRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorVcData = await SurvivorVc.find({
			$and:[
				{ survivor: req.params.SurvivorProfileId },
				{is_deleted:false}
			]}).populate([
				{
					path: "survivor",
					select: "survivor_name"
				},
				{
					path: "applied_at",
					select: "name"
				},
				{
					path: "vc_status",
					select: "name"
				},
				{
					path: "lawyer",
					select: "name"
				},	
				
			]).sort({_id:-1});

		let count = SurvivorVcData.length;

		
		let customVcData = JSON.parse(JSON.stringify(SurvivorVcData))

		customVcData.map(e => {
			e.applied_vc_date = moment(e?.applied_date.split("T")[0]).format('DD-MMM-YYYY');
			e.amount_received_in_bank_date_Vc =  moment((e?.amount_received_in_bank_date != undefined || e?.amount_received_in_bank_date != null) ? e?.amount_received_in_bank_date.split("T")[0] : e?.amount_received_in_bank_date).format('DD-MMM-YYYY');
			e.survivor_name = e?.survivor?.survivor_name
			e.applied_at_vc = e?.applied_at?.name
			e.lawyer_name = e?.lawyer?.name
			e.totalEscalation_vc = JSON.stringify(e?.totalEscalation)
			return e
		})
		let vcStatusData = await VcStatus.find({is_deleted:false}).sort({_id:-1});
		let CourtData = await Court.find({is_deleted:false}).sort({_id:-1});
		let AuthorityTypeData = await AuthorityType.find({is_deleted:false}).sort({_id:-1});
		let AuthorityData = await Authority.find({is_deleted:false}).sort({_id:-1});
		let LawyerData = await SurvivorLawyer.find({
			$and:[
				{ survivor: req.params.SurvivorProfileId },
				{is_deleted:false}
			]}).populate([
				{
					path:"name",
					select:"name"
				},
				{
					path:"type",
					select:"name"
				}
			]).sort({_id:-1});
			let VcResultData = await VcResult.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All SurvivorVc list",
            data: customVcData,
			totalcount:count,
			masterVCStatusData:vcStatusData,
			masterCourtData:CourtData,
			masterAuthorityTypeData:AuthorityTypeData,
			masterAuthorityData:AuthorityData,
			SurvivorLawyerData:LawyerData,
			masterVcResultData:VcResultData
        };
		infoLogger.info({
			req: req.params, 
			res: {SurvivorVcData,count},
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
 * This method is for detail SurvivorVc
 */

 SurvivorVcRoute.get("/detail/:SurvivorVcId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorVcData = await SurvivorVc.findOne({
			$and:[
				{ _id: req.params.SurvivorVcId},
				{is_deleted:false}
			]}).populate([
				{
					path: "applied_at",
					select: "name"
				},
				{
					path: "lawyer",
					select: "name"
				},	
				
			]).sort({_id:-1});

		//let count = SurvivorVcData.length;

        message = {
            error: false,
            message: "All Survivor VC list",
            data: SurvivorVcData,
			//totalcount:count
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorVcData,
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
 * This method is to create SurvivorVc
 */


 SurvivorVcRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorVcData = new SurvivorVc(req.body);
		let survivorId = SurvivorVcData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		console.log(survivorData?.date_of_trafficking);
		console.log(SurvivorVcData?.applied_date);
		console.log(SurvivorVcData?.date_of_order);
		console.log(SurvivorVcData?.amount_received_in_bank_date);
		if ( SurvivorVcData?.applied_date <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "applied date should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		if ( SurvivorVcData?.date_of_order <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "date of order should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		if ( SurvivorVcData?.amount_received_in_bank_date <= SurvivorVcData?.applied_date) {
			message = {
				error: true,
				message: "Amount recevied in bank date should be after applied date",
			};
			return res.status(200).send(message);
		}
		const result = await SurvivorVcData.save();
		message = {
			error: false,
			message: "Survivor VC Added Successfully!",
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
			res: String(err), 
			method:"POST", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Survivor VC Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update SurvivorVc
 */

 SurvivorVcRoute.patch("/update/:SurvivorVcId", isAuthenticate, async (req, res) => {
	try {
		const CheckSurvivorVcData = await SurvivorVc.findOne({$and:[
			{ _id: req.params.SurvivorVcId},{is_deleted:false}
		]})
		if (!CheckSurvivorVcData) return res.status(200).send({error: true, message: "Survivor lawyer not found"}) 
		let survivorId = CheckSurvivorVcData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		console.log(survivorData?.date_of_trafficking);
		console.log(CheckSurvivorVcData?.applied_date);
		console.log(CheckSurvivorVcData?.date_of_order);
		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.applied_date && (new Date(req.body.applied_date) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Applied date  should be after date of trafficking"})
		

		/**
		 * checking to date greater than form date or not
		 */

		if (req.body.date_of_order && (new Date(req.body.date_of_order) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Date of Order should be after date of trafficking"})

		if (req.body.amount_received_in_bank_date && (new Date(req.body.amount_received_in_bank_date) <= new Date(CheckSurvivorVcData?.applied_date))) return res.status(200).send({ error: true, message: "amount in bank date should be after applied date"})
			
			
		const SurvivorVcData = await SurvivorVc.find({$and:[
			{ _id: req.params.SurvivorVcId},{is_deleted:false}
		]})
		const result = await SurvivorVc.findOneAndUpdate({ _id: req.params.SurvivorVcId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorVcs",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorVcData),
                    description: "Survivor Vc data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "vc",
                    note: "Change log genearted for Survivor Vc"
                });
            }
			message = {
				error: false,
				message: "Survivor VC updated successfully!",
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
				message: "Survivor VC not updated",
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
			res: String(err), 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete SurvivorVc
 */

 SurvivorVcRoute.delete("/delete/:SurvivorVcId", isAuthenticate, async (req, res) => {
	try {
		const result = await  SurvivorVc.deleteOne({ _id: req.params.SurvivorVcId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Survivor VC deleted successfully!",
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

SurvivorVcRoute.patch("/delete/:SurvivorVcId", async (req, res) => {
	try {
		const SurvivorVcData = await SurvivorVc.find({$and:[
			{ _id: req.params.SurvivorVcId},{is_deleted:false}
		]})
		const result = await  SurvivorVc.findOneAndUpdate({ _id: req.params.SurvivorVcId},
			{is_deleted: true, deleted_at: Date.now(),deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorVcs",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorVcData),
                    description: "Survivor Vc data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "vc",
                    note: "Change log genearted for Survivor Vc"
                });
            }
			message = {
				error: false,
				message: "Survivor VC deleted successfully!",
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
			res: String(err), 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

module.exports = SurvivorVcRoute;