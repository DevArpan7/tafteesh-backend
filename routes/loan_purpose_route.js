require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const PurposeOfLoan = require("../models/loan_purpose");
const SurvivorLoan = require("../models/survivor_loan");
const PurposeOfLoanRoute = express.Router();
const moment = require("moment");

/**
 * This method is to find all AuthorityType
 */
PurposeOfLoanRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let PurposeOfLoanData = await PurposeOfLoan.find({is_deleted:false}).sort({_id:-1});

		let customPurposeOfLoanData = JSON.parse(JSON.stringify(PurposeOfLoanData))
		customPurposeOfLoanData.map(e => {
			e.purpose_of_loan_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Loan purpose list",
            data: customPurposeOfLoanData,
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
PurposeOfLoanRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkPurposeOfLoan = await PurposeOfLoan.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkPurposeOfLoan.length){
			for (let index = 0; index < checkPurposeOfLoan.length; index++) {
				if(checkPurposeOfLoan[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A purpose of loan already exists with this name!"})
				}
			}
		}

		const PurposeOfLoanData = new PurposeOfLoan(req.body);
		const result = await PurposeOfLoanData.save();
		message = {
			error: false,
			message: "Loan Purpose Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Loan Purpose type Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update AuthorityType
 * @param str loanPurposeId
 */
PurposeOfLoanRoute.patch("/update/:loanPurposeId", isAuthenticate, async (req, res) => {
	try {
		const purposeOfLoanData = await PurposeOfLoan.findOne({ _id: req.params.loanPurposeId });
		const chechkExistence1 = await SurvivorLoan.findOne({$or: [{purpose: purposeOfLoanData.name}, {loan_purpose: req.params.loanPurposeId}]});
		if(chechkExistence1) return res.status(200).send({error: true, message: "This purpose of loan exist in other module. Can not be updated."});

		const checkPurposeOfLoan = await PurposeOfLoan.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkPurposeOfLoan.length){
			for (let index = 0; index < checkPurposeOfLoan.length; index++) {
				if(checkPurposeOfLoan[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A purpose of loan already exists with this name!"})
				}
			}
		}

		const result = await PurposeOfLoan.findOneAndUpdate({ _id: req.params.loanPurposeId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Loan Purpose updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Loan Purpose not updated",
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

PurposeOfLoanRoute.patch("/delete/:loanPurposeId", async (req, res) => {
	try {
		const purposeOfLoanData = await PurposeOfLoan.findOne({ _id: req.params.loanPurposeId });
		const chechkExistence1 = await SurvivorLoan.findOne({$or: [{purpose: purposeOfLoanData?.name}, {loan_purpose: req.params.loanPurposeId}]});
		if(chechkExistence1) return res.status(200).send({error: true, message: "This purpose of loan exist in other module. Can not be deleted."});
		
		const result = await PurposeOfLoan.findOneAndUpdate({_id:req.params.loanPurposeId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Loan Purpose delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Loan Purpose not deleted",
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


module.exports = PurposeOfLoanRoute;