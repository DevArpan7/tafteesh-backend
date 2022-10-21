require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const Lawyer = require("../models/lawyer");
const LawyerRoute = express.Router();
const moment = require("moment");
const SurvivorLawyer = require("../models/survivor_lawyer");
const SurvivorVc = require("../models/survivor_vc");
const SurvivorVcEscalation = require("../models/vc_escalation");
/**
 * This method is to find all Lawyers
 */
LawyerRoute.get("/list", async (req, res) => {
    try {
        let LawyerData = await Lawyer.find({is_deleted:false}).populate([
			{
				path:"location",
				select:"name"
			},
			{
				path:"blockId",
				select:"name"
			},
			{
				path:"category",
				select:"name"
			},
			{
				path:"court",
				select:"name"
			}
		]).sort({_id:-1});

		let customLawyerData = JSON.parse(JSON.stringify(LawyerData))

		customLawyerData.map(e => {
			e.category_name = e.category.map(e => {return e.name}).join(",");
			e.court_name = e.court.map(e => {return e.name}).join(",");
			e.location_name = e.location?.name;
			e.category_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e;
		})

        message = {
            error: false,
            message: "All Lawyer list",
            data: customLawyerData,
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
 * This method is to find all Lawyers
 */
LawyerRoute.get("/list-by-category/:categoryId", isAuthenticate, async (req, res) => {
    try {
        let LawyerData = await Lawyer.find({
			$and: [
				{is_deleted: false},
				{category: {$in: req.params.categoryId}}
			]
		}).populate([
			
				{
					path:"location",
					select:"name"
				},
				{
					path:"blockId",
					select:"name"
				},
				{
					path:"name_of_group",
					select:"name"
				},
			
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All Lawyer list",
            data: LawyerData,
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
 * This method is to create Lawyer
 */
LawyerRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkLawyer = await Lawyer.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {location: req.body.location}, {name_of_group: req.body.name_of_group}, {blockId: req.body.blockId}, {is_deleted: false}]});
		if (checkLawyer.length) return res.status(200).send({error: true, message: "A same lawyer already exists!"})

		const LawyerData = new Lawyer(req.body);
		const result = await LawyerData.save();
		message = {
			error: false,
			message: "Lawyer Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Lawyer Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Lawyer status
 * @param str LawyerId
 */
LawyerRoute.patch("/toggle-status/:LawyerId", isAuthenticate, async (req, res) => {
	try {
		const result = await Lawyer.findOneAndUpdate({ _id: req.params.LawyerId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Lawyer status updated successfully!",
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
 * This method is to update Lawyer
 * @param str LawyerId
 */
LawyerRoute.patch("/update/:LawyerId", isAuthenticate, async (req, res) => {
	try {

		const existenceCheck1 = await SurvivorLawyer.findOne({name: req.params.LawyerId})
		const existenceCheck2 = await SurvivorVc.findOne({lawyer: req.params.LawyerId})
		const existenceCheck3 = await SurvivorVcEscalation.findOne({lawyer: req.params.LawyerId})
		if (existenceCheck1 || existenceCheck2 || existenceCheck3) return res.status(200).send({error: true, message: "This lawyer exist in other module. Can not be updated."});

		const checkLawyer = await Lawyer.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {location: req.body.location}, {name_of_group: req.body.name_of_group}, {blockId: req.body.blockId}, {is_deleted: false}]});
		if (checkLawyer.length) return res.status(200).send({error: true, message: "A same lawyer already exists!"})

		const result = await Lawyer.findOneAndUpdate({ _id: req.params.LawyerId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Lawyer updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Lawyer not updated",
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
 * This method is to delete Lawyer
 * @param str LawyerId
 */
// LawyerRoute.delete("/delete/:LawyerId", async (req, res) => {
// 	try {
// 		const result = await Lawyer.deleteOne({ _id: req.params.LawyerId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Lawyer deleted successfully!",
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
 * This method is to delete Lawyer
 * @param str LawyerId
 */

 LawyerRoute.patch("/delete/:LawyerId", async (req, res) => {
	try {
		const existenceCheck1 = await SurvivorLawyer.findOne({name: req.params.LawyerId})
		const existenceCheck2 = await SurvivorVc.findOne({lawyer: req.params.LawyerId})
		const existenceCheck3 = await SurvivorVcEscalation.findOne({lawyer: req.params.LawyerId})
		if (existenceCheck1 || existenceCheck2 || existenceCheck3) return res.status(200).send({error: true, message: "This lawyer exist in other module. Can not be deleted."});

		const result = await Lawyer.findOneAndUpdate({ _id: req.params.LawyerId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Lawyer deleted successfully!",
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


/**
 *  This method is to search Lawyer
 */

 LawyerRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await Lawyer.find({
			"$or":[{$addFields:{locationStr:{$toString: '$location'}}},{"name":{"$regex":searchText,$options: 'i' }},{"locationStr":searchText}]})
	
		if (result) {
			message = {
				error: false,
				message: "Lawyer search successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Lawyer search failed",
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



module.exports = LawyerRoute;