require("dotenv").config();
const express = require("express");
const SurvivorInvestigation = require("../models/survivor_investigation");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorInvestigationRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const SurvivorFir = require("../models/survivor_fir");
const InvAgencyType = require("../models/type_of_agency");
const InvestigationResult = require("../models/result_master/investigation_result");
const InvestigationStatus = require("../models/status_master/investigation_status");

/**
 * This method is to find all SurvivorInvestigation
 * @param str SurvivorProfileId
 * 
 */

 SurvivorInvestigationRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorInvestigationData = await SurvivorInvestigation.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path:"inv_status",
				select:"name"
			},
			{
				path:"inv_agency_type",
				select:"name"
			},
			{
				path:"inv_agency_name",
				select:"name"
			}
		]).sort({_id:-1});

		let custominvestigationData = JSON.parse(JSON.stringify(SurvivorInvestigationData))

		custominvestigationData.map(e => {
			e.agency_type = e?.inv_agency_type?.name
			e.agency_name = e?.inv_agency_name?.name
			return e
		})

		let FirData = await SurvivorFir.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path:"policeStation",
				select:"name"
			}
		]).sort({_id:-1});

		let InvAgencyTypeData = await InvAgencyType.find({is_deleted:false}).sort({_id:-1});
		let InvestigationResultData = await InvestigationResult.find({is_deleted:false}).sort({_id:-1});
		let InvestigationStatusData = await InvestigationStatus.find({is_deleted:false}).sort({_id:-1});
		

        message = {
            error: false,
            message: "All SurvivorInvestigation list",
            data: custominvestigationData,
			survivorFirData:FirData,
			masterInvAgencyTypeData: InvAgencyTypeData,
			masterInvestigationResultData: InvestigationResultData,
			masterInvestigationStatusData: InvestigationStatusData
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorInvestigationData, 
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
 * This method is to find all SurvivorInvestigation
 * @param str SurvivorProfileId
 * 
 */

 SurvivorInvestigationRoute.get("/detail/:invId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorInvestigationData = await SurvivorInvestigation.findOne({ _id: req.params.invId },{is_deleted:false}).populate([
			{
				path:"inv_status",
				select:"name"
			},
			{
				path:"inv_agency_type",
				select:"name"
			},
			{
				path:"inv_agency_name",
				select:"name"
			}
		]).sort({_id:-1});


        message = {
            error: false,
            message: "Detail SurvivorInvestigation list",
            data: SurvivorInvestigationData,
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorInvestigationData, 
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
 * This method is to find all SurvivorInvestigation by survivorprofileId and survivor Investigation Id
 * @param str SurvivorProfileId , SurvivorfirId
 * 
 */

 SurvivorInvestigationRoute.get("/list/:SurvivorProfileId/:SurvivorfirId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorInvestigationData = await SurvivorInvestigation.find({$and:[{ survivor: req.params.SurvivorProfileId },{ref_fir:req.params.SurvivorfirId},{is_deleted:false}]}).populate([
			{
				path:"inv_status",
				select:"name"
			},
			{
				path:"inv_agency_type",
				select:"name"
			},
			{
				path:"inv_agency_name",
				select:"name"
			}
		]).sort({_id:-1});
		let custominvestigationData = JSON.parse(JSON.stringify(SurvivorInvestigationData))

		custominvestigationData.map(e => {
			e.agency_type = e?.inv_agency_type?.name
			e.agency_name = e?.inv_agency_name?.name
			return e
		})

		let FirData = await SurvivorFir.find({$and:[{ survivor: req.params.SurvivorProfileId },{_id:req.params.SurvivorfirId},{is_deleted:false}]}).populate([
			{
				path:"policeStation",
				select:"name"
			}
		]).sort({_id:-1});

		let InvAgencyTypeData = await InvAgencyType.find({is_deleted:false}).sort({_id:-1});
		let InvestigationResultData = await InvestigationResult.find({is_deleted:false}).sort({_id:-1});
		let InvestigationStatusData = await InvestigationStatus.find({is_deleted:false}).sort({_id:-1});
		




        message = {
            error: false,
            message: "All SurvivorInvestigation list",
            data: custominvestigationData,
			survivorFirData:FirData,
			masterInvAgencyTypeData: InvAgencyTypeData,
			masterInvestigationResultData: InvestigationResultData,
			masterInvestigationStatusData: InvestigationStatusData
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorInvestigationData, 
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
 * This method is to create all SurvivorInvestigation
 * @param str SurvivorProfileId
 * 
 */

 SurvivorInvestigationRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorInvestigationData = new  SurvivorInvestigation(req.body);
		const result = await SurvivorInvestigationData.save();
		message = {
			error: false,
			message: "Survivor Investigation Added Successfully!",
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
			message: "SurvivorInvestigation Failed!",
			data: String(err),
		};


		return res.status(200).send(message);
	}
});

/**
 * This method is to update Survivor investigatin
 * @param str SurvivorProfileId
 */
 SurvivorInvestigationRoute.patch("/update/:SurvivorInvestigationId", isAuthenticate, async (req, res) => {
	try {
		const SurvivorInvestigationData = await SurvivorInvestigation.find({$and:[
			{ _id: req.params.SurvivorInvestigationId},{is_deleted:false}
		]})
		const result = await SurvivorInvestigation.findOneAndUpdate({ _id: req.params.SurvivorInvestigationId }, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorInvestigations",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorInvestigationData),
                    description: "INVESTIGATION data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "investigation",
                    note: "Change log genearted for investigation"
				});
			}
			message = {
				error: false,
				message: "Survivor Investigation updated successfully!",
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
				message: "SurvivorInvestigation not updated",
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
 * This method is to delete Survivor Investigation
 * @param str SurvivorProfileId
 */
 SurvivorInvestigationRoute.delete("/delete/:SurvivorInvestigationId", isAuthenticate, async (req, res) => {
	try {
		const result = await SurvivorInvestigation.deleteOne({ _id: req.params.SurvivorInvestigationId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Survivor investigation deleted successfully!",
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



SurvivorInvestigationRoute.patch("/delete/:SurvivorInvestigationId", async (req, res) => {
	try {
		const SurvivorInvestigationData = await SurvivorInvestigation.find({$and:[
			{ _id: req.params.SurvivorInvestigationId},{is_deleted:false}
		]})
		const result = await  SurvivorInvestigation.findOneAndUpdate({ _id: req.params.SurvivorInvestigationId },
			{is_deleted: true, deleted_at: Date.now(), deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorInvestigations",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorInvestigationData),
                    description: "INVESTIGATION data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "investigation",
                    note: "Change log genearted for investigation"
                });
            }
			message = {
				error: false,
				message: "Survivor investigation deleted successfully!",
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

/**
 *  This method is to search survivor investigation
 */

 SurvivorInvestigationRoute.post("/search",isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await SurvivorInvestigation.find({
			"$or":[{"type_of_investigation_agency":{"$regex":searchText,$options: 'i' }},{"name_of_agency":{"$regex":searchText,$options: 'i' }},{"name_of_inv_officer":{"$regex":searchText,$options: 'i' }}]})
	
		if (result) {
			message = {
				error: false,
				message: "survivor investigation search successfully!",
				data:result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor investigation search failed",
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




module.exports = SurvivorInvestigationRoute;