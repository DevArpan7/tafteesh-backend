require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const EarningType = require("../models/income_type");
const survivorIncome = require("../models/survivor_income");
const EarningTypeRoute = express.Router();

/**
 * This method is to find all income type
 */
EarningTypeRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let EarningTypeData = await EarningType.find({is_deleted:false}).sort({_id:-1});

		let customEarningTypeData = JSON.parse(JSON.stringify(EarningTypeData))
		customEarningTypeData.map(e => {
			e.earning_type_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All income type list",
            data: customEarningTypeData,
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
 * This method is to create income type
 */
EarningTypeRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkIncomeTypeData = await EarningType.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkIncomeTypeData.length){
			for (let index = 0; index < checkIncomeTypeData.length; index++) {
				if(checkIncomeTypeData[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An income type of loan already exists with this name!"})
				}
			}
		}

		const EarningTypeData = new EarningType(req.body);
		const result = await EarningTypeData.save();
		message = {
			error: false,
			message: "Income Type Added Successfully!",
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
 * This method is to update Income Type
 * @param str incomeTypeId
 */
EarningTypeRoute.patch("/update/:incomeTypeId", isAuthenticate, async (req, res) => {
	try {
		const earningTypeData = await EarningType.findOne({ _id: req.params.incomeTypeId }) 
		const existenceCheck1 = await survivorIncome.findOne({$or: [{type: earningTypeData?.name}, {income_type: earningTypeData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This income type exists in other module. Can not be updated."});

		const checkIncomeTypeData = await EarningType.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkIncomeTypeData.length){
			for (let index = 0; index < checkIncomeTypeData.length; index++) {
				if(checkIncomeTypeData[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An income type of loan already exists with this name!"})
				}
			}
		}

		const result = await EarningType.findOneAndUpdate({ _id: req.params.incomeTypeId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Income Type updated successfully!",
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

EarningTypeRoute.patch("/delete/:incomeTypeId", async (req, res) => {
	try {
		const earningTypeData = await EarningType.findOne({ _id: req.params.incomeTypeId }) 
		const existenceCheck1 = await survivorIncome.findOne({$or: [{type: earningTypeData?.name}, {income_type: earningTypeData?._id}]})
	
		if (existenceCheck1) return res.status(200).send({error: true, message: "This income type exists in other module. Can not be deleted."});
		const result = await EarningType.findOneAndUpdate({_id:req.params.incomeTypeId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Income Type delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Income Type  not deleted",
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


module.exports = EarningTypeRoute;