require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Block = require("../models/block");
const Lawyer = require("../models/lawyer");
const policeStation = require("../models/police_station");
const SurvivorProfile = require("../models/survivor_profile");
const User = require("../models/user");
const BlockRoute = express.Router();

/**
 * This method is to find all blocks
 */
BlockRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let BlockData = await Block.find({is_deleted:false}).populate([
			{
				path: 'stateId',
				select: "name"
			},
			{
				path: 'districtId',
				select: "name"
			}
		]).sort({_id:-1});

		let customBlockData = JSON.parse(JSON.stringify(BlockData))

		customBlockData.map(e => {
			e.state_name = e?.stateId?.name
			e.district_name = e?.districtId?.name
			e.block_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Block list",
            data: customBlockData,
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
 * This method is to find all blocks district and state wise
 * @param str stateiId
 * @param str districtId
 */
BlockRoute.get("/list-by-state-district/:stateId/:districtId", isAuthenticate, async (req, res) => {
    try {
        let BlockData = await Block.find({$and: [{stateId: req.params.stateId}, {districtId: req.params.districtId},{is_deleted:false}]}).populate([
			{
				path: 'stateId',
				select: "name"
			},
			{
				path: 'districtId',
				select: "name"
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All Block list",
            data: BlockData,
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
 * This method is to create block
 */
BlockRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkBlock = await Block.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {stateId: req.body. stateId}, {districtId: req.body.districtId}]});
		if (checkBlock.length) return res.status(200).send({error: true, message: "A same block already exists!"})

		const BlockData = new Block(req.body);
		const result = await BlockData.save();
		message = {
			error: false,
			message: "Block Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Block Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update block status
 * @param str BlockId
 */
BlockRoute.patch("/toggle-status/:BlockId", isAuthenticate, async (req, res) => {
	try {
		const result = await Block.findOneAndUpdate({ _id: req.params.BlockId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Block status updated successfully!",
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
 * This method is to update block
 * @param str BlockId
 */
BlockRoute.patch("/update/:BlockId", isAuthenticate, async (req, res) => {
	try {
		const chechkExistence1 = await Lawyer.findOne({blockId: req.params.BlockId});
		const chechkExistence2 = await policeStation.findOne({blockId: req.params.BlockId});
		const chechkExistence3 = await SurvivorProfile.findOne({block: req.params.BlockId});
		const chechkExistence4 = await User.findOne({block: req.params.BlockId});

		if(chechkExistence1 || chechkExistence2 || chechkExistence3 || chechkExistence4) return res.status(200).send({error: true, message: "This block exist in other module. Can not be updated."})

		const checkBlock = await Block.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {stateId: req.body. stateId}, {districtId: req.body.districtId}]});
		if (checkBlock.length) return res.status(200).send({error: true, message: "A same block already exists!"})

		const result = await Block.findOneAndUpdate({ _id: req.params.BlockId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Block updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Block not updated",
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
 * This method is to delete block
 * @param str BlockId
 */
BlockRoute.patch("/delete/:BlockId", async (req, res) => {
	try {
		const chechkExistence1 = await Lawyer.findOne({blockId: req.params.BlockId});
		const chechkExistence2 = await policeStation.findOne({blockId: req.params.BlockId});
		const chechkExistence3 = await SurvivorProfile.findOne({block: req.params.BlockId});
		const chechkExistence4 = await User.findOne({block: req.params.BlockId});

		if(chechkExistence1 || chechkExistence2 || chechkExistence3 || chechkExistence4) return res.status(200).send({error: true, message: "This block exist in other module. Can not be deleted."})
		
		const result = await Block.findOneAndUpdate({_id:req.params.BlockId},{is_deleted: true, deleted_at: Date.now()},{new:true});
	
		if (result) {
			message = {
				error: false,
				message: "Block deleted successfully!",
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

module.exports = BlockRoute;