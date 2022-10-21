require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const shelterHome = require("../models/shelter_home");
const shelterHomeRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const ShelterHomeQuestion = require("../models/shelter_home_question");
const SurvivorProfile = require("../models/survivor_profile");



/**
 * This method is to find all shelterHome
 */

 shelterHomeRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let sheltereHomeData= await shelterHome.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).sort({_id:-1});

		let customShelterHomeData = JSON.parse(JSON.stringify(sheltereHomeData))

		customShelterHomeData.map(e => {
			e.shelter_from_date =  moment(e?.from_date.split("T")[0]).format('DD-MMM-YYYY');
			e.shelter_to_date =  moment(e?.to_date.split("T")[0]).format('DD-MMM-YYYY');
			e.journey = e.journey.filter(e => e.answer != "")
			return e
		})

		let shelterHomeQuestionData = await ShelterHomeQuestion.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All shelter home list",
            data: customShelterHomeData,
			masterShelterHomeQuestion: shelterHomeQuestionData
        };
		infoLogger.info({
			req: req.params, 
			res: sheltereHomeData, 
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
 * This method is to create shelterhome
 */


 shelterHomeRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const sheltereHomeData = new shelterHome(req.body);
		let survivorId = sheltereHomeData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		console.log(survivorData?.date_of_trafficking);
		console.log(sheltereHomeData?.from_date);
		console.log(sheltereHomeData?.to_date);
		if ( sheltereHomeData?.from_date <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "From Date should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		if ( sheltereHomeData?.from_date >= sheltereHomeData?.to_date) {
			message = {
				error: true,
				message: "To date should be after from date",
			};
			return res.status(200).send(message);
		}
		const result = await sheltereHomeData.save();
		message = {
			error: false,
			message: "shelter home Added Successfully!",
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
			message: "shelter home Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update shelter home
 */
 shelterHomeRoute.patch("/update/:shelterHomeId", isAuthenticate, async (req, res) => {
	try {
		const CheckshelterHomeRouteData = await shelterHome.findOne({$and:[
			{ _id: req.params.shelterHomeId},{is_deleted:false}
		]})
		if (!CheckshelterHomeRouteData) return res.status(200).send({error: true, message: "Shelter Home not found"}); 
		let survivorId = CheckshelterHomeRouteData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.from_date && (new Date(req.body.from_date) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Form Date should be after date of trafficking"})
		

		/**
		 * checking to date greater than form date or not
		 */

		if (req.body.to_date && (new Date(req.body.to_date) <= new Date(CheckshelterHomeRouteData?.from_date))) return res.status(200).send({ error: true, message: "To date should be after Form date"})
			

		const oldData = await shelterHome.find({_id: req.params.shelterHomeId});
		const result = await shelterHome.findOneAndUpdate({_id: req.params.shelterHomeId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "shelterHomes",
					survivor: result.survivor,
                    old_data: JSON.stringify(oldData),
                    description: "Shelter Home data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "shelter",
                    note: "Change log genearted for Shelter Home"
                });
            }
			message = {
				error: false,
				message: "shelter home updated successfully!",
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
				message: "shelter home not updated",
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
 * This method is to delete shelterhome
 */

//  shelterHomeRoute.delete("/delete/:shelterHomeId", async (req, res) => {
// 	try {
// 		const result = await  shelterHome.deleteOne({ _id: req.params.shelterHomeId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "shelter home deleted successfully!",
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


shelterHomeRoute.patch("/delete/:shelterHomeId", async (req, res) => {
	try {
		const result = await  shelterHome.findOneAndUpdate({ _id: req.params.shelterHomeId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "shelterHomes",
					survivor: result.survivor,
                    old_data: "Shelter Home",
                    description: "Shelter Home data deleted",
                    new_data: "Shelter Home Deleted",
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "shelter",
                    note: "Change log genearted for Shelter Home"
                });
            }
			message = {
				error: false,
				message: "shelter home deleted successfully!",
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

module.exports = shelterHomeRoute;
