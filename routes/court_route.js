require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Court = require("../models/court");
const CourtRoute = express.Router();

/**
 * This method is to find all Courts
 */
CourtRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let CourtData = await Court.find({is_deleted:false}).populate([
			{
				path:"stateId",
				select:"name"
			},
			{
				path:"districtId",
				select:"name"
			}
		]).sort({_id:-1});

		let customCourtData = JSON.parse(JSON.stringify(CourtData))

		customCourtData.map(e => {
			e.state_name = e?.stateId?.name
			e.district_name = e?.districtId?.name
			e.court_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Court list",
            data: customCourtData,
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
 * This method is to find all Courts by StateId
 */
CourtRoute.get("/list-by-state/:stateId", isAuthenticate, async (req, res) => {
    try {
        let CourtData = await Court.find({$and: [{stateId: req.params.stateId},{is_deleted:false}]}).populate([
			{
				path:"stateId",
				select:"name"
			},
			{
				path:"districtId",
				select:"name"
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All Court list",
            data: CourtData,
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
 * This method is to create Court
 */
CourtRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkCourt = await Court.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {stateId: req.body.stateId}, {districtId: req.body.districtId}, {is_deleted: false}]})
		if (checkCourt.length) return res.status(200).send({error: true, message: "A same court already exists!"});
		
		const CourtData = new Court(req.body);
		const result = await CourtData.save();
		message = {
			error: false,
			message: "Court Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Court Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Court status
 * @param str CourtId
 */
CourtRoute.patch("/toggle-status/:CourtId", isAuthenticate, async (req, res) => {
	try {
		const result = await Court.findOneAndUpdate({ _id: req.params.CourtId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Court status updated successfully!",
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
CourtRoute.patch("/update/:CourtId", isAuthenticate, async (req, res) => {
	try {
		const checkCourt = await Court.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {stateId: req.body.stateId}, {districtId: req.body.districtId}, {is_deleted: false}]})
		if (checkCourt.length) return res.status(200).send({error: true, message: "A same court already exists!"});
		
		const result = await Court.findOneAndUpdate({ _id: req.params.CourtId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Court updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Court not updated",
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
// CourtRoute.delete("/delete/:CourtId", async (req, res) => {
// 	try {
// 		const result = await Court.deleteOne({ _id: req.params.CourtId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Court deleted successfully!",
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

CourtRoute.patch("/delete/:CourtId", async (req, res) => {
	try {
		const result = await Court.findOneAndUpdate({ _id: req.params.CourtId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Court deleted successfully!",
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



module.exports = CourtRoute;