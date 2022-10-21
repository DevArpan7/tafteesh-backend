require("dotenv").config();
const express = require("express");
const moment = require("moment");
const generateChangelog = require("../helper/generateChangeLog");
const SupplimentaryChargesheet = require("../models/supplimentary_chargesheet");
const SupplimentaryChargesheetRoute = express.Router();

const infoLoggerModule = require("../logs/infoLogger");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const SurvivorChargeSheet = require("../models/survivor_chargesheet");

/**
 * This method is to find all SupplimentaryChargesheet
 */

SupplimentaryChargesheetRoute.get("/list/:SurvivorChargesheetId", async(req, res) => {
    try {
        let SupplimentaryChargesheetData = await SupplimentaryChargesheet.find({
            $and: [
                { survivor_chargesheet: req.params.SurvivorChargesheetId },
                { is_deleted: false }
            ]
        }).populate([
            {
                path: "act",
                select: "name"
            },
            {
                path: "section",
                select: "number"
            }
        ]).sort({ _id: -1 });

        let customSupplimentaryChargesheetData = JSON.parse(JSON.stringify(SupplimentaryChargesheetData))

		customSupplimentaryChargesheetData.map(e => {
			e.supplimentary_chargesheet_date = moment(e?.date.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All Supplementary Chargesheet list",
            data: customSupplimentaryChargesheetData,
        };
        infoLogger.info({
			req: req.params, 
			res: SupplimentaryChargesheetData, 
			method:"GET", 
			url: req.originalUrl, 
			error: false
		});
        res.status(200).send(message);
    } catch (err) {
        errorLogger.error({
			req: req.params, 
			res: String(err), 
			method:"GET", 
			url: req.originalUrl, 
			error: true
		});
        message = {
            error: true,
            message: "operation failed!",
            data: String(err),
        };
        res.status(200).send(message);
    }
});


/**
 * This method is to find detail SupplimentaryChargesheet
 * @param str SupplementaryChargesheetId
 */

 SupplimentaryChargesheetRoute.get("/detail/:SupplementaryChargesheetId", async(req, res) => {
    try {
        let SupplimentaryChargesheetData = await SupplimentaryChargesheet.findOne({
            $and: [
                { _id: req.params.SupplementaryChargesheetId },
                { is_deleted: false }
            ]
        }).populate([{
                path: "act",
                select: "name"
            },
            {
                path: "section",
                select: "number"
            }
        ]).sort({ _id: -1 });

        message = {
            error: false,
            message: "Detail SupplementaryFir",
            data: SupplimentaryChargesheetData,
        };
        infoLogger.info({
			req: req.params, 
			res: SupplimentaryChargesheetData, 
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
 * This method is to create SupplimentaryChargesheet
 */


SupplimentaryChargesheetRoute.post("/create", async(req, res) => {
    try {
        const SupplimentaryChargesheetData = new SupplimentaryChargesheet(req.body);
        let chargesheetId = SupplimentaryChargesheetData?.survivor_chargesheet
		console.log(chargesheetId);
        let survivorChargesheetData = await SurvivorChargeSheet.findOne({_id: {$in: chargesheetId}});
		console.log(survivorChargesheetData?.charge_sheet?.date);
        console.log(SupplimentaryChargesheetData?.date);
        if (SupplimentaryChargesheetData?.date <= survivorChargesheetData?.charge_sheet?.date) {
			message = {
				error: true,
				message: "supplimentary chargesheet should be after chargesheet date",
			};
			return res.status(200).send(message);
		}
        const result = await SupplimentaryChargesheetData.save();
        message = {
            error: false,
            message: "SupplimentaryChargesheet Added Successfully!",
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
            message: "Supplimentary Chargesheet Data Creation Failed!",
            data: String(err),
        };
        return res.status(200).send(message);
    }
});

/**
 * This method is to update SupplimentaryChargesheet
 */

SupplimentaryChargesheetRoute.patch("/toggle-status/:SupplementaryChargesheetId", async(req, res) => {
    try {
        const result = await SupplimentaryChargesheet.findOneAndUpdate({ _id: req.params.SupplementaryChargesheetId }, { status: req.body.status }, { new: true });
        if (result) {
            message = {
                error: false,
                message: "SupplimentaryChargesheet status updated successfully!",
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

/**
 * This method is to update SupplimentaryChargesheet
 */

SupplimentaryChargesheetRoute.patch("/update/:SupplementaryChargesheetId", async(req, res) => {
    try {
        const CheckSupplementaryChargesheetData = await SupplimentaryChargesheet.findOne({$and:[
			{ _id: req.params.SupplementaryChargesheetId},{is_deleted:false}
		]})
		if (!CheckSupplementaryChargesheetData) return res.status(200).send({error: true, message: "Supplimentary chargesheet not found"}) 
		let survivorChargesheetId = CheckSupplementaryChargesheetData?.survivor_chargesheet
		console.log(survivorChargesheetId);
		let survivorChargesheetData = await SurvivorChargeSheet.findOne({_id: {$in: survivorChargesheetId}});

		/**
		 * checking form date greater than trafficking date or not
		 */
		 if (req.body.date && (new Date(req.body.date) <= new Date(survivorChargesheetData?.charge_sheet?.date))) return res.status(200).send({ error: true, message: "Supplimentary date should be after chargesheet date"})

        const SupplimentaryChargesheetData = await SupplimentaryChargesheet.find({$and:[
			{ _id: req.params.SupplementaryChargesheetId},{is_deleted:false}
		]})
        const result = await SupplimentaryChargesheet.findOneAndUpdate({ _id: req.params.SupplementaryChargesheetId }, req.body, { new: true });
        if (result) {
            if (req.body.user_id) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "supplimentaryChargesheets",
                    old_data: JSON.stringify(SupplimentaryChargesheetData),
                    description: "Supplimentary Chargesheet data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "supchargesheet",
                    note: "Change log genearted for Supplimentary Chargesheet"
                });
            }
            message = {
                error: false,
                message: "Supplementary Chargesheet updated successfully!",
                result
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
                message: "Supplementary Chargesheet not updated",
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
            data: String(err),
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to delete SupplementaryFir
 */

 SupplimentaryChargesheetRoute.delete("/delete/:SupplementaryChargesheetId", async (req, res) => {
	try {
        
		const result = await SupplimentaryChargesheet.deleteOne({ _id: req.params.SupplementaryChargesheetId });
		if (result.deletedCount == 1) {
			message = {
				error: false,
				message: "Supplimentary chargesheet deleted successfully!",
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




SupplimentaryChargesheetRoute.patch("/delete/:SupplementaryChargesheetId", async(req, res) => {
    try {
        const SupplimentaryChargesheetData = await SupplimentaryChargesheet.find({$and:[
			{ _id: req.params.SupplementaryChargesheetId},{is_deleted:false}
		]})
        const result = await SupplimentaryChargesheet.findOneAndUpdate({ _id: req.params.SupplementaryChargesheetId }, { is_deleted: true, deleted_at: Date.now(), deleted_by: req.body.deleted_by, deleted_by_ref: req.body.deleted_by_ref }, { new: true });
        if (result) {
            if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "supplimentaryChargesheets",
                    old_data: JSON.stringify(SupplimentaryChargesheetData),
                    description: "Supplimentary Chargesheet data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "supchargesheet",
                    note: "Change log genearted for Supplimentary Chargesheet"
                });
            }
            message = {
                error: false,
                message: "Supplimentary Chargesheet deleted successfully!",
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



module.exports = SupplimentaryChargesheetRoute;