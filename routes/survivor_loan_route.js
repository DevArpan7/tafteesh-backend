require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorLoan = require("../models/survivor_loan");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const SurvivorLoanRoute = express.Router();
const Mortgage = require("../models/mortgage");

/**
 * This method is to find all SurvivorLoan
 */

SurvivorLoanRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorLoanData = await SurvivorLoan.find({$and:[{survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path:"loan_Where",
				select:"name"
			},
			{
				path:"loan_purpose",
				select:"name"
			}
		]).sort({_id:-1});
		let totalLoan = 0;

		SurvivorLoanData.forEach((element, index) => {
			totalLoan += element.amount
			totalLoan -= element.total_paid_amount
		});

		
		let customLoanData = JSON.parse(JSON.stringify(SurvivorLoanData))

		customLoanData.map(e => {
			e.where_name = e?.loan_Where?.name
			e.purpose_name = e?.loan_purpose?.name
			e.loan_received_on =  moment((e?.received_on != undefined || e?.received_on != null) ? e?.received_on.split("T")[0] : e?.received_on).format('DD-MMM-YYYY')
			e.loan_updated_date =  moment((e?.updatedAt != undefined || e?.updatedAt != null) ? e?.updatedAt.split("T")[0] : e?.updatedAt).format('DD-MMM-YYYY')
			e.rate_loan = JSON.stringify(e?.rate)
			return e
		})
		let mortgageData = await Mortgage.find({is_deleted:false}).sort({_id:-1});
       const message = {
            error: false,
            message: "All SurvivorLoan list",
            data: customLoanData,
			totalLoan,
			masterMortgageData: mortgageData

		};
		infoLogger.info({
			req: req.params, 
			res: {SurvivorLoanData,totalLoan},
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
            data: err.toString(),
        };
        res.status(200).send(message);
    }
});



/**
 * This method is to find detail SurvivorLoan
 *   @param str SurvivorRescueId
 */

SurvivorLoanRoute.get("/detail/:SurvivorLoanId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorLoanData = await SurvivorLoan.findOne({$and:[{_id: req.params.SurvivorLoanId },{is_deleted:false}]}).populate([
			{
				path:"loan_Where",
				select:"name"
			},
			{
				path:"loan_purpose",
				select:"name"
			}

		]).sort({_id:-1});
		
       const message = {
            error: false,
            message: "All SurvivorLoan list",
            data: SurvivorLoanData,
			
		};
		infoLogger.info({
			req: req.params, 
			res: SurvivorLoanData,
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
 * This method is to create SurvivorLoan
 * @param {String} loanId
 * @param {String} paidlogId 
 */
SurvivorLoanRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorLoanData = new SurvivorLoan(req.body);
		const result = await SurvivorLoanData.save();
		message = {
			error: false,
			message: "Survivor's Loan Data Added Successfully!",
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
			message: "Survivor's Loan Data Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to delete paid log
 * @param {String} loanId
 * @param {String} paidlogId 
 */
SurvivorLoanRoute.patch("/delete-paid-log/:loanId/:paidlogId", async (req, res, next) => {
	try {
		const survivorLoanData = await SurvivorLoan.findOne({_id: req.params.loanId})
		let paidlogData = survivorLoanData.paid_log.map(e => {
			if (String(e._id) == String(req.params.paidlogId)) {
				e.is_deleted = true;
			}
			return e;
		});
		// return res.status(200).send({paidlogData});

		if (survivorLoanData && paidlogData.length) {
			const result = await SurvivorLoan.findOneAndUpdate({_id: req.params.loanId}, {paid_log: paidlogData}, {new: true})
			let changeLogData = await generateChangelog({
				targeted_data: result?._id,
				targeted_data_ref: "survivorLoans",
				survivor: result.survivor,
				old_data: JSON.stringify(survivorLoanData),
				description: "SURVIVOR LOAN paid log deleted",
				new_data: JSON.stringify(result),
				status: false,
				changed_by: req.body.user_id,
				changed_by_ref: "users",
				module: "loan",
				note: "Change log genearted for survivor loan"
			});
			return res.status(200).send({
				error: false,
				message: 'Paid log deleted',
				data: result
			});
		} else {
			return res.status(200).send({
				error: true,
				message: 'Paid log not deleted'
			});
		}
	} catch (err) {
		return res.status(200).send({
			error: true,
			message: err.toString() 
		});
	}
})

/**
 * This method is to edit paid log
 */
 SurvivorLoanRoute.patch("/edit-paid-log/:loanId/:paidlogId", async (req, res, next) => {
	try {
		const survivorLoanData = await SurvivorLoan.findOne({_id: req.params.loanId})
		let paidlogData = survivorLoanData.paid_log.map(e => {
			if (String(e._id) == String(req.params.paidlogId)) {
				e.total_paid = req.body.total_paid;
				e.as_of_date = req.body.as_of_date;
			}
			return e;
		});
		// return res.status(200).send({paidlogData});
		if (survivorLoanData && paidlogData.length) {
			const result = await SurvivorLoan.findOneAndUpdate({_id: req.params.loanId}, {paid_log: paidlogData}, {new: true})
			let changeLogData = await generateChangelog({
				targeted_data: result?._id,
				targeted_data_ref: "survivorLoans",
				survivor: result.survivor,
				old_data: JSON.stringify(survivorLoanData),
				description: "SURVIVOR LOAN paid log edited",
				new_data: JSON.stringify(result),
				status: false,
				changed_by: req.body.user_id,
				changed_by_ref: "users",
				module: "loan",
				note: "Change log genearted for survivor loan"
			});

			return res.status(200).send({
				error: false,
				message: 'Paid log edited',
				data: result
			});
		} else {
			return res.status(200).send({
				error: true,
				message: 'Paid log not deleted'
			});
		}
	} catch (err) {
		return res.status(200).send({
			error: true,
			message: err.toString() 
		});
	}
})

/**
 * This method is to update SurvivorLoan
 */
SurvivorLoanRoute.patch("/update/:SurvivorLoanId", isAuthenticate, async (req, res) => {
	try {
		const SurvivorLoanData = await SurvivorLoan.find({$and:[
			{ _id: req.params.SurvivorLoanId},{is_deleted:false}
		]})
		const result = await SurvivorLoan.findOneAndUpdate({_id: req.params.SurvivorLoanId}, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorLoans",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorLoanData),
                    description: "SURVIVOR LOAN data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "loan",
                    note: "Change log genearted for survivor loan"
                });
            }
			message = {
				error: false,
				message: "Survivor Loan updated successfully!",
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
				message: "Survivor Loan not updated",
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
 * This method is to add SurvivorLoan paidlog
 */
SurvivorLoanRoute.patch("/add-paid-log/:SurvivorLoanId", isAuthenticate, async (req, res) => {
	try {
		const SurvivorLoanData = await SurvivorLoan.find({$and:[
			{ _id: req.params.SurvivorLoanId},{is_deleted:false}
		]})
		const result = await SurvivorLoan.findOneAndUpdate({_id: req.params.SurvivorLoanId}, {$push: {paid_log: { total_paid: req.body.total_paid, as_of_date: req.body.as_of_date }}, $inc: {total_paid_amount: req.body.total_paid}}, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorLoans",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorLoanData),
                    description: "SURVIVOR LOAN paidlog data added",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "loan",
                    note: "Change log genearted for survivor loan paidlog"
                });
            }
			message = {
				error: false,
				message: "Survivor Loan updated successfully!",
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
				message: "Survivor Loan not updated",
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

// /**
//  * This method is to edit SurvivorLoan paidlog
//  */
//  SurvivorLoanRoute.get("/edit-paid-log/:SurvivorLoanId", isAuthenticate, async (req, res) => {
// 	try {
// 		const SurvivorLoanData = await SurvivorLoan.find({$and:[
// 			{ _id: req.params.SurvivorLoanId},{is_deleted:false}
// 		]})
		
// 			message = {
// 				error: false,
// 				message: "SurvivorLoan updated successfully!",
// 				SurvivorLoanData
// 			};
// 			res.status(200).send(message);
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
 * This method is to delete SurvivorLoan
 */
//  SurvivorLoanRoute.delete("/delete/:SurvivorLoanId", async (req, res) => {
// 	try {
// 		const result = await SurvivorLoan.deleteOne({ _id: req.params.SurvivorLoanId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "SurvivorLoan deleted successfully!",
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
 * This method is to delete SurvivorLoan
 */
SurvivorLoanRoute.patch("/delete/:SurvivorLoanId", async (req, res) => {
	try {
		const SurvivorLoanData = await SurvivorLoan.find({$and:[
			{ _id: req.params.SurvivorLoanId},{is_deleted:false}
		]})
		const result = await SurvivorLoan.findOneAndUpdate({ _id: req.params.SurvivorLoanId },
			{is_deleted: true, deleted_at: Date.now(),deleted_by:req.body.deleted_by,deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorLoans",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorLoanData),
                    description: "SURVIVOR LOAN data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "loan",
                    note: "Change log genearted for survivor loan"
                });
            }
			message = {
				error: false,
				message: "Survivor Loan deleted successfully!",
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

SurvivorLoanRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await SurvivorLoan.find({"$or":[{$addFields:{amtStr:{$toString: '$amount'}}},{"amtStr":{"$regex":searchText,$options:'i'}},{"where":{"$regex":searchText,$options:'i'}}]})
		if (result) {
			message = {
				error: false,
				message: "survivor loan search successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "survivor loan search failed",
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



module.exports = SurvivorLoanRoute;