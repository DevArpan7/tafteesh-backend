require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorPc = require("../models/survivor_pc");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const sendNotification = require("../helper/sendNotification");
const errorLogger = errorLoggerModule();
const SurvivorPcRoute = express.Router();
const SurvivorDocument = require("../models/survivor_document");
const SurvivorGrant = require("../models/survivor_grant");
const SurvivorLoan = require("../models/survivor_loan");
const isAuthenticate = require("../middleware/authcheck");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorInvestigation = require("../models/survivor_investigation");
const SurvivorChargeSheet = require("../models/survivor_chargesheet");
const SurvivorLawyer = require("../models/survivor_lawyer");
const PcWhy = require("../models/pcmodel/pc_why");
const PcCurrentStatus = require("../models/pcmodel/pc_current_status");
const ResOfProsecution = require("../models/pcmodel/result_of_prosecution");
const EscalatedType = require("../models/pcmodel/escalated_type");
const EscalatedReason = require("../models/pcmodel/escalated_reason");
const Court = require("../models/court");
const DocumentType = require("../models/pcmodel/document_type");
const PcResult = require("../models/result_master/pc_result");
const SurvivorProfile = require("../models/survivor_profile");


/**
 * This method is to find all SurvivorPc
 * @param str SurvivorProfileId
 * 
 */

 SurvivorPcRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorPcData = await SurvivorPc.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path: "survivor",
				select: "survivor_name"
			},
			{
				path: "why",
				select: "name"
			},
			{
				path: "court",
				select: "name"
			},
			{
				path: "current_status",
				select: "name"
			},
			{
				path: "result_of_prosecution",
				select: "name"
			},
			{
				path: "document_type",
				select: "name"
			},
			{
				path: "escalation_type",
				select: "name"
			},
			{
				path: "escalation_reason",
				select: "name"
			},
			
			
		]).sort({_id:-1});
		let docdetails = {};

		const docData = await SurvivorDocument.find({$and:[{survivor_profile: req.params.SurvivorProfileId},{is_deleted: false}]}).populate([
			{
				path:"document_type",
				select:"name"
			}
		]).select("survivor_profile document_type file");
		const grantData = await SurvivorGrant.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted: false}]}).select("survivor reference_document");
		const loanData = await SurvivorLoan.find({$and:[{ survivor: req.params.SurvivorProfileId }, {is_deleted: false}]}).select("survivor reference_document");

		const pcData = await await SurvivorPc.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).select("survivor document_url");
		
		docdetails.docData={
			document_data:docData.filter(e => e.file != '')
		}
		docdetails.grantData = grantData;
		
		docdetails.loanData = loanData;
		
		docdetails.pcData = pcData;

		let count = SurvivorPcData.length;
		//documentdata  = 


		let customPcData = JSON.parse(JSON.stringify(SurvivorPcData))

		customPcData.map(e => {
			e.survivor_name = e?.survivor?.survivor_name
			e.pc_started_date =  moment((e?.started_date != null || e?.started_date != undefined) ? e?.started_date.split("T")[0] : e?.started_date).format('DD-MMM-YYYY')
			e.pc_court = e?.court?.name
			e.pc_status = e?.current_status?.name
			return e
		})

		let survivorFirData = await SurvivorFir.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path:"policeStation",
				select:"name"
			}
		]).sort({_id:-1});
		let survivorInvestigationData = await SurvivorInvestigation.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path:"inv_agency_type",
				select:"name"
			},
			{
				path:"inv_agency_name",
				select:"name"
			}
		]).sort({_id:-1});
		let survivorChargeSheetData = await SurvivorChargeSheet.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).sort({_id:-1});
		let survivorLawyerData = await SurvivorLawyer.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path:"name",
				select:"name"
			},
			{
				path:"type",
				select:"name"
			}
		]).sort({_id:-1});
		let PcWhyData = await PcWhy.find({is_deleted:false}).sort({_id:-1});
		let PcCurrentStatusData = await PcCurrentStatus.find({is_deleted:false}).sort({_id:-1});
		let ResOfProsecutionData = await ResOfProsecution.find({is_deleted:false}).sort({_id:-1});
		let EscalatedTypeData = await EscalatedType.find({is_deleted:false}).sort({_id:-1});
		let EscalatedReasonData = await EscalatedReason.find({is_deleted:false}).sort({_id:-1});
		let CourtData = await Court.find({is_deleted:false}).sort({_id:-1});
		let DocumentTypeData = await DocumentType.find({is_deleted:false}).sort({_id:-1});
		let PcResultData = await PcResult.find({is_deleted:false}).sort({_id:-1});



        message = {
            error: false,
            message: "All SurvivorPc list",
            data: customPcData,
			//pcdocument,
			totalcount:count,
			docdetails,
			SurvivorDocumentData: docData,
			SurvivorFirData: survivorFirData,
			SurvivorInvestigationData: survivorInvestigationData,
			SurvivorChargesheetData: survivorChargeSheetData,
			SurvivorLawyerData: survivorLawyerData,
			masterPcWhyData: PcWhyData,
			masterPcCurrentStatusData: PcCurrentStatusData,
			masterResOfProsecutionData: ResOfProsecutionData,
			masterEscalatedTypeData: EscalatedTypeData,
			masterEscalatedReasonData: EscalatedReasonData,
			masterCourtData: CourtData,
			masterDocumentTypeData: DocumentTypeData,
			masterPcResultData: PcResultData


        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorPcData, 
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
            data: String(err),
        };
        res.status(200).send(message);
    }
});


/**
 * This method is to find detail SurvivorPc
 * @param str SurvivorPcId
 * 
 */

 SurvivorPcRoute.get("/detail/:SurvivorPcId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorPcData = await SurvivorPc.findOne({$and:[{ _id: req.params.SurvivorPcId },{is_deleted:false}]}).populate([
			{
				path: "survivor",
				select: "survivor_name"
			},
			{
				path: "why",
				select: "name"
			},
			{
				path: "court",
				select: "name"
			},
			{
				path: "current_status",
				select: "name"
			},
			{
				path: "result_of_prosecution",
				select: "name"
			},
			{
				path: "document_type",
				select: "name"
			},
			{
				path: "escalation_type",
				select: "name"
			},
			{
				path: "escalation_reason",
				select: "name"
			},
			
			
		]).sort({_id:-1});
		
		let docdetails = {};

		const docData = await SurvivorDocument.find({$and:[{ survivor_profile: SurvivorPcData?.survivor?._id  }]}).populate([
			{
				path:"document_type",
				select:"name"
			}
		]).select("document_type file createdAt");
		const grantData = await SurvivorGrant.find({$and:[{ survivor: SurvivorPcData?.survivor?._id },{is_deleted: false}]}).select("survivor reference_document createdAt");
		const loanData = await SurvivorLoan.find({$and:[{survivor: SurvivorPcData?.survivor?._id }, {is_deleted: false}]}).select("survivor reference_document createdAt");
		
		docdetails.docData = {
			document_data: docData.filter(e => e.file),
		}
		docdetails.grantData = {
			grant_data: grantData,
		}
		docdetails.loanData = {
			loan_data: loanData,
		}
		docdetails.SurvivorPcData = {
			file: SurvivorPcData?.document_url,
			createdAt: SurvivorPcData?.createdAt
		}

        message = {
            error: false,
            message: "All Survivor PC list",
            data: SurvivorPcData,
			docdetails
			
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorPcData, 
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
 * This method is to create all SurvivorPc
 * @param str SurvivorProfileId
 * 
 */

 SurvivorPcRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorPcData = new  SurvivorPc(req.body);
		let survivorId = SurvivorPcData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		console.log(survivorData?.date_of_trafficking);
		console.log(SurvivorPcData?.started_date);
		if (SurvivorPcData?.started_date <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "Started date should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		let result = await SurvivorPcData.save();
		result = await SurvivorPcData.populate([
			{
				path: "survivor",
				select: "organization user_id survivor_id survivor_name"
			}
		]);
		if (result?.survivor?.user_id) {
			let sendNotificationData = await sendNotification({
				user: result?.survivor?.user_id,
				title: "Survivor PC Record Added",
				description: "PC record for "+ result?.survivor?.survivor_id +" added successfully"
			});
		}
		message = {
			error: false,
			message: "Survivor PC Added Successfully!",
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
			message: "Survivor PC Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update SurvivorPc
 * @param str SurvivorProfileId
 */
SurvivorPcRoute.patch("/update/:SurvivorPcId", isAuthenticate, async (req, res) => {
	try {
		const CheckSurvivorPcData = await SurvivorPc.findOne({$and:[
			{ _id: req.params.SurvivorPcId},{is_deleted:false}
		]})
		if (!CheckSurvivorPcData) return res.status(200).send({error: true, message: "Survivor Pc not found"}) 
		let survivorId = CheckSurvivorPcData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.started_date && (new Date(req.body.started_date) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "started date should be after date of trafficking"})
		

		const SurvivorPcData = await SurvivorPc.find({$and:[
			{ _id: req.params.SurvivorPcId},{is_deleted:false}
		]})
		const result = await SurvivorPc.findOneAndUpdate({ _id: req.params.SurvivorPcId }, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorPcs",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorPcData),
                    description: "SURVIVOR PC data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "pc",
                    note: "Change log genearted for survivor pc"
                });
            }
			message = {
				error: false,
				message: "Survivor PC updated successfully!",
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
				message: "Survivor PC not updated",
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
 * This method is to delete SurvivorPc
 * @param {string} SurvivorProfileId
 */
//  SurvivorPcRoute.delete("/delete/:SurvivorPcId", async (req, res) => {
// 	try {
// 		const result = await SurvivorPc.deleteOne({ _id: req.params.SurvivorPcId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "SurvivorPc deleted successfully!",
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

/**
 * This method is to delete SurvivorPc
 * @param {string} SurvivorPcId
 */
SurvivorPcRoute.patch("/delete/:SurvivorPcId", async (req, res) => {
	try {
		const SurvivorPcData = await SurvivorPc.find({$and:[
			{ _id: req.params.SurvivorPcId},{is_deleted:false}
		]})
		const result = await SurvivorPc.findOneAndUpdate({ _id: req.params.SurvivorPcId },{is_deleted: true, deleted_at: Date.now(),deleted_by:req.body.deleted_by,deleted_by_ref:req.body.deleted_by_ref},{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorPcs",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorPcData),
                    description: "SURVIVOR PC data deleted",
                    new_data:  JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "pc",
                    note: "Change log genearted for survivor pc"
                });
            }
			message = {
				error: false,
				message: "Survivor PC deleted successfully!",
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

module.exports = SurvivorPcRoute;