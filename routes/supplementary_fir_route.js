require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const SupplementaryFir = require("../models/supplementary_fir");
const SupplementaryFirRoute = express.Router();

/**
 * This method is to find all SupplementaryFir
 */

 SupplementaryFirRoute.get("/list/:SurvivorFirId", isAuthenticate, async (req, res) => {
    try {
        let SupplementaryFirData = await SupplementaryFir.find({$and:[{ survivor_Fir: req.params.SurvivorFirId },{is_deleted:false}]}).populate([
			{
				path: "policeStation",
				select: "name"
			},
			{
				path: "accused.name",
				select: "trafficker_name"
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All SupplementaryFir list",
            data: SupplementaryFirData,
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
 * This method is to create SupplementaryFir
 */


 SupplementaryFirRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SupplementaryFirData = new SupplementaryFir(req.body);
		const result = await SupplementaryFirData.save();
		message = {
			error: false,
			message: "SupplementaryFir Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "SupplementaryFir Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update SupplementaryFir
 */

 SupplementaryFirRoute.patch("/toggle-status/:SurvivorFirId", isAuthenticate, async (req, res) => {
	try {
		const result = await SupplementaryFir.findOneAndUpdate({ survivor_Fir: req.params.SurvivorFirId }, {status: req.body.status}, {new: true});
		if (result) {
			message = {
				error: false,
				message: "SupplementaryFir status updated successfully!",
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
 * This method is to update SurvivorFir
 */

 SupplementaryFirRoute.patch("/update/:SupplementaryFirId", isAuthenticate, async (req, res) => {
	try {
		
		const result = await SupplementaryFir.findOneAndUpdate({ _id: req.params.SupplementaryFirId}, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "SupplementaryFir updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "SupplementaryFir not updated",
				result
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
 * This method is to delete SupplementaryFir
 */

//  SurvivorFirRoute.delete("/delete/:SurvivorFirId", async (req, res) => {
// 	try {
// 		const result = await SurvivorFir.deleteOne({ _id: req.params.SurvivorFirId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "SurvivorFir deleted successfully!",
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




SupplementaryFirRoute.patch("/delete/:SupplementaryFirId", isAuthenticate, async (req, res) => {
	try {
		const result = await SupplementaryFir.findOneAndUpdate({ _id: req.params.SupplementaryFirId },{is_deleted:true,deleted_at:Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "SupplementaryFir deleted successfully!",
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



module.exports = SupplementaryFirRoute;