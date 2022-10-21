require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const CitDetail = require("../models/cit_detail");
const CitDetailRoute = express.Router();


/**
 * This method is to find all CIT Detail
 */

 CitDetailRoute.get("/list-by-cit/:citId", isAuthenticate, async (req, res) => {
    try {
       let CitDetailData= await CitDetail.find({
			$and: [
				{is_deleted:false},
				{cit_id: req.params.citId}
			]
		}).populate([
			{
				path: "dimension_id",
				select: "name"
			},
			{
				path: "dimension_detail.question_id",
				select: "data"
			}
		]);
	   
        message = {
            error: false,
            message: "All CIT Detail list",
           	data: CitDetailData,

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
 * This method is to create CIT Detail
 */


 CitDetailRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkCitDetailExist = await CitDetail.findOne({
			$and: [
				{ cit_id: req.body.cit_id },
				{ dimension_id: req.body.dimension_id },
			]
		});
		
		if (checkCitDetailExist) {
			message = {
				error: true,
				message: "CIT Detail already exist, please add another one!"
			};
		} else {
			const CitDetailData = new CitDetail(req.body);
			const result = await CitDetailData.save();
			message = {
				error: false,
				message: "CIT Detail Added Successfully!",
				data: result,
			};
		}

		
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: String(err)
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update CIT 
 */
 CitDetailRoute.patch("/update/:citDetailId", isAuthenticate, async (req, res) => {
	try {
		const result = await CitDetail.findOneAndUpdate({ _id: req.params.citDetailId}, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "CIT detail updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "CIT detail not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: String(err)
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete CIT 
 */

//  CitDetailRoute.delete("/delete/:citDetailId", async (req, res) => {
// 	try {
// 		const result = await CitDetail.deleteOne({ _id: req.params.citDetailId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "CIT Detail deleted successfully!",
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

CitDetailRoute.patch("/delete/:citDetailId", async (req, res) => {
	try {
		const result = await CitDetail.findOneAndUpdate({ _id: req.params.citDetailId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "CIT detail deleted successfully!",
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





module.exports = CitDetailRoute;
