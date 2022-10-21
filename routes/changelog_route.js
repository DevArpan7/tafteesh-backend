require("dotenv").config();
const express = require("express");
const Changelog = require("../models/changelog");
const ChangeLogRoute = express.Router();
var _ = require('lodash');

/**
 * This method is to find all changelogs
 */
ChangeLogRoute.get("/list/:moduleType", async (req, res) => {
    try {
        let ChangelogData = await Changelog.find({
            $and: [
                {module: req.params.moduleType}
            ]
        }).sort({_id:-1});

        message = {
            error: false,
            message: "All changelog list",
            data: ChangelogData,
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

ChangeLogRoute.get("/list/:moduleType/:changedById", async (req, res) => {
    try {
        let ChangelogData = await Changelog.find({
            $and: [
                {module: req.params.moduleType},
                {changed_by:req.params.changedById}
            ]
        }).populate([
            {
                path: "changed_by",
                select:"fname lname username"
            },
            {
                path: "survivor",
                select:"survivor_name"
            }
        ]).sort({ _id: -1 });

        // let changes = _.isEqual(JSON.parse(ChangelogData[0].old_data)[0], JSON.parse(ChangelogData[0].new_data));

        // console.log('old data', JSON.parse(ChangelogData[0].old_data)[0]);
        // console.log('new data', JSON.parse(ChangelogData[0].new_data));

        message = {
            error: false,
            message: "All changelog list",
            // changes,
            data: ChangelogData,
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


ChangeLogRoute.get("/list2/:moduleType/:changedById/:survivorId", async (req, res) => {
    try {
        let ChangelogData = await Changelog.find({
            $and: [
                {module: req.params.moduleType},
                {changed_by:req.params.changedById},
                {survivor:req.params.survivorId}
            ]
        }).populate([
            {
                path: "changed_by",
                select:"fname lname username"
            },
            {
                path: "survivor",
                select:"survivor_name"
            }
        ]).sort({_id:-1});

        message = {
            error: false,
            message: "All changelog list",
            data: ChangelogData,
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




module.exports = ChangeLogRoute;