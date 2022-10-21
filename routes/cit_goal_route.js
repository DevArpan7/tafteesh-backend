require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const CIT = require("../models/cit");
const CitGoal = require("../models/cit_goal");
const SurvivorDiary = require("../models/survivor_diary");
const CitGoalRoute = express.Router();


/**
 * This method is to find all CitGoal 
 */

CitGoalRoute.get("/list-by-cit/:citId", isAuthenticate, async (req, res) => {
    try {
        let CitGoalData= await CitGoal.find({
            $and:[
                { cit_id: req.params.citId},
                { is_deleted:false }
            ]
        }).populate([
            {
                path: "dimension_id",
                select: "name"
            },
            {
                path: "dimension_queston",
                select: "data"
            },
            {
                path: "cit_id",
                select: "unique_id"
            }

        ]).sort({sr_no: 1});

        message = {
            error: false,
            message: "All CitGoal list",
            data: CitGoalData,
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
 * This method is to find all activity of a CitGoal 
 */

 CitGoalRoute.get("/activity-list-by-cit-goal/:citGoalId", isAuthenticate, async (req, res) => {
    try {
        let CitGoalData= await CitGoal.findOne({
            $and:[
                { _id: req.params.citGoalId},
                { is_deleted:false }
            ]
        }).select("activities").sort({sr_no: 1});

        message = {
            error: false,
            message: "All CitGoal list",
            data: CitGoalData,
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
 * This method is to create CitGoal 
 */
CitGoalRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
        
        let checkCitGoal = await CitGoal.findOne({ cit_id: req.body[0].cit_id }).select("sr_no").sort({_id: -1});
        console.log(checkCitGoal, checkCitGoal?.sr_no);
        let previousSerialNUmber = 0;
        if (checkCitGoal !== null) {
            previousSerialNUmber = Number(checkCitGoal?.sr_no);
        }
        const citGoalData = req.body;
        let result = [];
        for (let index = 0; index < citGoalData.length; index++) {
            const checkCitGoalExist = await CitGoal.findOne({
                $and: [
                    { cit_id: citGoalData[index].cit_id },
                    { dimension_id: citGoalData[index].dimension_id },
                    { dimension_queston: citGoalData[index].dimension_queston },
                ]
            });
            if (!checkCitGoalExist) {
                // console.log(index+previousSerialNUmber+1);

                citGoalData[index].sr_no = index+previousSerialNUmber+1;
                const CitGoalData = new CitGoal(citGoalData[index]);
                let resp = await CitGoalData.save();
                resp = await CitGoalData.populate([
                    {
                        path: "dimension_id",
                        select: "name"
                    },
                    {
                        path: "dimension_queston",
                        select: "data"
                    },
                    {
                        path: "cit_id",
                        select: "unique_id"
                    }
                ])

                // let citData = await CIT.findOne({_id: req.body[0].cit_id}).populate([
                //     {
                //         path: "survivor",
                //         select: "user_id"
                //     }
                // ])
                // let dirayBody = {
                //     survivor: citData.survivor._id,
                //     user: citData.survivor.user_id,
                //     to_do: "dimension_id.name/dimension_queston.data",
                //     plan_date: "plan_date"

                // }
                result.push(resp);
            }
        }

        let CitGoals = await CitGoal.find({ cit_id: citGoalData[0].cit_id }).populate([
            {
                path: "dimension_id",
                select: "name"
            },
            {
                path: "dimension_queston",
                select: "data"
            },
            {
                path: "cit_id",
                select: "data"
            }

        ]);

        message = {
            error: false,
            message: "CitGoal Added Successfully!",
            data: CitGoals
        };
        
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "CitGoal Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update CitGoal 
 */
CitGoalRoute.patch("/update/:CitGoalId", isAuthenticate, async (req, res) => {
	try {
		let result;
        let populate = [
            {
                path: "dimension_id",
                select: "name"
            },
            {
                path: "dimension_queston",
                select: "data"
            },
            {
                path: "cit_id",
                select: "unique_id"
            }
        ];
        if (req.body.activity) {
            result = await CitGoal.findOneAndUpdate({ _id: req.params.CitGoalId}, {$push: {activities: req.body.activity}}, {new: true}).populate(populate);
        } else if(req.body.status) {
            result = await CitGoal.findOneAndUpdate({ _id: req.params.CitGoalId}, {status: req.body.status}, {new: true}).populate(populate);
        } else {
            delete req.body.activity;
            delete req.body.status;
            result = await CitGoal.findOneAndUpdate({ _id: req.params.CitGoalId}, req.body, {new: true}).populate(populate);
        }

		if (result) {
            //to automate diary generate
            if (req.body.targeted_date) {
                let citData = await CIT.findOne({_id: result.cit_id}).populate([
                    {
                        path: "survivor",
                        select: "user_id"
                    }
                ])

                let dirayBody = {
                    survivor: citData.survivor._id,
                    user: citData.survivor.user_id,
                    to_do: "CIT / "+result.dimension_id.name,
                    plan_date: req.body.targeted_date,
                    type: "System",
                    plan_for: "Social Worker",
                    select: "CIT",
                    status: "Planning"
                }

                let diaryData = new SurvivorDiary(dirayBody)
                let diaryResult = await diaryData.save();
            }

			message = {
				error: false,
				message: "CitGoal updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "CitGoal not updated",
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
 * This method is to re-arrange CitGoal 
 */
 CitGoalRoute.patch("/rearrange-serial-number", isAuthenticate, async (req, res) => {
	try {
		let result = [];
        
        let arrayOfGoals = req.body.map(({_id, sr_no, ...rest}) => {
            return {_id, sr_no};
        })

        // return res.status(200).send(arrayOfGoals);
        for (let index = 0; index < arrayOfGoals.length; index++) {
            const rearrangeRes = await CitGoal.findOneAndUpdate({_id: arrayOfGoals[index]._id}, {sr_no: arrayOfGoals[index].sr_no}, {new: true});
            if (rearrangeRes) {
                result.push(rearrangeRes);
            }
        }

		if (result) {
            let CitGoalData = await CitGoal.find({
                $and:[
                    { cit_id: result[0].cit_id},
                    { is_deleted:false }
                ]
            }).populate([
                {
                    path: "dimension_id",
                    select: "name"
                },
                {
                    path: "dimension_queston",
                    select: "data"
                },
                {
                    path: "cit_id",
                    select: "unique_id"
                }
    
            ]).sort({sr_no: 1});
			message = {
				error: false,
				message: "CitGoal rearranged successfully!",
				data: CitGoalData
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "CitGoal not rearranged",
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
 * This method is to arrange CitGoal 
 */
//  CitGoalRoute.patch("/arrange-position/:CitId", async (req, res) => {
// 	try {
// 		let result = await CitGoal.findOneAndUpdate({ _id: req.params.CitId}, {$push: {activities: req.body.activity}}, {new: true});
        
// 		if (result) {
// 			message = {
// 				error: false,
// 				message: "CitGoal updated successfully!",
// 				result
// 			};
// 			res.status(200).send(message);
// 		} else {
// 			message = {
// 				error: true,
// 				message: "CitGoal not updated",
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

/**
 * This method is to delete CitGoal 
 */

CitGoalRoute.delete("/delete/:CitGoalId", isAuthenticate, async (req, res) => {
	try {
		const result = await CitGoal.deleteOne({ _id: req.params.CitGoalId });
		if (result) {
			message = {
				error: false,
				message: "CitGoal deleted successfully!",
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



module.exports = CitGoalRoute;
