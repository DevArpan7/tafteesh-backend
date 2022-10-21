require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const LoanWhere = require("../models/loan_where");
const SurvivorLoan = require("../models/survivor_loan");
const LoanWhereRoute = express.Router();
const moment = require("moment");

/**
 * This method is to find all AuthorityType
 */
 LoanWhereRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let LoanWhereData = await LoanWhere.find({is_deleted:false}).sort({_id:-1});

		let customLoanWhereData = JSON.parse(JSON.stringify(LoanWhereData))
		customLoanWhereData.map(e => {
			e.loan_where_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Where list",
            data: customLoanWhereData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to create AuthorityType
 */
 LoanWhereRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkLoanWhere = await LoanWhere.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkLoanWhere.length){
			for (let index = 0; index < checkLoanWhere.length; index++) {
				if(checkLoanWhere[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A loan where of loan already exists with this name!"})
				}
			}
		}

		const LoanWhereData = new LoanWhere(req.body);
		const result = await LoanWhereData.save();
		message = {
			error: false,
			message: "Where Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Where type Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update AuthorityType
 * @param str AuthorityTypeId
 */
 LoanWhereRoute.patch("/update/:whereId", isAuthenticate, async (req, res) => {
	try {
		const loanWhereData = await LoanWhere.findOne({ _id: req.params.whereId });
		const chechkExistence1 = await SurvivorLoan.findOne({$or: [{where: loanWhereData.name}, {loan_Where: req.params.PoliceStationId}]});
		if(chechkExistence1) return res.status(200).send({error: true, message: "This loan where exist in other module. Can not be updated."});

		const checkLoanWhere = await LoanWhere.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkLoanWhere.length){
			for (let index = 0; index < checkLoanWhere.length; index++) {
				if(checkLoanWhere[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A loan where of loan already exists with this name!"})
				}
			}
		}

		const result = await LoanWhere.findOneAndUpdate({ _id: req.params.whereId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Where updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "where not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete AuthorityType
 * @param str AuthorityTypeId
 */
//  AuthorityTypeRoute.delete("/delete/:AuthorityTypeId", async (req, res) => {
// 	try {
// 		const result = await AuthorityType.deleteOne({ _id: req.params.AuthorityTypeId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Authority type deleted successfully!",
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

LoanWhereRoute.patch("/delete/:whereId", async (req, res) => {
	try {
		const loanWhereData = await LoanWhere.findOne({ _id: req.params.whereId }) 
		const existenceCheck1 = await SurvivorLoan.findOne({$or: [{where: loanWhereData?.name}, {loan_Where: loanWhereData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This Loan where exists in other module. Can not be delete."});

		const result = await LoanWhere.findOneAndUpdate({_id:req.params.whereId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Where delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Where  not deleted",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: String(err),
		};
		res.status(200).send(message);
	}
});


module.exports = LoanWhereRoute;