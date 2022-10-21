require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Block = require("../models/block");
const City = require("../models/city");
const District = require("../models/district");
const Lawyer = require("../models/lawyer");
const Organization = require("../models/organization");
const policeStation = require("../models/police_station");
const State = require("../models/state");
const SurvivorProfile = require("../models/survivor_profile");
const SurvivorRescue = require("../models/survivor_rescue");
const User = require("../models/user");
const StateRoute = express.Router();

/**
 * This method is to find all States
 */
StateRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let StateData = await State.find({is_deleted:false}).sort({_id:-1});

		let customStateData = JSON.parse(JSON.stringify(StateData))

		customStateData.map(e => {
			e.state_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All State list",
            data: customStateData,
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
 * This method is to create State
 */
StateRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkState = await State.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkState.length){
			for (let index = 0; index < checkState.length; index++) {
				if(checkState[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A state already exists with this name!"})
				}
			}
		}
		
		const StateData = new State(req.body);
		const result = await StateData.save();
		message = {
			error: false,
			message: "State Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "State Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update State status
 * @param str StateId
 */
StateRoute.patch("/toggle-status/:StateId", isAuthenticate, async (req, res) => {
	try {
		const result = await State.findOneAndUpdate({ _id: req.params.StateId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "State status updated successfully!",
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
 * This method is to update State
 * @param str StateId
 */
StateRoute.patch("/update/:StateId", isAuthenticate, async (req, res) => {
	try {
		const stateData = await State.findOne({_id: req.params.StateId});
		const chechkEsitence1 = await Block.findOne({stateId: req.params.StateId})
		const chechkEsitence2 = await City.findOne({stateId: req.params.StateId})
		const chechkEsitence3 = await District.findOne({stateId: req.params.StateId})
		const chechkEsitence4 = await Lawyer.findOne({location: req.params.StateId})
		const chechkEsitence5 = await policeStation.findOne({stateId: req.params.StateId})
		const chechkEsitence6 = await Organization.findOne({$or: [{state: stateData.name}, {state_name: req.params.StateId}]})
		const chechkEsitence7 = await SurvivorProfile.findOne({state: stateData._id})
		const chechkEsitence8 = await SurvivorRescue.findOne({rescue_from_state: stateData._id})
		const chechkEsitence9 = await User.findOne({state: stateData._id})

		if (chechkEsitence1 || chechkEsitence2 || chechkEsitence3 || chechkEsitence4 || chechkEsitence5 || chechkEsitence6 || chechkEsitence7 || chechkEsitence8 || chechkEsitence9) return res.status(200).send({error: true, message: "This state exist in other module. Can not be updated."})

		const checkState = await State.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkState.length){
			for (let index = 0; index < checkState.length; index++) {
				if(checkState[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A state already exists with this name!"})
				}
			}
		}

		const result = await State.findOneAndUpdate({ _id: req.params.StateId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "State updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "State not updated",
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
 * This method is to delete State
 * @param str StateId
 */
// StateRoute.delete("/delete/:StateId", async (req, res) => {
// 	try {
// 		const result = await State.deleteOne({ _id: req.params.StateId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "State deleted successfully!",
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


StateRoute.patch("/delete/:StateId", async (req, res) => {
	try {
		const stateData = await State.findOne({_id: req.params.StateId});
		const chechkEsitence1 = await Block.findOne({stateId: req.params.StateId})
		const chechkEsitence2 = await City.findOne({stateId: req.params.StateId})
		const chechkEsitence3 = await District.findOne({stateId: req.params.StateId})
		const chechkEsitence4 = await Lawyer.findOne({location: req.params.StateId})
		const chechkEsitence5 = await policeStation.findOne({stateId: req.params.StateId})
		const chechkEsitence6 = await Organization.findOne({$or: [{state: stateData.name}, {state_name: req.params.StateId}]})
		const chechkEsitence7 = await SurvivorProfile.findOne({state: stateData._id})
		const chechkEsitence8 = await SurvivorRescue.findOne({rescue_from_state: stateData._id})
		const chechkEsitence9 = await User.findOne({state: stateData._id})

		if (chechkEsitence1 || chechkEsitence2 || chechkEsitence3 || chechkEsitence4 || chechkEsitence5 || chechkEsitence6 || chechkEsitence7 || chechkEsitence8 || chechkEsitence9) return res.status(200).send({error: true, message: "This state exist in other module. Can not be deleted."})

		const result = await State.findOneAndUpdate({ _id: req.params.StateId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "State deleted successfully!",
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


module.exports = StateRoute;