const express = require('express');
const app = express();

const PendingAction = require('../models/pending_action');

const modules = [
    "fir", "rescue", "cit"
]

const generatePendingAction = async (req, res) => {
    const survivor = req.survivor;
    const user = req.user;
    // const username = req.username;

    const PendingActionData = new PendingAction({user, survivor, module: "fir", description: "Please add a FIR for survivor " + req.username});
    const result = await PendingActionData.save();

    const PendingActionData2 = new PendingAction({user, survivor, module: "cit", description: "Please add a CIT for survivor " + req.username});
    const result2 = await PendingActionData2.save();

    const PendingActionData3 = new PendingAction({user, survivor, module: "rescue", description: "Please add a RESCUE for survivor " + req.username});
    const result3 = await PendingActionData3.save();

    return {result, result2, result3};
}

module.exports = generatePendingAction