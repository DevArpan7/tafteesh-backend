const express = require('express');
const app = express();

const Changelog = require('../models/changelog');

const generateChangelog = async (req, res) => {
    const targeted_data = req.targeted_data;
    const targeted_data_ref = req.targeted_data_ref;
    const survivor = req.survivor;
    const old_data = req.old_data;
    const description = req.description;
    const new_data = req.new_data;
    const status = req.status;
    const changed_by = req.changed_by;
    const changed_by_ref = req.changed_by_ref;
    const module = req.module;
    const note = req.note;
    const ChangelogData = new Changelog({targeted_data, targeted_data_ref, old_data, description, new_data, status, changed_by, changed_by_ref, module, note, survivor});
    const result = await ChangelogData.save();
    return result;
}

module.exports = generateChangelog