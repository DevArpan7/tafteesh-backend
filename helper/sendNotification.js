const express = require('express');
const app = express();

const Notification = require('../models/notification');

const sendNotification = async (req, res) => {
    const user = req.user;
    const title = req.title;
    const description = req.description;

    const NotificationData = new Notification({user, title, description});
    const result = await NotificationData.save();
    return result;
}

module.exports = sendNotification