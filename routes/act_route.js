require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Act = require("../models/act");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorChargesheet = require("../models/survivor_chargesheet");
const SupplimentaryChargesheet = require("../models/supplimentary_chargesheet");
const Section = require("../models/section");
const SurvivorChargeSheet = require("../models/survivor_chargesheet");
const ActRoute = express.Router();


/**
 * This method is to find all Act
 */
 ActRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let ActData = await Act.find({$and:[{is_deleted:false}]}).sort({_id:-1});

		
		let customActData = JSON.parse(JSON.stringify(ActData))

		customActData.map(e => {
			e.Act_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All Act list",
            data: customActData,
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
 * This method is to create Act
 */
 ActRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const actData = await Act.find({name: {$regex: req.body.name, $options: "i"}});
		if (actData.length){
			for (let index = 0; index < actData.length; index++) {
				if(actData[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "An act already exists with this name!"})
				}
			}
		}

		const ActData = new Act(req.body);
		const result = await ActData.save();
		message = {
			error: false,
			message: "Act Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Act Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update Authority
 * @param str AuthorityId
 */
 ActRoute.patch("/update/:ActId", isAuthenticate, async (req, res) => {
	try {
		const actData = await Act.findOne({_id: req.params.ActId });

		const chechkExistence1 = await Section.findOne({act: req.params.ActId});
		const chechkExistence2 = await SupplimentaryChargesheet.findOne({$or: [{act: req.params.ActId}, {act: actData.name}]});
		const chechkExistence3 = await SurvivorChargeSheet.findOne({$or: [{"section.section_type": req.params.ActId}, {"section.section_type": actData.name}]});
		const chechkExistence4 = await SurvivorFir.findOne({$or: [{"section.section_type": req.params.ActId}, {"section.section_type": actData.name}]});
		if (chechkExistence1 || chechkExistence2 || chechkExistence3 || chechkExistence4) return res.status(200).send({error: true, message: "This act exists in other module. Can not be updated."});

		if(req.body.name) {
			const actExistingData = await Act.find({name: {$regex: req.body.name, $options: "i"}});
			if (actExistingData.length){
				for (let index = 0; index < actExistingData.length; index++) {
					if(actExistingData[index].name.toLowerCase() == req.body.name.toLowerCase()){
						return res.status(200).send({error: true, message: "An act already exists with this name!"})
					}
				}
			}
		}

		const result = await Act.findOneAndUpdate({ _id: req.params.ActId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Act  updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Act  not updated",
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
 * This method is to delete Authority
 * @param str AuthorityId
 */
//  AuthorityRoute.delete("/delete/:AuthorityId", async (req, res) => {
// 	try {
// 		const result = await Authority.deleteOne({ _id: req.params.AuthorityId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Authority deleted successfully!",
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


ActRoute.patch("/delete/:ActId", async (req, res) => {
	try {
		const actData = await Act.findOne({ _id: req.params.ActId }) 
		const existenceCheck1 = await SurvivorFir.findOne({$or: [{"section.section_type": actData?.name}, {"section.section_type": actData?._id}]});
		const existenceCheck2 = await SurvivorChargesheet.findOne({$or: [{"section.section_type": actData?.name}, {"section.section_type": actData?._id}]});
		const existenceCheck3 = await SupplimentaryChargesheet.findOne({$or: [{act: actData?.name}, {act: actData?._id}]});
		const chechkExistence4 = await Section.findOne({act: req.params.ActId});

		if (existenceCheck1 || existenceCheck2 || existenceCheck3 || chechkExistence4) return res.status(200).send({error: true, message: "This act list exists in other module. Can not be deleted."});

		const result = await Act.findOneAndUpdate({_id:req.params.ActId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Act  delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Authority not deleted",
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


module.exports = ActRoute;