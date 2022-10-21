require("dotenv").config();
const express = require("express");
const ShelterHomeQuestion = require("../models/shelter_home_question");
const isAuthenticate = require("../middleware/authcheck");
const shelterHome = require("../models/shelter_home");
const ShelterHomeQuestionRoute = express.Router();
const moment = require('moment');

ShelterHomeQuestionRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let sheltereHomeQuestionData= await ShelterHomeQuestion.find({is_deleted:false}).sort({_id:-1});

		let customShelterHomeQuestionData = JSON.parse(JSON.stringify(sheltereHomeQuestionData))
		customShelterHomeQuestionData.map(e => {
			e.careated_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All shelter home question list",
            data: customShelterHomeQuestionData,
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
 * This method is to create shelterhomeQuestion
 */


 ShelterHomeQuestionRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		
		const duplicateCheck = await ShelterHomeQuestion.findOne({question: {$regex: req.body.question, $options: "i"}});
		if(duplicateCheck) return res.status(200).send({error: true, message: "A same shelter home question alreday exist!"});

		const  sheltereHomeQuestionData= new ShelterHomeQuestion(req.body);
		const result = await sheltereHomeQuestionData.save();
		message = {
			error: false,
			message: "shelter home question Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "shelter home question Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update shelter home question
 */
 ShelterHomeQuestionRoute.patch("/update/:shelterHomequestionId", isAuthenticate, async (req, res) => {
	try {

		const shelterHomeQuestionData = await ShelterHomeQuestion.findOne({_id: req.params.shelterHomequestionId});
		const checkExistence = await shelterHome.findOne({$or: [
			{"journey.question": shelterHomeQuestionData?.question},
			{"journey.question_id": shelterHomeQuestionData?._id},
		]});
		if(checkExistence) return res.status(200).send({error: true, message: "This shelter home question alreday exist in other module. Can not be upadted!"});

		const duplicateCheck = await ShelterHomeQuestion.findOne({question: {$regex: req.body.question, $options: "i"}});
		if(duplicateCheck) return res.status(200).send({error: true, message: "A same shelter home question alreday exist!"});

		const result = await ShelterHomeQuestion.findOneAndUpdate({_id: req.params.shelterHomequestionId}, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "shelter home question updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "shelter home question not updated",
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
 * This method is to delete shelterhome question
 */

//  ShelterHomeQuestionRoute.delete("/delete/:shelterHomequestionId", async (req, res) => {
// 	try {
// 		const result = await  ShelterHomeQuestion.deleteOne({ _id: req.params.shelterHomequestionId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "shelter home question deleted successfully!",
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


ShelterHomeQuestionRoute.patch("/delete/:shelterHomequestionId", async (req, res) => {
	try {
		const shelterHomeQuestionData = await ShelterHomeQuestion.findOne({_id: req.params.shelterHomequestionId});
		const checkExistence = await shelterHome.findOne({$or: [
			{"journey.question": shelterHomeQuestionData?.question},
			{"journey.question_id": shelterHomeQuestionData?._id},
		]});
		if(checkExistence) return res.status(200).send({error: true, message: "This shelter home question alreday exist in other module. Can not be Deleted!"});

		const result = await  ShelterHomeQuestion.findOneAndUpdate({ _id: req.params.shelterHomequestionId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "shelter home question deleted successfully!",
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

module.exports = ShelterHomeQuestionRoute;
