require("dotenv").config();
const moment = require("moment");
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const LawyerCategory = require("../models/lawyer_category");
const Lawyer = require("../models/lawyer");
const SurvivorLawyer = require("../models/survivor_lawyer");
const LawyerCategoryRoute = express.Router();
/**
 * This method is to find all Lawyer Categories
 */
LawyerCategoryRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let LawyerCategoryData = await LawyerCategory.find({is_deleted:false}).sort({_id:-1});

		let customLawyerCategoryData = JSON.parse(JSON.stringify(LawyerCategoryData))

		customLawyerCategoryData.map(e => {
			e.lawyer_category_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Lawyer Category list",
            data: customLawyerCategoryData,
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
 * This method is to create Lawyer Category
 */
LawyerCategoryRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkLawyerCategory = await LawyerCategory.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkLawyerCategory.length){
			for (let index = 0; index < checkLawyerCategory.length; index++) {
				if(checkLawyerCategory[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A lawyer category already exists with this name!"})
				}
			}
		}

		const LawyerCategoryData = new LawyerCategory(req.body);
		const result = await LawyerCategoryData.save();
		message = {
			error: false,
			message: "Lawyer Category Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Lawyer Category Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Lawyer Category status
 * @param str LawyerCategoryId
 */
LawyerCategoryRoute.patch("/toggle-status/:LawyerCategoryId", isAuthenticate, async (req, res) => {
	try {
		const result = await LawyerCategory.findOneAndUpdate({ _id: req.params.LawyerCategoryId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Lawyer Category status updated successfully!",
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Status not updated",
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

/**
 * This method is to update Lawyer Category
 * @param str LawyerCategoryId
 */
LawyerCategoryRoute.patch("/update/:LawyerCategoryId", isAuthenticate, async (req, res) => {
	try {

		const chechkEsitence1 = await Lawyer.findOne({$or: [
			{name_of_group: req.params.LawyerCategoryId},
			{category: {$in: [req.params.LawyerCategoryId]}}
		]})
		const chechkEsitence2 = await SurvivorLawyer.findOne({$or: [
			{type: req.params.LawyerCategoryId},
		]})

		if (chechkEsitence1 || chechkEsitence2) return res.status(200).send({error: true, message: "This lawyer category exist in other module. Can not be updated."})

		const checkLawyerCategory = await LawyerCategory.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkLawyerCategory.length){
			for (let index = 0; index < checkLawyerCategory.length; index++) {
				if(checkLawyerCategory[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A lawyer category already exists with this name!"})
				}
			}
		}
		
		const result = await LawyerCategory.findOneAndUpdate({ _id: req.params.LawyerCategoryId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Lawyer Category updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Lawyer Category not updated",
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
 * This method is to delete Lawyer Category
 * @param str LawyerCategoryId
 */
// LawyerCategoryRoute.delete("/harddelete/:LawyerCategoryId", async (req, res) => {
// 	try {
// 		const result = await LawyerCategory.deleteOne({ _id: req.params.LawyerCategoryId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "LawyerCategory deleted successfully!",
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


LawyerCategoryRoute.patch("/delete/:LawyerCategoryId", async (req, res) => {
	try {
		const chechkEsitence1 = await Lawyer.findOne({$or: [
			{name_of_group: req.params.LawyerCategoryId},
			{category: {$in: [req.params.LawyerCategoryId]}}
		]})
		const chechkEsitence2 = await SurvivorLawyer.findOne({$or: [
			{type: req.params.LawyerCategoryId},
		]})

		if (chechkEsitence1 || chechkEsitence2) return res.status(200).send({error: true, message: "This lawyer category exist in other module. Can not be deleted."})
		
		const result = await LawyerCategory.findOneAndUpdate({ _id: req.params.LawyerCategoryId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Lawyer category deleted successfully!",
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

module.exports = LawyerCategoryRoute;