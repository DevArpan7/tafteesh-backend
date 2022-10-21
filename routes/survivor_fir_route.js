require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorFir = require("../models/survivor_fir");
//const TraffickerProfile = require("../models/survivor_trafficker");
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const sendNotification = require("../helper/sendNotification");
const PendingAction = require("../models/pending_action");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const SurvivorFirRoute = express.Router();
const policeStation = require("../models/police_station");
const TraffickerProfile = require("../models/trafficker_profile_v2");
const Act = require("../models/act");
const SurvivorProfile = require("../models/survivor_profile");



/**
 * This method is to find all SurvivorFir
 */
SurvivorFirRoute.get("/list/:SurvivorProfileId", isAuthenticate, async(req, res) => {
    try {
        let SurvivorFirData = await SurvivorFir.find({ $and: [{ survivor: req.params.SurvivorProfileId }, { is_deleted: false }] }).populate([{
                path: "policeStation",
                select: "name"
            },
            {
                path: "accused.name",
                select: "trafficker_name"
            },
            {
                path: "section.section_type",
                select: "name"
            },
            {
                path: "section.section_number",
                select: "number"
            },
        ]).sort({ _id: -1 });

        // SurvivorFirData.filter(element=>{
		// 	number = element?.fir.number

		// })

        // console.log(number);

        // SurvivorFirData.filter(element=>{
		// 	date = element?.fir.date.toDateString()

		// })

        // console.log(date);



        let customFirData = JSON.parse(JSON.stringify(SurvivorFirData))

		customFirData.map(e => {
			e.policeStation_name = e?.policeStation?.name
			e.fir_number = e?.fir?.number
            e.fir_date = moment(e?.fir?.date.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        let policeStationData = await policeStation.find({is_deleted:false}).sort({ _id: -1 })
        let ActData = await Act.find({is_deleted:false}).sort({ _id: -1 })
        let TraffickerProfileData = await TraffickerProfile.find({is_deleted:false}).sort({ _id: -1 })

        message = {
            error: false,
            message: "All Survivor Fir list",
            data: customFirData,
            masterPoliceStationData:policeStationData,
            masterActData:ActData,
            masterDataTrafficker:TraffickerProfileData
        };
        infoLogger.info({
			req: req.params, 
			res: SurvivorFirData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch (err) {
        errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to find all SurvivorFir
 */

SurvivorFirRoute.get("/detail/:firId", isAuthenticate, async(req, res) => {
    try {
        let SurvivorFirData = await SurvivorFir.findOne({ _id: req.params.firId }).populate([{
                path: "policeStation",
                select: "name"
            },
            {
                path: "accused.name",
                select: "trafficker_name"
            },
            {
                path: "section.section_type",
                select: "name"
            },
            {
                path: "section.section_number",
                select: "number"
            },
        ]).sort({ _id: -1 });

        message = {
            error: false,
            message: "Survivor Fir list",
            data: SurvivorFirData,
        };
        infoLogger.info({
			req: req.params, 
			res: SurvivorFirData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch (err) {
        errorLogger.error({
			req: req.params, 
			res: err, 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to create SurvivorFir
 */
SurvivorFirRoute.post("/create", isAuthenticate, async(req, res) => {
    try {

        const checkExistingFir = await SurvivorFir.findOne({$or: [
            {"fir.number": req.body?.fir?.number}
        ]})
        if (checkExistingFir) {
            message = {
                error: true,
                message: "Survivor FIR already exist with same FIR number"
            };
            return res.status(200).send(message);

        } else {
            const SurvivorFirData = new SurvivorFir(req.body);
            let survivorId = SurvivorFirData?.survivor
            console.log(survivorId);
            let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		    console.log(survivorData?.date_of_trafficking);
            console.log(SurvivorFirData?.fir?.createdAt)
            if ( SurvivorFirData?.fir?.date <= survivorData?.date_of_trafficking) {
                message = {
                    error: true,
                    message: "FIR date should be after date of trafficking",
                };
                return res.status(200).send(message);
            }
            let result = await SurvivorFirData.save();
            result = await SurvivorFirData.populate([
                {
                    path: "survivor",
                    select: "organization user_id survivor_id survivor_name"
                }
            ]);
            if (result?.survivor?.user_id) {
                let sendNotificationData = await sendNotification({
                    user: result?.survivor?.user_id,
                    title: "Survivor FIR Added",
                    description: "FIR record for "+ result?.survivor?.survivor_id +" added successfully"
                });
                let checkPendingActionData = await PendingAction.findOneAndUpdate({$and: [{ survivor: result?.survivor?._id }, { module: 'fir' }]}, {isCompleted: true});
            }
            message = {
                error: false,
                message: "Survivor FIR Added Successfully!",
                data: result,
            };
            infoLogger.info({
                req: req.body, 
                res: result, 
                method:"POST", 
                url: req.originalUrl, 
                error: false
            });
    
            return res.status(200).send(message);
        }
        
    } catch (err) {
        errorLogger.error({
			req: req.body, 
			res: err, 
			method:"POST", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "Survivor FIR Failed!",
            data: err,
        };
        return res.status(200).send(message);
    }
});

/**
 * This method is to update SurvivorFir 
 */
SurvivorFirRoute.patch("/toggle-status/:SurvivorProfileId", isAuthenticate, async(req, res) => {
    try {
        const result = await SurvivorFir.findOneAndUpdate({ survivor: req.params.SurvivorProfileId }, { status: req.body.status }, { new: true });
        if (result) {
            message = {
                error: false,
                message: "Survivor FIR status updated successfully!",
            };
            infoLogger.info({
				req: req.body, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Status not updated",
            };
            errorLogger.error({ message: "Survivor profile FIR error"});
            res.status(200).send(message);
        }
    } catch (err) {
        errorLogger.error({
			req: req.body, 
			res: err, 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "Operation Failed!",
            data: err,
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to delete survivor chargesheet accused
 * @param {String} firId
 * @param {String} accusedDataId
 */
SurvivorFirRoute.patch("/delete-accused/:firId/:accusedDataId", async (req, res, next) => {
	try {
		const survivorFirData = await SurvivorFir.findOne({_id: req.params.firId})
        let oldData = JSON.parse(JSON.stringify(survivorFirData));
		let accusedData = survivorFirData.accused.map(e => {
			if (String(e._id) == String(req.params.accusedDataId)) {
				e.is_deleted = true;
				e.notes = req.body.notes;
			}
			return e;
		});
		// return res.status(200).send({paidlogData});

		if (survivorFirData && accusedData.length) {
			const result = await SurvivorFir.findOneAndUpdate({_id: req.params.firId}, {accused: accusedData}, {new: true})
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorFirs",
                    survivor: result.survivor,
                    old_data: JSON.stringify(oldData),
                    description: "FIR data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "fir",
                    note: "Change log genearted for fir"
                });
            }
			return res.status(200).send({
				error: false,
				message: 'Fir accused deleted',
				data: result
			});
		} else {
			return res.status(200).send({
				error: true,
				message: 'Fir accused not deleted'
			});
		}
	} catch (err) {
		return res.status(200).send({
			error: true,
			message: err.toString() 
		});
	}
})

/**
 * This method is to update SurvivorFir
 */
SurvivorFirRoute.patch("/update/:SurvivorFirId", isAuthenticate, async(req, res) => {
    try {
        const CheckSurvivorFirData = await SurvivorFir.findOne({$and:[
			{ _id: req.params.SurvivorFirId},{is_deleted:false}
		]})
		if (!CheckSurvivorFirData) return res.status(200).send({error: true, message: "Survivor Fir not found"}) 
		let survivorId = CheckSurvivorFirData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.fir.date && (new Date(req.body.fir.date) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Fir date should be after date of trafficking"})

        const SurvivorFirData = await SurvivorFir.find({$and:[
			{ _id: req.params.SurvivorFirId},{is_deleted:false}
		]})
        const result = await SurvivorFir.findOneAndUpdate({ _id: req.params.SurvivorFirId }, req.body, { new: true });
        if (result) {
            if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorFirs",
                    survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorFirData),
                    description: "FIR data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "fir",
                    note: "Change log genearted for fir"
                });
            }
            message = {
                error: false,
                message: "Survivor FIR updated successfully!",
                result
            };
            infoLogger.info({
				req: req.body, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});

            /**************************** we need to recheck this section ********************************/
            // if (req.body.accused) {
            //     let allAccused = req.body.accused;
            //     console.log("hello 3", allAccused);
            //     for (let index = 0; index < allAccused.length; index++) {
            //         let checkTrafficker = await TraffickerProfile.findOne({
            //             $and: [
            //                 {_id: allAccused[index].name}, 
            //                 {survivors: { $in: [result.survivor]}}
            //             ]
            //         });
            //         console.log(checkTrafficker);
            //         if (!checkTrafficker) {
            //             console.log("hello 1");
            //             const SurvivorFirData = await TraffickerProfile.findOneAndUpdate({_id: allAccused[index].name}, {$push: {survivors: result.survivor}});
            //         }
            //     }
            // }

            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Survivor FIR not updated",
                result
            };
            errorLogger.error({
				req: req.body, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});
			res.status(200).send(message);

        }
    } catch (err) {
        errorLogger.error({
			req: req.body, 
			res: String(err), 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "Operation Failed!",
            data: String(err)
        };

        res.status(200).send(message);
    }
});

/**
 * This method is to delete SurvivorFir
 */

 SurvivorFirRoute.delete("/delete/:SurvivorFirId", isAuthenticate, async (req, res) => {
	try {
        
		const result = await SurvivorFir.deleteOne({ _id: req.params.SurvivorFirId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Survivor FIR deleted successfully!",
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Operation failed!",
			};
            errorLogger.error({error: err, message: "Survivor profile fir not deleted"})

			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message: "Operation Failed!",
			data: err,
		};
        errorLogger.error({error: err, message: "Survivor profile fir catch block error"})

		res.status(200).send(message);
	}
});


SurvivorFirRoute.patch("/delete/:SurvivorFirId", async(req, res) => {
    try {
        const SurvivorFirData = await SurvivorFir.find({$and:[
			{ _id: req.params.SurvivorFirId},{is_deleted:false}
		]})
        const result = await SurvivorFir.findOneAndUpdate({ _id: req.params.SurvivorFirId }, { is_deleted: true, deleted_at: Date.now(), deleted_by: req.body.deleted_by, deleted_by_ref: req.body.deleted_by_ref }, { new: true });
        if (result) {
            if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorFirs",
                    survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorFirData),
                    description: "FIR data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "fir",
                    note: "Change log genearted for fir"
                });
            }
            message = {
                error: false,
                message: "Survivor FIR deleted successfully!",
                result
            };
            infoLogger.info({
				req: req.params, 
				res: result, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: false
			});
            
            res.status(200).send(message);
        } else {
            message = {
                error: true,
                message: "Not updated!",
            };
            errorLogger.error({
				req: req.params, 
				res: {}, 
				method:"PATCH", 
				url: req.originalUrl, 
				error: true
			});

            res.status(200).send(message);
        }
    } catch (err) {
        errorLogger.error({
			req: req.params, 
			res: String(err), 
			method:"PATCH", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "Operation Failed!",
            data: String(err),
        };
        
        res.status(200).send(message);
    }
});



module.exports = SurvivorFirRoute;