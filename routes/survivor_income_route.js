require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const survivorIncome = require("../models/survivor_income");
const survivorIncomeRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const sendNotification = require("../helper/sendNotification");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();


/**
 * This method is to find all survivor income
 */

 survivorIncomeRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let survivorIncomeData= await survivorIncome.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path:"income_type",
				select:"name"
			},
			{
				path:"income_mode",
				select:"name"
			}
		]).sort({_id:-1});
		let totalIncome = 0;
		survivorIncomeData.forEach((element, index) => {
			totalIncome += element?.amount
		});
		//console.log(totalIncome);
		
		let customIncomeData = JSON.parse(JSON.stringify(survivorIncomeData))

		customIncomeData.map(e => {
			e.earning_mode = e?.income_mode?.name
			e.updated_date =  moment(e?.updatedAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All survivor income list",
            data: customIncomeData,
			totalIncome
        };
		infoLogger.info({
			req: req.params, 
			res: {survivorIncomeData,totalIncome},
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
 * This method is to find detail survivor income
 *  @param str survivorIncomeId
 */

 survivorIncomeRoute.get("/detail/:survivorIncomeId", isAuthenticate, async (req, res) => {
    try {
        let survivorIncomeData= await survivorIncome.findOne({$and:[{ _id: req.params.survivorIncomeId },{is_deleted:false}]}).populate([
			{
				path:"income_type",
				select:"name"
			},
			{
				path:"income_mode",
				select:"name"
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "Detail survivor income list",
            data: survivorIncomeData,
        };
		infoLogger.info({
			req: req.params, 
			res: survivorIncomeData,
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
 * This method is to create survivor income
 */


 survivorIncomeRoute.post("/create", async (req, res) => {
	try {
		const survivorIncomeData = new survivorIncome(req.body);
		let result = await survivorIncomeData.save();
		result = await survivorIncomeData.populate([
			{
				path: "survivor",
				select: "organization user_id survivor_id survivor_name"
			}
		]);
		if (result?.survivor?.user_id) {
			let sendNotificationData = await sendNotification({
				user: result?.survivor?.user_id,
				title: "Survivor Income Record Added",
				description: "Congratulation , "+ result?.survivor?.survivor_id +" with name "+ result?.survivor?.survivor_name +" has new income record "
			});
		}
		message = {
			error: false,
			message: "survivor income Added Successfully!",
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
			message: "survivor income Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update survivor income
 */
 survivorIncomeRoute.patch("/update/:survivorIncomeId", async (req, res) => {
	try {
		const SurvivorIncomeData = await survivorIncome.find({$and:[
			{ _id: req.params.survivorIncomeId},{is_deleted:false}
		]})
		const result = await survivorIncome.findOneAndUpdate({ _id: req.params.survivorIncomeId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorIncomes",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorIncomeData),
                    description: "SURVIVOR INCOME data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "income",
                    note: "Change log genearted for survivor income"
                });
            }
			message = {
				error: false,
				message: "survivor Income updated successfully!",
				result
			};
			infoLogger.info({
				req: req.body, 
				res: JSON.stringify(result), 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor Income not updated",
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
 * This method is to delete survivor income
 */

//  survivorIncomeRoute.delete("/delete/:survivorIncomeId", async (req, res) => {
// 	try {
// 		const result = await  survivorIncome.deleteOne({ _id: req.params.survivorIncomeId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "survivor Income deleted successfully!",
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


 survivorIncomeRoute.patch("/delete/:survivorIncomeId", async (req, res) => {
	try {
		const SurvivorIncomeData = await survivorIncome.find({$and:[
			{ _id: req.params.survivorIncomeId},{is_deleted:false}
		]})
		const result = await  survivorIncome.findOneAndUpdate({ _id: req.params.survivorIncomeId },
			{is_deleted: true, deleted_at: Date.now(), deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorIncomes",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorIncomeData),
                    description: "SURVIVOR INCOME data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "income",
                    note: "Change log genearted for survivor income"
                });
            }
			message = {
				error: false,
				message: "survivor Income deleted successfully!",
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




module.exports = survivorIncomeRoute;
