require("dotenv").config();
const express = require("express");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorFamily = require("../models/survivor_family");
const SurvivorFamilyRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();



/**
 * This method is to find all survivor Family
 * * @param str SurvivorProfileId
 */

 SurvivorFamilyRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorFamilyData= await SurvivorFamily.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).sort({_id:-1});

        message = {
            error: false,
            message: "All survivor Family list",
            data: SurvivorFamilyData,
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorFamilyData, 
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
 * This method is to find all survivor Family
 * * @param str survivorFamilyId
 */

 SurvivorFamilyRoute.get("/detail/:survivorFamilyId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorFamilyData= await SurvivorFamily.findOne({$and:[{ _id: req.params.survivorFamilyId },{is_deleted:false}]}).sort({_id:-1});

        message = {
            error: false,
            message: "Detail survivor Family list",
            data: SurvivorFamilyData,
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorFamilyData, 
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
 * This method is to create survivor Family
 * 
 */


 SurvivorFamilyRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorFamilyData = new SurvivorFamily(req.body);
		const result = await SurvivorFamilyData.save();
		message = {
			error: false,
			message: "survivor Family Added Successfully!",
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
			message: "survivor Family Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update survivor Family
 * * @param str survivorFamilyId
 */
 SurvivorFamilyRoute.patch("/update/:survivorFamilyId", isAuthenticate, async (req, res) => {
	try {
		const SurvivorFamilyData = await SurvivorFamily.find({$and:[
			{ _id: req.params.survivorFamilyId},{is_deleted:false}
		]})
		const result = await SurvivorFamily.findOneAndUpdate({ _id: req.params.survivorFamilyId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorfamilys",
                    old_data: JSON.stringify(SurvivorFamilyData),
                    description: "SURVIVOR FAMILY data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "family",
                    note: "Change log genearted for survivor family"
                });
            }
			message = {
				error: false,
				message: "survivor Family updated successfully!",
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
				message: "survivor Family not updated",
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
 * This method is to delete survivor Family
 * @param str survivorFamilyId
 */

//  SurvivorFamilyRoute.delete("/delete/:survivorFamilyId", async (req, res) => {
// 	try {
// 		const result = await SurvivorFamily.deleteOne({ _id: req.params.survivorFamilyId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "survivor Family deleted successfully!",
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



SurvivorFamilyRoute.patch("/delete/:survivorFamilyId", async (req, res) => {
	try {
		const SurvivorFamilyData = await SurvivorFamily.find({$and:[
			{ _id: req.params.survivorFamilyId},{is_deleted:false}
		]})
		const result = await SurvivorFamily.findOneAndUpdate({ _id: req.params.survivorFamilyId },
			{is_deleted: true, deleted_at: Date.now(),deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorfamilys",
                    old_data: JSON.stringify(SurvivorFamilyData),
                    description: "SURVIVOR FAMILY data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "family",
                    note: "Change log genearted for survivor family"
                });
            }
			message = {
				error: false,
				message: "survivor Family deleted successfully!",
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
 *  This method is to update survivor search
 */

SurvivorFamilyRoute .post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await SurvivorFamily.find({
			"$or":[/*{$addFields:{numberStr:{$toString: '$number'}}},{numberStr:searchText},*/{"name":{"$regex":searchText,$options: 'i' }},{"address":{"$regex":searchText,$options: 'i' }}]})
	
		if (result) {
			message = {
				error: false,
				message: "survivor family search successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor family search failed",
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




module.exports = SurvivorFamilyRoute;
