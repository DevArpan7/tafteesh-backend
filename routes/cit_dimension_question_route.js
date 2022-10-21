require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const CitDimensionQuestion = require("../models/cit_dimension_question");
const CitDimensionQuestionRoute = express.Router();
const moment = require("moment");
/**
 * This method is to find all cit dimension question
 */
 CitDimensionQuestionRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let CitDimensionQuestionData = await CitDimensionQuestion.find({is_deleted:false}).populate({
			path: "cit_dimension",
			select:"name"
		}).sort({_id: -1});

		let customCitDimensionQuestionData = JSON.parse(JSON.stringify(CitDimensionQuestionData))
		customCitDimensionQuestionData.map(e => {
			e.citDimensionName = e?.cit_dimension?.name;
			e.createdAtDate = moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All CIT Dimension question list",
            data: customCitDimensionQuestionData,
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

CitDimensionQuestionRoute.get("/list-by-dimension/:dimensionId", isAuthenticate, async (req, res) => {
    try {
        let CitDimensionQuestionData = await CitDimensionQuestion.find({
			$and: [
				{is_deleted:false},
				{cit_dimension:req.params.dimensionId}
			]
		}).populate({
			path: "cit_dimension",
			select:"name"
		});

        message = {
            error: false,
            message: "All CIT Dimension question list",
            data: CitDimensionQuestionData,
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
 * This method is to create cit dimension question
 */
 CitDimensionQuestionRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const CitDimensionQuestionData = new CitDimensionQuestion(req.body);
		const result = await CitDimensionQuestionData.save();

		message = {
			error: false,
			message: "Cit Dimension Question Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Cit Dimension Question Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update cit dimension question
 * @param str CitDimensionQuestionId
 */
 CitDimensionQuestionRoute.patch("/update/:CitDimensionQuestionId", isAuthenticate, async (req, res) => {
	try {
		const result = await CitDimensionQuestion.findOneAndUpdate({ _id: req.params.CitDimensionQuestionId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Cit Dimension question updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Cit Dimension question not updated",
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
 * This method is to delete cit dimension question
 * @param str CitDimensionQuestionId
 */
//  CitDimensionQuestionRoute.delete("/delete/:CitDimensionQuestionId", async (req, res) => {
// 	try {
// 		const result = await CitDimensionQuestion.deleteOne({ _id: req.params.CitDimensionQuestionId });
// 		if (result) {
// 			message = {
// 				error: false,
// 				message: "cit dimension question deleted successfully!",
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

 CitDimensionQuestionRoute.patch("/delete/:CitDimensionQuestionId", async (req, res) => {
	try {
		const result = await CitDimensionQuestion.findOneAndUpdate({ _id: req.params.CitDimensionQuestionId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "cit dimension question deleted successfully!",
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



module.exports = CitDimensionQuestionRoute;