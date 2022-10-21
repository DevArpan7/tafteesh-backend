require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const PoliceStation = require("../models/police_station");
const SupplementaryFir = require("../models/supplementary_fir");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorProfile = require("../models/survivor_profile");
const PoliceStationRoute = express.Router();

/**
 * This method is to find all Police Stations
 */
PoliceStationRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let PoliceStationData = await PoliceStation.find({is_deleted:false}).populate([
			{
				path: 'stateId',
				select: "name"
			},
			{
				path: 'districtId',
				select: "name"
			},
			{
				path: 'blockId',
				select: "name"
			}

		]).sort({_id:-1});

		let customPoliceStationData = JSON.parse(JSON.stringify(PoliceStationData))

		customPoliceStationData.map(e => {
			e.state_name = e?.stateId?.name
			e.district_name = e?.districtId?.name
			e.block_name = e?.blockId?.name
			e.police_station_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All PoliceStation list",
            data: customPoliceStationData,
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
 * This method is to create Police Station
 */
PoliceStationRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkPoliceStation = await PoliceStation.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {stateId: req.body.stateId}, {districtId: req.body.districtId}, {blockId: req.body.blockId}]});
		if (checkPoliceStation.length) return res.status(200).send({error: true, message: "A same police station already exists!"})

		const PoliceStationData = new PoliceStation(req.body);
		const result = await PoliceStationData.save();
		message = {
			error: false,
			message: "Police Station Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Police Station Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Police Station status
 * @param str PoliceStationId
 */
PoliceStationRoute.patch("/toggle-status/:PoliceStationId", isAuthenticate, async (req, res) => {
	try {
		const result = await PoliceStation.findOneAndUpdate({ _id: req.params.PoliceStationId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Police Station status updated successfully!",
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
 * This method is to update Police Station
 * @param str PoliceStationId
 */
PoliceStationRoute.patch("/update/:PoliceStationId", isAuthenticate, async (req, res) => {
	try {
		const chechkExistence1 = await SupplementaryFir.findOne({policeStation: req.params.PoliceStationId});
		const chechkExistence2 = await SurvivorFir.findOne({policeStation: req.params.PoliceStationId});
		const chechkExistence3 = await SurvivorProfile.findOne({$or: [{police_station: req.params.PoliceStationId}, {rescuing_police_station: req.params.PoliceStationId}]});

		if(chechkExistence1 || chechkExistence2 || chechkExistence3) return res.status(200).send({error: true, message: "This police station exist in other module. Can not be updated."});

		const checkPoliceStation = await PoliceStation.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {stateId: req.body.stateId}, {districtId: req.body.districtId}, {blockId: req.body.blockId}]});
		if (checkPoliceStation.length) return res.status(200).send({error: true, message: "A same police station already exists!"})

		const result = await PoliceStation.findOneAndUpdate({ _id: req.params.PoliceStationId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Police Station updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Police Station not updated",
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
 * This method is to delete Police Station
 * @param str PoliceStationId
 */
// PoliceStationRoute.delete("/delete/:PoliceStationId", async (req, res) => {
// 	try {
// 		const result = await PoliceStation.deleteOne({ _id: req.params.PoliceStationId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "PoliceStation deleted successfully!",
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


PoliceStationRoute.patch("/delete/:PoliceStationId", async (req, res) => {
	try {
		const chechkExistence1 = await SupplementaryFir.findOne({policeStation: req.params.PoliceStationId});
		const chechkExistence2 = await SurvivorFir.findOne({policeStation: req.params.PoliceStationId});
		const chechkExistence3 = await SurvivorProfile.findOne({$or: [{police_station: req.params.PoliceStationId}, {rescuing_police_station: req.params.PoliceStationId}]});

		if(chechkExistence1 || chechkExistence2 || chechkExistence3) return res.status(200).send({error: true, message: "This police station exist in other module. Can not be deleted."})

		const result = await PoliceStation.findOneAndUpdate({ _id: req.params.PoliceStationId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "PoliceStation deleted successfully!",
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

module.exports = PoliceStationRoute;