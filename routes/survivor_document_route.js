require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorDocument = require("../models/survivor_document");
const SurvivorDocumentRoute = express.Router();
const Document = require("../models/document");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();

/**
 * This method is to find detail Survivor Documents
 *  @param str survivor_document_id
 */

SurvivorDocumentRoute.get("/detail/:survivor_document_id", isAuthenticate, async (req, res) => {
    try {
        let SurvivorDocumentData = await SurvivorDocument.findOne({$and:[{_id: req.params.survivor_document_id},{is_deleted:false}]}).populate({
			path:"document_type",
			select:"name is_required"
		});

        message = {
            error: false,
            message: "Survivor Profile documents",
            data: SurvivorDocumentData,
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorDocumentData, 
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
 * This method is to find all Survivor Documents
 */

 SurvivorDocumentRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorDocumentData = await SurvivorDocument.find({$and:[{survivor_profile: req.params.SurvivorProfileId},{is_deleted:false}]}).populate([
			{
				path:"document_type",
				select:"name is_required"
			},
			{
				path:"survivor_profile",
				select:"survivor_name"
			}
		]);
		let documentData = await Document.find({is_deleted:false});

		
		let customDocumentData = JSON.parse(JSON.stringify(SurvivorDocumentData))

		customDocumentData.map(e => {
			e.document_type_name = e?.document_type?.name
			e.updated_at =  moment(e?.updatedAt.split("T")[0]).format('DD-MMM-YYYY')
			e.custom_file_name = e?.survivor_profile?.survivor_name + "_" + e?.file.split("/").reverse()[0]

			return e
		})
        message = {
            error: false,
            message: "Survivor Profile documents",
            data: customDocumentData,
			masterDocumentData:documentData
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorDocumentData, 
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
 * This method is to create Survivor Documents
 */
SurvivorDocumentRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const existingDoc = await SurvivorDocument.findOne({$and: [{survivor_profile: req.body.survivor_profile}, {document_type: req.body.document_type}, {active: true}]})
		if (existingDoc) {
			message = {
				error: true,
				message: "Survivor Document already exist!"
			};
			infoLogger.info({
				req: req.body, 
				res: existingDoc, 
				method:"POST", 
				url: req.originalUrl, 
				error: false
			});
	
			return res.status(200).send(message);
		} else {
			req.body.active = true;
			const SurvivorDocumentData = new SurvivorDocument(req.body);
			const result = await SurvivorDocumentData.save();
			message = {
				error: false,
				message: "Survivor Document Added Successfully!",
				data: result,
			};
			errorLogger.error({
				req: req.body, 
				res:result, 
				method:"POST", 
				url: req.originalUrl, 
				error: true
			});
			return res.status(200).send(message);
		}
		
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
			message: "SurvivorDocument Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Survivor Document
 */
 SurvivorDocumentRoute.patch("/update/:survivor_document_id", isAuthenticate, async (req, res) => {
	try {
		const SurvivorDocumentData = await SurvivorDocument.find({$and:[
			{ _id: req.params.survivor_document_id},{is_deleted:false}
		]})
		const result = await SurvivorDocument.findOneAndUpdate(
			{
				$and: [
					{_id: req.params.survivor_document_id},
					{survivor_profile: req.body.survivor_profile}, 
					{document_type: req.body.document_type}
				]
			},
			{
				active: true,
				about: req.body.about,
				file: req.body.file
			},
			{
				new: true
			}
		)

		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorDocuments",
					survivor: result.survivor_profile,
                    old_data: JSON.stringify(SurvivorDocumentData),
                    description: "SURVIVOR DOCUMENT data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "document",
                    note: "Change log genearted for survivor document"
                });
            }
			message = {
				error: false,
				message: "Survivor Document Added Successfully!",
				data: result,
			};
			infoLogger.info({
				req: req.body, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			return res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Survivor document not found"
			};
			errorLogger.error({
				req: req.body, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
			return res.status(200).send(message);
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
			message: "SurvivorDocument add Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to toggle ative stuaus Survivor Documents
 * * @param str SurvivorProfileId
 */

SurvivorDocumentRoute.patch("/toggle-active/:SurvivorDocumentId", isAuthenticate, async (req, res) => {
	try {
		const result = await SurvivorDocument.findOneAndUpdate({ _id: req.params.SurvivorDocumentId }, {inactive_reason: req.body.inactive_reason, active: false}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Survivor Document active status changed!",
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
				message: "Survivor Document not updated",
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
 * This method is to delete Survivor Documents
 * * @param str SurvivorProfileId
 */

//  SurvivorDocumentRoute.delete("/delete/:SurvivorDocumentId", async (req, res) => {
// 	try {
// 		const result = await SurvivorDocument.deleteOne({ _id: req.params.SurvivorDocumentId});
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Survivor Document deleted successfully!",
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



 SurvivorDocumentRoute.patch("/delete/:SurvivorDocumentId", async (req, res) => {
	try {
		const SurvivorDocumentData = await SurvivorDocument.find({$and:[
			{ _id: req.params.SurvivorDocumentId},{is_deleted:false}
		]})
		const result = await SurvivorDocument.findOneAndUpdate({ _id: req.params.SurvivorDocumentId },
			{is_deleted:true,deleted_at:Date.now(),deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorDocuments",
					survivor: result.survivor_profile,
                    old_data: JSON.stringify(SurvivorDocumentData),
                    description: "SURVIVOR DOCUMENT data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "document",
                    note: "Change log genearted for survivor document"
                });
            }
			message = {
				error: false,
				message: "Survivor Documents deleted successfully!",
				result
			};
			infoLogger.info({
				req: req.params, 
				res: JSON.stringify(result), 
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


module.exports = SurvivorDocumentRoute;
