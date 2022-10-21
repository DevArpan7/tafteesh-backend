require("dotenv").config();
const express = require("express");
const moment = require("moment");
const District = require("../models/district");
const Block = require("../models/block");
const City = require("../models/city");
const Court = require("../models/court");
const Organization = require("../models/organization");
const policeStation = require("../models/police_station");
const State = require("../models/state");
const SurvivorProfile = require("../models/survivor_profile");
const SurvivorRescue = require("../models/survivor_rescue");
const User = require("../models/user");
const DistrictRoute = express.Router();
const isAuthenticate = require("../middleware/authcheck");

/**
 * This method is to find all Districts
 */
DistrictRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let DistrictData = await District.find({is_deleted:false}).populate([
			{
				path: 'stateId',
				select: "name"
			}
		]).sort({_id:-1});

		
		let customDistrictData = JSON.parse(JSON.stringify(DistrictData))

		customDistrictData.map(e => {
			e.state_name = e?.stateId?.name
			e.district_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All District list",
            data: customDistrictData,
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
 * This method is to find all Districts state wise
 * @param str stateId
 */
DistrictRoute.get("/list-by-state/:stateId", isAuthenticate, async (req, res) => {
    try {
        let DistrictData = await District.find({$and:[{stateId: req.params.stateId},{is_deleted:false}]}).populate([
			{
				path: 'stateId',
				select: "name"
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All District list",
            data: DistrictData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: String(err),
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to create Court
 */
DistrictRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkDistrict = await District.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {stateId: req.body.stateId}, {is_deleted: false}]});
		if (checkDistrict.length) return res.status(200).send({error: true, message: "A same district already exists!"})

		const DistrictData = new District(req.body);
		const result = await DistrictData.save();
		message = {
			error: false,
			message: "District Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "District Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Court status
 * @param str CourtId
 */
DistrictRoute.patch("/toggle-status/:DistrictId", isAuthenticate, async (req, res) => {
	try {
		const result = await District.findOneAndUpdate({ _id: req.params.DistrictId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "District status updated successfully!",
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
 * This method is to update Court
 * @param str CourtId
 */
DistrictRoute.patch("/update/:DistrictId", isAuthenticate, async (req, res) => {
	try {
		const districtData = await District.findOne({_id: req.params.DistrictId});
		const chechkEsitence1 = await Block.findOne({districtId: req.params.DistrictId})
		const chechkEsitence2 = await City.findOne({districtId: req.params.DistrictId})
		const chechkEsitence3 = await Court.findOne({districtId: req.params.DistrictId})

		const chechkEsitence4 = await policeStation.findOne({districtId: req.params.DistrictId})
		const chechkEsitence6 = await SurvivorProfile.findOne({district: districtData._id})
		const chechkEsitence7 = await User.findOne({district: districtData._id})

		if(chechkEsitence1 || chechkEsitence2 || chechkEsitence3 || chechkEsitence4 || chechkEsitence6 || chechkEsitence7) return res.status(200).send({error: true, message: "This district exist in other module. Can not be updated."})

		const checkDistrict = await District.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {stateId: req.body.stateId}, {is_deleted: false}]});
		if (checkDistrict.length) return res.status(200).send({error: true, message: "A same district already exists!"})

		const result = await District.findOneAndUpdate({ _id: req.params.DistrictId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "District updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "District not updated",
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
 * This method is to delete Court
 * @param str CourtId
 */
DistrictRoute.delete("/delete/:DistrictId", async (req, res) => {
	try {

		const result = await District.deleteOne({ _id: req.params.DistrictId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "District deleted successfully!",
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
			data: err,
		};
		res.status(200).send(message);
	}
});

DistrictRoute.patch("/delete/:DistrictId", async (req, res) => {
	try {
		const districtData = await District.findOne({_id: req.params.DistrictId});
		const chechkEsitence1 = await Block.findOne({districtId: req.params.DistrictId})
		const chechkEsitence2 = await City.findOne({districtId: req.params.DistrictId})
		const chechkEsitence3 = await Court.findOne({districtId: req.params.DistrictId})

		const chechkEsitence4 = await policeStation.findOne({districtId: req.params.DistrictId})
		const chechkEsitence6 = await SurvivorProfile.findOne({district: districtData._id})
		const chechkEsitence7 = await User.findOne({district: districtData._id})

		// return res.status(200).send({chechkEsitence1, chechkEsitence2, chechkEsitence3, chechkEsitence4, chechkEsitence6, chechkEsitence7})

		if(chechkEsitence1 || chechkEsitence2 || chechkEsitence3 || chechkEsitence4 || chechkEsitence6 || chechkEsitence7) return res.status(200).send({error: true, message: "This district exist in other module. Can not be deleted."})
		
		const result = await District.findOneAndUpdate({ _id: req.params.DistrictId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "District deleted successfully!",
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
			data: err,
		};
		res.status(200).send(message);
	}
});

module.exports = DistrictRoute;