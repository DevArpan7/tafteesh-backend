require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Mortgage = require("../models/mortgage");
const SurvivorLoan = require("../models/survivor_loan");
const MortgageRoute = express.Router();

/**
 * This method is to find all Mortgage
 */

 MortgageRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let MortgageData = await Mortgage.find({is_deleted:false}).sort({_id:-1});

		let customMortgageData = JSON.parse(JSON.stringify(MortgageData))

		customMortgageData.map(e => {
			e.mortgage_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Mortgage list",
            data: customMortgageData,
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
 * This method is to create Mortgage
 */


 MortgageRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkMortgage = await Mortgage.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkMortgage.length){
			for (let index = 0; index < checkMortgage.length; index++) {
				if(checkMortgage[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A mortgage already exists with this name!"})
				}
			}
		}

		const MortgageData = new Mortgage(req.body);
		const result = await MortgageData.save();
		message = {
			error: false,
			message: "Mortgage Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "PcEscalation Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update Mortgage
 */

 MortgageRoute.patch("/update/:MortgageId", isAuthenticate, async (req, res) => {
	try {
		const chechkEsitence1 = await SurvivorLoan.findOne({mortgage: {$in: [req.params.MortgageId]}})
		if (chechkEsitence1) return res.status(200).send({error: true, message: "This mortgage exist in other module. Can not be updated."})

		const checkMortgage = await Mortgage.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkMortgage.length){
			for (let index = 0; index < checkMortgage.length; index++) {
				if(checkMortgage[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A mortgage already exists with this name!"})
				}
			}
		}

		const result = await Mortgage.findOneAndUpdate({ _id: req.params.MortgageId}, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Mortgage updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Mortgage not updated",
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
 * This method is to delete Mortgage
 */

//  MortgageRoute.delete("/delete/:MortgageId", async (req, res) => {
// 	try {
// 		const result = await  Mortgage.deleteOne({ _id: req.params.MortgageId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Mortgage deleted successfully!",
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

MortgageRoute.patch("/delete/:MortgageId", async (req, res) => {
	try {
		const chechkEsitence1 = await SurvivorLoan.findOne({mortgage: {$in: [req.params.MortgageId]}})
		if (chechkEsitence1) return res.status(200).send({error: true, message: "This mortgage exist in other module. Can not be deleted."})

		const result = await  Mortgage.findOneAndUpdate({ _id: req.params.MortgageId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Mortgage deleted successfully!",
				result
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
			data: String(err),
		};
		res.status(200).send(message);
	}
});



module.exports = MortgageRoute;
