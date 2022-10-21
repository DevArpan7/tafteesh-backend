require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const CitDimensionQuestion = require("../models/cit_dimension_question");
const CitDimension = require("../models/cit_dimension");
const CitDimensionRoute = express.Router();
const moment = require("moment");

/**
 * This method is to find all CIT Dimension
 */

CitDimensionRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let CitDimensionData= await CitDimension.find({is_deleted:false}).populate([
            {path: "cit_version", select: "name is_deleted"}
        ]);

		CitDimensionData = CitDimensionData.filter(e => e?.cit_version && !e?.cit_version?.is_deleted)

		let customCitDimensionData = JSON.parse(JSON.stringify(CitDimensionData))
		customCitDimensionData.map(e => {
			e.citVersionName = e?.cit_version?.name;
			e.createdAtDate = moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All CIT Dimension list",
            data: customCitDimensionData,
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
 * This method is to find all CIT Dimension
 */

CitDimensionRoute.get("/list-all", isAuthenticate, async (req, res) => {
    try {
        let CitDimensionData= await CitDimension.find({is_deleted:false}).populate([
			{
				path: "cit_version"
			}
		]);

		CitDimensionData = CitDimensionData.filter(e => e?.cit_version && !e?.cit_version?.is_deleted)


		let customCitDimensionData = JSON.parse(JSON.stringify(CitDimensionData))
		customCitDimensionData.map(e => {
			if(!e?.cit_version?.is_deleted) {
				e.citVersionName = e?.cit_version?.name;
				e.createdAtDate = moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
				return e
			}
		})

        message = {
            error: false,
            message: "All CIT Dimension list",
            data: customCitDimensionData,
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
 * This method is to find all CIT Dimension
 */

//  CitDimensionRoute.get("/list-all", isAuthenticate, async (req, res) => {
//     try {
//         let CitDimensionData= await CitDimension.find({is_deleted:false}).populate([
// 			{
// 				path: "cit_version"
// 			}
// 		]);

// 		let dimensionQuesDetail = {};

// 		let questionData = await CitDimensionQuestion.find({$and:[{cit_dimension: req.params.citDimensionId},{ is_deleted: false }]});
// 		console.log("questionData",questionData);

// 		dimensionQuesDetail.citData = {
// 			exist: questionData? true : false,
// 		}

//         message = {
//             error: false,
//             message: "All CIT Dimension list",
//             data: CitDimensionData,
// 			dimensionQuesDetail
//         };
//         res.status(200).send(message);
//     } catch(err) {
//         message = {
//             error: true,
//             message: "operation failed!",
//             data: String(err),
//         };
//         res.status(200).send(message);
//     }
// });

/**
 * This method is to find all CIT Dimension 
 */

 CitDimensionRoute.get("/detail/:citDimensionId", isAuthenticate, async (req, res) => {
    try {
        let CitDimensionData= await CitDimension.find({$and:[{_id:req.params.citDimensionId},{is_deleted:false}]}).populate([
			{
				path: "cit_version"
			}
		]);

		let dimensionQuesDetail = {};

		let questionData = await CitDimensionQuestion.findOne({$and:[{cit_dimension: req.params.citDimensionId},{ is_deleted: false }]});
		//console.log("questionData",questionData);

		dimensionQuesDetail.citData = {
			exist: questionData? true : false,
		}

        message = {
            error: false,
            message: "All CIT Dimension list",
            data: CitDimensionData,
			dimensionQuesDetail
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
 * This method is to find all CIT Dimension
 */

CitDimensionRoute.get("/list-by-version/:versionId", isAuthenticate, async (req, res) => {
    try {
        let CitDimensionData= await CitDimension.find({$and: [{is_deleted: false}, {cit_version: req.params.versionId}]})

        message = {
            error: false,
            message: "All CIT Dimension list by version",
            data: CitDimensionData,
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
 * This method is to create CIT Dimension
 */

CitDimensionRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const citDimensionExist = await CitDimension.findOne({$and: [{is_deleted: false}, {name: {$regex: req.body.name, $options: "i"}}, {cit_version: req.body.cit_version}]});
		if (!citDimensionExist) {
			const CitDimensionData = new CitDimension(req.body);
			const result = await CitDimensionData.save();
			message = {
				error: false,
				message: "CIT Dimension Added Successfully!",
				data: result,
			};
			return res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "CIT Dimension already exists!",
			};
			return res.status(200).send(message);
		}
		
	} catch (err) {
		message = {
			error: true,
			message: "CIT Dimension Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update CIT Dimension
 */
CitDimensionRoute.patch("/update/:citDimensionId", isAuthenticate, async (req, res) => {
	try {
		const result = await CitDimension.findOneAndUpdate({ _id: req.params.citDimensionId}, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "CIT Dimension updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "CIT Dimension not updated",
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
 * This method is to delete CIT Dimension
 */

 CitDimensionRoute.patch("/delete/:citDimensionId", async (req, res) => {
	try {
		const dimensionQuestionExistance = await CitDimensionQuestion.findOne({$and: [{ cit_dimension: req.params.citDimensionId },{is_deleted: false}]});

		if(!dimensionQuestionExistance) {
			const result = await CitDimension.findOneAndUpdate({ _id: req.params.citDimensionId },{is_deleted: true, deleted_at: Date.now()},{new:true});
			if (result) {
				message = {
					error: false,
					message: "CIT Dimension deleted successfully!",
					result
				};
				res.status(200).send(message);
			} else {
				message = {
					error: true,
					message: "Operation failed!",
				};
				return res.status(200).send(message);
			}
		} else {
			message = {
				error: true,
				message: "Question exist for this dimension. The dimension can not be deleted.",
			};
			return res.status(200).send(message);
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

module.exports = CitDimensionRoute;
