require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const Notification = require("../models/notification");
const NotificationRoute = express.Router();

/**
 * This method is to find all Notification
 */

NotificationRoute.get("/list/:userId", async (req, res) => {
    try {
        let NotificationData = await Notification.find({ user: req.params.userId }).sort({_id:-1});

        message = {
            error: false,
            message: "All Notification list",
            data: NotificationData,
            unreadCount: NotificationData.filter(e => e.mark_as_read == false).length
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
 * This method is to notification mark as read 
 */
NotificationRoute.patch("/mark-as-read/:notificationId", async (req, res) => {
    try {
        let NotificationData = await Notification.findOneAndUpdate({ _id: req.params.notificationId }, {mark_as_read: req.body.mark_as_read}, {new: true});
        let unreadCount = await Notification.count({$and: [{mark_as_read: false}, {user: NotificationData.user}]});

        if (NotificationData) {
            message = {
                error: false,
                message: "All Notification list",
                data: NotificationData,
                unreadCount
            };
            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Notification not updated"
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

module.exports = NotificationRoute;