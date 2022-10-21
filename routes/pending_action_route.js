require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const PendingAction = require("../models/pending_action");
const PendingActionRoute = express.Router();
const SurvivorProfile = require("../models/survivor_profile");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorRescue = require("../models/survivor_rescue");
const CIT = require("../models/cit");
/**
 * This method is to find all PendingAction
 */

PendingActionRoute.get("/list/:userId", isAuthenticate, async (req, res) => {
    try {
        let PendingActionData = await PendingAction.find({$and: [{ user: req.params.userId }, {isCompleted: false}]}).sort({_id:-1});

        message = {
            error: false,
            message: "All PendingAction list",
            data: PendingActionData,
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


PendingActionRoute.get("/list-by-userId/:userId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorProfileData = await SurvivorProfile.find({
			$and: [
				{is_deleted:false},
				{user_id: req.params.userId}
			]
		}).sort({_id: -1});
        
        let survivorIds = SurvivorProfileData.map(e => e._id.toString())
        console.log(survivorIds);


        let PendingActionData = await PendingAction.find({$and: [{ user: req.params.userId },{ survivor: {$in: survivorIds} }, {isCompleted: false}]}).sort({_id:-1});
      

        let pendingFirData = await PendingAction.find({$and: [{ survivor: {$in: survivorIds} },  { module: 'fir' }, {isCompleted: false}]})
        let pendingRescueData = await PendingAction.find({$and:[{ survivor: {$in: survivorIds} },  { module: 'rescue' }, {isCompleted: false} ]})
        let pendingCitData = await PendingAction.find({$and: [{ survivor: {$in: survivorIds} },  { module: 'cit' }, {isCompleted: false} ]})

        firCount = pendingFirData.length;
        console.log(firCount);
        rescueCount = pendingRescueData.length;
        console.log(rescueCount);
        citCount = pendingCitData.length
        console.log(citCount);

        totalCount = firCount + rescueCount + citCount;


        message = {
            error: false,
            message: "All PendingAction list",
            data: PendingActionData,
            pendingCaseCount:totalCount
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
 * This method is to PendingAction mark as read 
 */
PendingActionRoute.get("/mark-as-done/:PendingActionId", isAuthenticate, async (req, res) => {
    try {
        let PendingActionData = await PendingAction.findOneAndUpdate({ _id: req.params.PendingActionId }, {isCompleted: req.body.isCompleted}, {new: true});

        if (PendingActionData) {
            message = {
                error: false,
                message: "All PendingAction list",
                data: PendingActionData,
            };
            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "PendingAction not updated"
            };
            res.status(200).send(message);
        }
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: String(err),
        };
        res.status(200).send(message);
    }
});

module.exports = PendingActionRoute;