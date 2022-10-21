require("dotenv").config();
const express = require("express");
const moment = require("moment");
const CIT = require("../models/cit");
const CitDimension = require("../models/cit_dimension");
const CitDetail = require("../models/cit_detail");
const PendingAction = require("../models/pending_action");
const sendNotification = require("../helper/sendNotification");
const isAuthenticate = require("../middleware/authcheck");
const CITRoute = express.Router();
const citStatus = require("../models/status_master/cit_status");
const CitDimensionQuestion = require("../models/cit_dimension_question");
const CitVersion = require("../models/cit_version");
const SurvivorProfile = require("../models/survivor_profile");
/**
 * This method is to find all CIT 
 */

 CITRoute.get("/all-list", isAuthenticate, async (req, res) => {
    try {
		let survivorData = await SurvivorProfile.find({ is_deleted: false });
        let survivorIds = survivorData.map(e => e._id.toString());
		//console.log(survivorIds);
        let CITData= await CIT.find({$and:[
			{is_deleted:false},
			{survivor: {$in: survivorIds}}
		]}).populate([
			{
				path: 'survivor',
				select: "survivor_name"
			},
			{
				path: 'status_of_cit',
				select: "name"
			}
		]).sort({_id:-1});


		let customCitData = JSON.parse(JSON.stringify(CITData))

		customCitData.map(e => {
			e.custom_survivor_name = e.survivor?.survivor_name;
			e.cit_assessment_date = e?.assessment_date ? moment(e?.assessment_date.split("T")[0]).format('DD-MMM-YYYY') : '';
			e.cit_next_assesment_date = e?.next_assesment_date ? moment(e?.next_assesment_date.split("T")[0]).format('DD-MMM-YYYY') : '';
			e.approval_data = e.approval? 'YES' : 'NO'
			return e;
		})

	
        message = {
            error: false,
            message: "All CIT list",
            data: customCitData,
			
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
 * This method is to find all CIT 
 */

 CITRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let CITData= await CIT.find({$and:[
			{ survivor: req.params.SurvivorProfileId },
			{is_deleted:false}
		]}).populate([
			{
				path: 'survivor',
				select: "survivor_name"
			},
			{
				path: 'status_of_cit',
				select: "name"
			}
		]).sort({_id:-1});

		let customCitData = JSON.parse(JSON.stringify(CITData))

		customCitData.map(e => {
			e.custom_survivor_name = e.survivor?.survivor_name;
			e.cit_assessment_date =  moment(e?.assessment_date.split("T")[0]).format('DD-MMM-YYYY');
			e.cit_next_assesment_date =  moment(e?.next_assesment_date.split("T")[0]).format('DD-MMM-YYYY');
			e.approval_data = e.approval? 'YES' : 'NO'
			return e
		})

		
		let citStatusData = await citStatus.find({is_deleted:false}).sort({_id:-1});
		let citDimensionQuestionData = await CitDimensionQuestion.find({is_deleted:false}).sort({_id:-1})
		let citVersionData = await CitVersion.find({is_deleted:false}).sort({_id:-1})



        message = {
            error: false,
            message: "All CIT list",
            data: customCitData,
			masterCitStatusData: citStatusData,
			masterCitDimensionQuestionData: citDimensionQuestionData,
			masterCitVersionData: citVersionData
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
 * This method is to find CIT star 
 */

 CITRoute.get("/star/:SurvivorProfileId", async (req, res) => {
    try {
        let CitData = await CitDetail.find({
			$and:[
				{ survivor: req.params.SurvivorProfileId},
				{ is_deleted: false }
			]
		}).populate([
			{
				path: "cit_id",
				select: "assessment_date survivor"
			},
			{
				path: "dimension_id",
				select: "name cit_version is_deleted",
				populate: { path: 'cit_version' }
			}
		]);

		// return res.status(200).send({CitData})

		let datas = CitData.map( e => {
			if (!e.dimension_id?.is_deleted && e.dimension_id?.cit_version && !e.dimension_id?.cit_version?.is_deleted) {
				return String(e.dimension_id?._id);
			}
		})
		
		let citDimensionIds = [...new Set(datas)] //remove duplicacy

		// return res.status(200).send(citDimensionIds.includes("abc"));

		let dimensions = await CitDimension.find({ is_deleted: false }).populate([{path: "cit_version"}]);

		// return res.status(200).send({dimensions})

		dimensions = dimensions.filter(e => e?.cit_version && !e?.cit_version?.is_deleted)
		let starData = [];

		console.log(citDimensionIds);
		console.log(CitData);
		dimensions.forEach((element, index) => {
			let citDetails = CitData.filter(e => (String(e.dimension_id?._id) == String(element._id)) && e.cit_id && (String(e.cit_id?.survivor) == String(req.params.SurvivorProfileId)))
			if (citDimensionIds.includes(String(element._id))) {
				starData[index] = {
					dimension: {
						_id: element._id,
						name: element.name
					},
					cits: []
				}
				citDetails.forEach((element) => {
					starData[index]?.cits.push({
						date: element?.cit_id?.assessment_date || null,
						score: element?.dimension_score || null
					})
				})
			} else {
				starData[index] = {
					dimension: {
						_id: element._id,
						name: element.name
					},
					cits: []
				}
			}
			
		})
		return res.status(200).send({starData});

        message = {
            error: false,
            message: "All CIT list",
            data: CITData,
        };
        res.status(200).send(message);
    } catch(err) {
        message = {
            error: true,
            message: "operation failed!",
            data: String(err),
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to create CIT 
 */


 CITRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		req.body.unique_id = 'SURV-CIT-' + Date.now();
		let newDate = new Date(req.body.assessment_date);
		let nowDate = moment(newDate).add(6, 'months').format();
		console.log(nowDate);
		req.body.next_assesment_date = nowDate
		const CitData = new CIT(req.body);
		let survivorId = CitData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		console.log(survivorData?.date_of_trafficking);
		console.log(CitData?.assessment_date);
		
		if (CitData?.assessment_date <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "Assesment date should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		const result = await CitData.save();

		if (result?.survivor) {
			let checkPendingActionData = await PendingAction.findOneAndUpdate({$and: [{ survivor: result?.survivor }, { module: 'cit' }]}, {isCompleted: true});
		}

		message = {
			error: false,
			message: "CIT Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message:  String(err)
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update CIT 
 */
 CITRoute.patch("/update/:citId", isAuthenticate, async (req, res) => {
	try {
		const CheckCitData = await CIT.findOne({$and:[
			{ _id: req.params.citId},{is_deleted:false}
		]})
		if (!CheckCitData) return res.status(200).send({error: true, message: "Survivor CIT not found"}) 
		let survivorId = CheckCitData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		if (req.body.assessment_date && (new Date(req.body.assessment_date) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Assesment date should be after date of trafficking"})
			 
		if (req.body.assessment_date) {
			let newDate = new Date(req.body.assessment_date);
			let nowDate = moment(newDate).add(6, 'months').format();
			console.log(nowDate);
			req.body.next_assesment_date = nowDate
		}
		
		const result = await CIT.findOneAndUpdate({ _id: req.params.citId}, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "CIT updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "CIT not updated",
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
 * This method is to update CIT approval status
 */
 CITRoute.patch("/toggle-approval/:citId", isAuthenticate, async (req, res) => {
	try {
		const result = await CIT.findOneAndUpdate({ _id: req.params.citId}, {approval: req.body.approval}, {new: true}).populate([
			{
				path: "survivor",
				select: "organization user_id survivor_id survivor_name"
			}
		]);

		if (result) {
			if (result?.survivor?.user_id) {
                let sendNotificationData = await sendNotification({
					user: result?.survivor?.user_id,
					title: "Admin Approves CIT record",
					description: "CIT record for "+ result?.survivor?.survivor_id +" with name "+ result?.survivor?.survivor_name +" has been approved and published ."
                });
				console.log(sendNotificationData);
            }
			message = {
				error: false,
				message: "CIT approved successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "CIT not approved",
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
 * This method is to delete CIT 
 */

//  CitDimensionRoute.delete("/delete/:citId", async (req, res) => {
// 	try {
// 		const result = await CitDimension.deleteOne({ _id: req.params.citDimensionId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "CIT Dimension deleted successfully!",
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

CITRoute.patch("/delete/:citId", async (req, res) => {
	try {
		const result = await CIT.findOneAndUpdate({ _id: req.params.citId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "CIT deleted successfully!",
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



module.exports = CITRoute;
