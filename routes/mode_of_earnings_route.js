require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const ModeOfEarning = require("../models/mode_of_earning");
const survivorIncome = require("../models/survivor_income");
const ModeOfEarningRoute = express.Router();
const moment = require("moment");

/**
 * This method is to find all Mode Of earnings
 */
ModeOfEarningRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let ModeOfEarningData = await ModeOfEarning.find({is_deleted:false}).populate([
            {
                path:"earning_type",
                select:"name"
            }
        ]).sort({_id:-1});

		let customModeOfEarningData = JSON.parse(JSON.stringify(ModeOfEarningData))
		customModeOfEarningData.map(e => {
			e.created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Mode Of earnings list",
            data: customModeOfEarningData,
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
 * This method is to find all Mode Of earnings by typeId
 */
 ModeOfEarningRoute.get("/list/:earningTypeId", isAuthenticate, async (req, res) => {
    try {
        let ModeOfEarningData = await ModeOfEarning.find({$and:[{earning_type:req.params.earningTypeId},{is_deleted:false}]}).populate([
            {
                path:"earning_type",
                select:"name"
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All Mode Of earnings list",
            data: ModeOfEarningData,
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
ModeOfEarningRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkModeOfEarningData = await ModeOfEarning.findOne({$and: [{name: {$regex: req.body.name, $options: "i"}}, {earning_type: req.body.earning_type}]});
		if (checkModeOfEarningData) return res.status(200).send({error: true, message: "A same mode of earning already exists!"})
		
		const ModeOfEarningData = new ModeOfEarning(req.body);
		const result = await ModeOfEarningData.save();
		message = {
			error: false,
			message: "Mode Of earnings Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Mode Of earnings type Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update Mode Of earnings
 * @param str modeOfearningId
 */
ModeOfEarningRoute.patch("/update/:modeOfearningId", isAuthenticate, async (req, res) => {
	try {
		const modeOfEarningData = await ModeOfEarning.findOne({ _id: req.params.modeOfearningId }) 
		const existenceCheck1 = await survivorIncome.findOne({$or: [{mode_of_earning: modeOfEarningData?.name}, {income_mode: modeOfEarningData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This Earning Mode exists in other module. Can not be updated."});

		const checkModeOfEarningData = await ModeOfEarning.findOne({$and: [{name: {$regex: req.body.name, $options: "i"}}, {earning_type: req.body.earning_type}]});
		if (checkModeOfEarningData) return res.status(200).send({error: true, message: "A same mode of earning already exists!"})

		const result = await ModeOfEarning.findOneAndUpdate({ _id: req.params.modeOfearningId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Mode of earnings updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Mode of earnings not updated",
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

ModeOfEarningRoute.patch("/delete/:modeOfearningId", async (req, res) => {
	try {
		const modeOfEarningData = await ModeOfEarning.findOne({ _id: req.params.modeOfearningId }) 
		const existenceCheck1 = await survivorIncome.findOne({$or: [{mode_of_earning: modeOfEarningData?.name}, {income_mode: modeOfEarningData?._id}]})
		if (existenceCheck1) return res.status(200).send({error: true, message: "This Earning Mode exists in other module. Can not be deleted."});

		const result = await ModeOfEarning.findOneAndUpdate({_id:req.params.modeOfearningId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Mode Of earnings delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Mode Of earnings  not deleted",
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


module.exports = ModeOfEarningRoute;