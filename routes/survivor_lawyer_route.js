require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorLawyer = require("../models/survivor_lawyer");
const SurvivorLawyerRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const errorLogger = errorLoggerModule();
const State = require("../models/state");
const LawyerCategory = require("../models/lawyer_category");
const Lawyer = require("../models/lawyer");
const SurvivorProfile = require("../models/survivor_profile");


/**
 * This method is to find all SurvivorLawyer
 * @param str SurvivorProfileId
 * 
 */

 SurvivorLawyerRoute.get("/list/:SurvivorProfileId", async (req, res) => {
    try {
        let SurvivorLawyerData = await SurvivorLawyer.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
            {
                path:"name",
                select:"name"
            },
            {
                path:"type",
                select:"name"
            }
           
        ]).sort({_id:-1});

		let customLawyerData = JSON.parse(JSON.stringify(SurvivorLawyerData))

		customLawyerData.map(e => {
			e.lawyer_name = e?.name?.name
			e.lawyer_type = e?.type?.name
			e.fromDate =  moment(e?.from_date.split("T")[0]).format('DD-MMM-YYYY')
			e.toDate =  moment(e?.to_date.split("T")[0]).format('DD-MMM-YYYY')
			e.isleading_data = e.isleading? 'YES' : 'NO'
			return e
		})

		let stateData = await State.find({is_deleted:false}).sort({_id:-1})
		let LawyerCategoryData = await LawyerCategory.find({is_deleted:false}).sort({_id:-1})
		let LawyerData = await Lawyer.find({is_deleted:false}).sort({_id:-1})


        message = {
            error: false,
            message: "All SurvivorLawyer list",
            data: customLawyerData,
			masterStateData:stateData,
			masterLawyerCategoryData:LawyerCategoryData,
			masterLawyerData:LawyerData
			
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorLawyerData, 
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
 * This method is to find detail SurvivorLawyer
 * @param str SurvivorLawyerID
 * 
 */

 SurvivorLawyerRoute.get("/detail/:SurvivorLawyerID", async (req, res) => {
    try {
        let SurvivorLawyerData = await SurvivorLawyer.findOne({$and:[{ _id: req.params.SurvivorLawyerID },{is_deleted:false}]}).populate([
            {
                path:"name",
                select:"name"
            },
            {
                path:"type",
                select:"name"
            }
           
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "Detail SurvivorLawyer list",
            data: SurvivorLawyerData,
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorLawyerData, 
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
 * This method is to create all SurvivorLawer
 * @param str SurvivorProfileId
 * 
 */

 SurvivorLawyerRoute.post("/create", async (req, res) => {
	try {
		const SurvivorLawyerData = new  SurvivorLawyer(req.body);
		let survivorId = SurvivorLawyerData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		console.log(survivorData?.date_of_trafficking);
		console.log(SurvivorLawyerData?.from_date);
		console.log(SurvivorLawyerData?.to_date);
		if ( SurvivorLawyerData?.from_date <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "From Date should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		if ( SurvivorLawyerData?.from_date >= SurvivorLawyerData?.to_date) {
			message = {
				error: true,
				message: "To date should be after from date",
			};
			return res.status(200).send(message);
		}
		const result = await SurvivorLawyerData.save();
		message = {
			error: false,
			message: "Survivor Lawyer Added Successfully!",
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
			message: "operation failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Survivor Lawyer
 * @param str SurvivorProfileId
 */
 SurvivorLawyerRoute.patch("/update/:SurvivorLawyerID", async (req, res) => {
	try {
		const CheckSurvivorLawyerData = await SurvivorLawyer.findOne({$and:[
			{ _id: req.params.SurvivorLawyerID},{is_deleted:false}
		]})
		if (!CheckSurvivorLawyerData) return res.status(200).send({error: true, message: "Survivor lawyer not found"}) 
		let survivorId = CheckSurvivorLawyerData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.from_date && (new Date(req.body.from_date) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Form Date should be after date of trafficking"})
		

		/**
		 * checking to date greater than form date or not
		 */

		if (req.body.to_date && (new Date(req.body.to_date) <= new Date(CheckSurvivorLawyerData?.from_date))) return res.status(200).send({ error: true, message: "To date should be after Form date"})
			
			
		const SurvivorLawyerData = await SurvivorLawyer.find({$and:[
			{ _id: req.params.SurvivorLawyerID},{is_deleted:false}
		]})
		const result = await SurvivorLawyer.findOneAndUpdate({ _id: req.params.SurvivorLawyerID }, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorlawyers",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorLawyerData),
                    description: "SURVIVOR LAWYER data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "lawyer",
                    note: "Change log genearted for survivor lawyer"
                });
            }
			message = {
				error: false,
				message: "Survivor Lawyer updated successfully!",
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
				message: "SurvivorLawyer not updated",
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
 * This method is to delete SurvivorLawyer
 * @param str SurvivorLawyerID
 */
//  SurvivorLawyerRoute.delete("/delete/:SurvivorLawyerID", async (req, res) => {
// 	try {
// 		const result = await SurvivorLawyer.deleteOne({ _id: req.params.SurvivorLawyerID});
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Survivor Lawyer deleted successfully!",
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
 * This method is to delete SurvivorLawyer
 * @param str SurvivorLawyerID
 */
SurvivorLawyerRoute.patch("/delete/:SurvivorLawyerID", async (req, res) => {
	try {
		const SurvivorLawyerData = await SurvivorLawyer.find({$and:[
			{ _id: req.params.SurvivorLawyerID},{is_deleted:false}
		]})
		const result = await SurvivorLawyer.findOneAndUpdate({ _id: req.params.SurvivorLawyerID},
			{is_deleted: true , deleted_at: Date.now() , deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorlawyers",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorLawyerData),
                    description: "SURVIVOR LAWYER data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "lawyer",
                    note: "Change log genearted for survivor lawyer "
                });
            }
			message = {
				error: false,
				message: "Survivor Lawyer deleted successfully!",
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
 *  This method is to update survivor Lawyer search
 */

 SurvivorLawyerRoute.post("/search", async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await SurvivorLawyer.find({
			"$or":[{"name":{"$regex":searchText,$options: 'i' }},{"email":{"$regex":searchText,$options: 'i' }},{"phone":{"$regex":searchText,$options: 'i' }}]})
	
		if (result) {
			message = {
				error: false,
				message: "survivor lawyer search successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor lawyer search failed",
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



module.exports = SurvivorLawyerRoute;