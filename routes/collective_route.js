require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Collective = require("../models/collective");
const CollectiveRoute = express.Router();

/**
 * This method is to find all Collectives
 */
CollectiveRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let CollectiveData = await Collective.find({is_deleted:false}).sort({_id:-1});

		let count = CollectiveData.length;

		let customCollectiveData = JSON.parse(JSON.stringify(CollectiveData))

		customCollectiveData.map(e => {
			e.collective_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})
		

        message = {
            error: false,
            message: "All Collective list",
            data: customCollectiveData,
			totalcount:count
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
 * This method is to create Collective
 */
CollectiveRoute.post("/create", async (req, res) => {
	try {
		const checkCollective = await Collective.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkCollective.length){
			for (let index = 0; index < checkCollective.length; index++) {
				if(checkCollective[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A collective already exists with this name!"})
				}
			}
		}

		// return res.status(200).send({checkCollective});

		const CollectiveData = new Collective(req.body);
		const result = await CollectiveData.save();
		message = {
			error: false,
			message: "Collective Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Collective Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Collective status
 * @param str CollectiveId
 */
CollectiveRoute.patch("/toggle-status/:CollectiveId", isAuthenticate, async (req, res) => {
	try {
		const result = await Collective.findOneAndUpdate({ _id: req.params.CollectiveId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Collective status updated successfully!",
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
 * This method is to update Collective
 * @param str CollectiveId
 */
CollectiveRoute.patch("/update/:CollectiveId", isAuthenticate, async (req, res) => {
	try {
		const checkCollective = await Collective.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkCollective.length){
			for (let index = 0; index < checkCollective.length; index++) {
				if(checkCollective[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A collective already exists with this name!"})
				}
			}
		}
		
		const result = await Collective.findOneAndUpdate({ _id: req.params.CollectiveId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Collective updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Collective not updated",
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
 * This method is to delete Collective
 * @param str CollectiveId
 */
// CollectiveRoute.delete("/delete/:CollectiveId", async (req, res) => {
// 	try {
// 		const result = await Collective.deleteOne({ _id: req.params.CollectiveId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Collective deleted successfully!",
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


CollectiveRoute.patch("/delete/:BlockId", async (req, res) => {
	try {
		const result = await Collective.findOneAndUpdate({_id:req.params.BlockId},{is_deleted: true, deleted_at: Date.now()},{new:true});
	
		if (result) {
			message = {
				error: false,
				message: "Collective deleted successfully!",
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
			data: err,
		};
		res.status(200).send(message);
	}
});

module.exports = CollectiveRoute;