require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const SurvivorChargesheet = require("../models/survivor_chargesheet");
//const TraffickerProfile = require("../models/survivor_trafficker");

const SurvivorChargesheetRoute = express.Router();
const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const SurvivorChargeSheet = require("../models/survivor_chargesheet");
const errorLogger = errorLoggerModule();
const SurvivorFir = require("../models/survivor_fir");
const TraffickerProfile = require("../models/trafficker_profile_v2");
const Act = require("../models/act");
const SurvivorProfile = require("../models/survivor_profile");
/**
 * This method is to find all Survivorchargesheet
 * @param str SurvivorProfileId
 * 
 */

 SurvivorChargesheetRoute.get("/list/:SurvivorProfileId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorChargesheetData = await SurvivorChargesheet.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path: "accused_included.name",
				select: "trafficker_name"
			},
			{
				path: "accused_not_included.name",
				select: "trafficker_name"
			},
			{
				path: "fir"
			},
			{
				path: "section.section_type",
				select: "name"
			},
			{
				path: "section.section_number",
				select: "number"
			},
		]).sort({_id:-1});


		let customChargesheetData = JSON.parse(JSON.stringify(SurvivorChargesheetData))

		customChargesheetData.map(e => {
			e.chargesheet_no = e?.charge_sheet?.number
			e.chargesheet_date = moment(e?.charge_sheet?.date.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

		let firData = await SurvivorFir.find({$and:[{ survivor: req.params.SurvivorProfileId },{is_deleted:false}]}).populate([
			{
				path:"policeStation",
				select:"name"
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
		]).sort({_id:-1});
		let traffickerData = await TraffickerProfile.find({is_deleted:false}).sort({_id:-1});
		let actData = await Act.find({is_deleted:false}).sort({_id:-1});


        message = {
            error: false,
            message: "All Survivor Chargesheet list",
            data: customChargesheetData,
			SurvivorFirData:firData,
			masterTraffickerData:traffickerData,
			masterActData:actData
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorChargesheetData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});

        res.status(200).send(message);
    } catch(err) {
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
 * This method is to find detail Survivorchargesheet
 * @param str SurvivorchargesheetID
 * 
 */

SurvivorChargesheetRoute.get("/detail/:SurvivorchargesheetID", async (req, res) => {
    try {
        let SurvivorChargesheetData = await SurvivorChargesheet.findOne({$and:[{ _id: req.params.SurvivorchargesheetID },{is_deleted:false}]}).populate([
			{
				path: "accused_included.name",
				select: "trafficker_name"
			},
			{
				path: "accused_not_included.name",
				select: "trafficker_name"
			},
			{
				path: "fir"
			},
			{
				path: "section.section_type",
				select: "name"
			},
			{
				path: "section.section_number",
				select: "number"
			},
		]).sort({_id:-1});

        message = {
            error: false,
            message: "Detail Survivor Chargesheet list",
            data: SurvivorChargesheetData,
        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorChargesheetData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});

        res.status(200).send(message);
    } catch(err) {
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
 * This method is to find all Survivorchargesheet
 * @param str SurvivorProfileId , SurvivorfirId , SurvivorinvId
 * 
 */

SurvivorChargesheetRoute.get("/list/:SurvivorProfileId/:SurvivorfirId/:SurvivorinvId", isAuthenticate, async (req, res) => {
    try {
        let SurvivorChargesheetData = await SurvivorChargesheet.find({$and:[{ survivor: req.params.SurvivorProfileId },{fir:req.params.SurvivorfirId},{investigation:req.params.SurvivorinvId},{is_deleted:false}]}).populate([
			{
				path: "accused_included.name",
				select: "trafficker_name"
			},
			{
				path: "accused_not_included.name",
				select: "trafficker_name"
			},
			{
				path: "fir"
			},
			{
				path: "section.section_type",
				select: "name"
			},
			{
				path: "section.section_number",
				select: "number"
			},
		]).sort({_id:-1});

		let customChargesheetData = JSON.parse(JSON.stringify(SurvivorChargesheetData))

		customChargesheetData.map(e => {
			e.chargesheet_no = e?.charge_sheet?.number
			e.chargesheet_date = moment(e?.charge_sheet?.date.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

		
		let firData = await SurvivorFir.find({$and:[{ survivor: req.params.SurvivorProfileId },{_id:req.params.SurvivorfirId},{is_deleted:false}]}).populate([
			{
				path:"policeStation",
				select:"name"
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
		]).sort({_id:-1});
		let traffickerData = await TraffickerProfile.find({is_deleted:false}).sort({_id:-1});
		let actData = await Act.find({is_deleted:false}).sort({_id:-1});


        message = {
            error: false,
            message: "All SurvivorChargesheet list",
            data: customChargesheetData,
			SurvivorFirData:firData,
			masterTraffickerData:traffickerData,
			masterActData:actData

        };
		infoLogger.info({
			req: req.params, 
			res: SurvivorChargesheetData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch(err) {
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
 * This method is to create all Survivorchargesheet
 * @param str SurvivorProfileId
 * 
 */

SurvivorChargesheetRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorChargesheetData = new  SurvivorChargesheet(req.body);
		let survivorId = SurvivorChargesheetData?.survivor
		let  survivorFirId = SurvivorChargesheetData?.fir
		console.log(survivorId);
		console.log(survivorFirId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});
		let survivorFirData = await SurvivorFir.findOne({_id: {$in: survivorFirId}});

		console.log(survivorFirData?.fir?.date);
		console.log(survivorData?.date_of_trafficking);
		console.log(SurvivorChargesheetData?.charge_sheet?.date)

		if (SurvivorChargesheetData?.charge_sheet?.date <= survivorData?.date_of_trafficking) {
			message = {
				error: true,
				message: "chargesheet date should be after date of trafficking",
			};
			return res.status(200).send(message);
		}
		if (SurvivorChargesheetData?.charge_sheet?.date <= survivorFirData?.fir?.date) {
			message = {
				error: true,
				message: "chargesheet date should be after FIR date",
			};
			return res.status(200).send(message);
		}
		const result = await SurvivorChargesheetData.save();
		message = {
			error: false,
			message: "Survivor chargesheet Added Successfully!",
			data: result,
		};
		infoLogger.info({
			req: req.body, 
			res: result, 
			method:"POST", 
			url: req.originalUrl, 
			error: false
		});

		/**************************** we need to recheck this section ********************************/
		// let allAccused = req.body.accused_not_included;
        // console.log("hello 3", allAccused);
        // for (let index = 0; index < allAccused.length; index++) {
        //     let checkTrafficker = await TraffickerProfile.findOne({
        //         $and: [
        //             {_id: allAccused[index].name}, 
        //             {survivors: { $in: [result.survivor]}}
        //         ]
        //     });
        //     console.log(checkTrafficker);
        //     if (!checkTrafficker) {
        //         console.log("hello 1");
        //         const SurvivorFirData = await TraffickerProfile.findOneAndUpdate({_id: allAccused[index].name}, {$push: {survivors: result.survivor}});
        //     }
        // }

		return res.status(200).send(message);
	} catch (err) {
		errorLogger.error({
			req: req.body, 
			res: String(err), 
			method:"POST", 
			url: req.originalUrl, 
			error: true
		});
		message = {
			error: true,
			message: "Survivor Chargesheet Failed!",
			data: String(err),
		};

		return res.status(200).send(message);
	}
});

/**
 * This method is to delete survivor chargesheet accused
 * @param {String} chargesheetId
 * @param {String} accusedDataId
 */
SurvivorChargesheetRoute.patch("/delete-accused/:chargesheetId/:accusedDataId", async (req, res, next) => {
	try {
		const survivorChargesheetData = await SurvivorChargeSheet.findOne({_id: req.params.chargesheetId})
		let oldData = JSON.parse(JSON.stringify(survivorChargesheetData));
		let accusedIncldedData = survivorChargesheetData.accused_included.map(e => {
			if (String(e._id) == String(req.params.accusedDataId)) {
				e.is_deleted = true;
				e.notes = req.body.notes;
			}
			return e;
		});
		let accusedNotIncldedData = survivorChargesheetData.accused_not_included.map(e => {
			if (String(e._id) == String(req.params.accusedDataId)) {
				e.is_deleted = true;
				e.notes = req.body.notes;
			}
			return e;
		});
		// return res.status(200).send({accusedIncldedData, accusedNotIncldedData, oldData});

		if (survivorChargesheetData && (accusedIncldedData.length || accusedNotIncldedData.length)) {
			const result = await SurvivorChargeSheet.findOneAndUpdate({_id: req.params.chargesheetId}, {accused_included: accusedIncldedData, accused_not_included: accusedNotIncldedData}, {new: true})
			let changeLogData = await generateChangelog({
				targeted_data: result?._id,
				targeted_data_ref: "survivorChargeSheets",
				survivor: result.survivor,
				old_data: JSON.stringify(oldData),
				description: "SURVIVOR CHARGESHEET accused deleted",
				new_data: JSON.stringify(result),
				status: false,
				changed_by: req.body.user_id,
				changed_by_ref: "users",
				module: "chargesheet",
				note: "Change log genearted for survivor chargesheet"
			});
			return res.status(200).send({
				error: false,
				message: 'Chargesheet accused deleted',
				data: result
			});
		} else {
			return res.status(200).send({
				error: true,
				message: 'Chargesheet accused not deleted'
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
 * This method is to update Survivor chargesheet
 * @param str SurvivorProfileId
 */
 SurvivorChargesheetRoute.patch("/update/:SurvivorchargesheetID", isAuthenticate, async (req, res) => {
	try {
		const CheckSurvivorChargesheetData = await SurvivorChargesheet.findOne({$and:[
			{ _id: req.params.SurvivorchargesheetID},{is_deleted:false}
		]})
		if (!CheckSurvivorChargesheetData) return res.status(200).send({error: true, message: "Survivor chargesheet not found"}) 
		let survivorId = CheckSurvivorChargesheetData?.survivor
		console.log(survivorId);
		let survivorData = await SurvivorProfile.findOne({_id: {$in: survivorId}});

		let survivorFirId = CheckSurvivorChargesheetData?.fir
		console.log(survivorFirId);
		let survivorFirData = await SurvivorFir.findOne({_id: {$in: survivorFirId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.charge_sheet.date && (new Date(req.body.charge_sheet.date) <= new Date(survivorData?.date_of_trafficking))) return res.status(200).send({ error: true, message: "Chargesheet date should be after date of trafficking"})
		
		/**
		 * checking chargesheet date greater than fir date or not
		 */

		 if (req.body.charge_sheet.date && (new Date(req.body.charge_sheet.date) <= new Date(survivorFirData?.fir?.date))) return res.status(200).send({ error: true, message: "Chargesheet date should be after FIR date"})
		

		const SurvivorChargesheetData = await SurvivorChargesheet.find({$and:[
			{ _id: req.params.SurvivorchargesheetID},{is_deleted:false}
		]})
		const result = await SurvivorChargesheet.findOneAndUpdate({ _id: req.params.SurvivorchargesheetID }, req.body, {new: true});
		if (result) {
			if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorChargeSheets",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorChargesheetData),
                    description: "SURVIVOR CHARGESHEET data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "chargesheet",
                    note: "Change log genearted for survivor chargesheet"
                });
            }
			message = {
				error: false,
				message: "Survivor chargesheet updated successfully!",
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
			// if (req.body.accused_not_included) {
			// 	let allAccused = req.body.accused_not_included;
			// 	console.log("hello 3", allAccused);
			// 	for (let index = 0; index < allAccused.length; index++) {
			// 		let checkTrafficker = await TraffickerProfile.findOne({
			// 			$and: [
			// 				{_id: allAccused[index].name}, 
			// 				{survivors: { $in: [result.survivor]}}
			// 			]
			// 		});
			// 		console.log(checkTrafficker);
			// 		if (!checkTrafficker) {
			// 			console.log("hello 1");
			// 			const SurvivorFirData = await TraffickerProfile.findOneAndUpdate({_id: allAccused[index].name}, {$push: {survivors: result.survivor}});
			// 		}
			// 	}
			// }

			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Survivorchargesheet not updated",
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
			data: String(err),
		};
		res.status(200).send(message);
	}
});



SurvivorChargesheetRoute.patch("/delete/:SurvivorchargesheetID", async (req, res) => {
	try {
		const SurvivorChargesheetData = await SurvivorChargesheet.find({$and:[
			{ _id: req.params.SurvivorchargesheetID},{is_deleted:false}
		]})
		const result = await  SurvivorChargesheet.findOneAndUpdate({ _id: req.params.SurvivorchargesheetID },
			{is_deleted: true, deleted_at: Date.now(), deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorChargeSheets",
					survivor: result.survivor,
                    old_data: JSON.stringify(SurvivorChargesheetData),
                    description: "SURVIVOR CHARGESHEET data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "chargesheet",
                    note: "Change log genearted for survivor chargesheet"
                });
            }
			message = {
				error: false,
				message: "Survivor chargesheet deleted successfully!",
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
				message: "Operation failed!",
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

/**
 * This method is to delete Survivor Profile
 * @param str SurvivorProfileId
 */
 SurvivorChargesheetRoute.delete("/delete/:SurvivorchargesheetID", isAuthenticate, async (req, res) => {
	try {
		const result = await SurvivorChargesheet.deleteOne({ _id: req.params.SurvivorchargesheetID });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Survivor chargesheet deleted successfully!",
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




module.exports = SurvivorChargesheetRoute;