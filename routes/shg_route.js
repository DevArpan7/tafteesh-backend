require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Shg = require("../models/shg");
const ShgRoute = express.Router();

/**
 * This method is to find all Shgs
 */
ShgRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let ShgData = await Shg.find({is_deleted:false}).sort({_id:-1});
		let count = ShgData.length;

		let customShgData = JSON.parse(JSON.stringify(ShgData))

		customShgData.map(e => {
			e.shg_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})
		

        message = {
            error: false,
            message: "All Shg list",
            data: customShgData,
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
 * This method is to create Shg
 */
ShgRoute.post("/create", async (req, res) => {
	try {
		const checkShg = await Shg.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkShg.length){
			for (let index = 0; index < checkShg.length; index++) {
				if(checkShg[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A SHG already exists with this name!"})
				}
			}
		}
		// return res.status(200).send({checkShg})

		const ShgData = new Shg(req.body);
		const result = await ShgData.save();
		message = {
			error: false,
			message: "Shg Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Shg Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Shg status
 * @param str ShgId
 */
ShgRoute.patch("/toggle-status/:ShgId", isAuthenticate, async (req, res) => {
	try {
		const result = await Shg.findOneAndUpdate({ _id: req.params.ShgId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Shg status updated successfully!",
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
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to update Shg
 * @param str ShgId
 */
ShgRoute.patch("/update/:ShgId", isAuthenticate, async (req, res) => {
	try {
		const checkShg = await Shg.find({$and: [{name: {$regex: req.body.name, $options: 'i'}}, {is_deleted: false}]})
		if (checkShg.length){
			for (let index = 0; index < checkShg.length; index++) {
				if(checkShg[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A SHG already exists with this name!"})
				}
			}
		}

		
		const result = await Shg.findOneAndUpdate({ _id: req.params.ShgId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Shg updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Shg not updated",
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
 * This method is to delete Shg
 * @param str ShgId
 */
// ShgRoute.delete("/delete/:ShgId", async (req, res) => {
// 	try {
// 		const result = await Shg.deleteOne({ _id: req.params.ShgId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Shg deleted successfully!",
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


ShgRoute.patch("/delete/:ShgId", async (req, res) => {
	try {
		const result = await Shg.findOneAndUpdate({ _id: req.params.ShgId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "SHG deleted successfully!",
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


module.exports = ShgRoute;