require("dotenv").config();
const express = require("express");
const moment = require("moment");
const SurvivorProfile = require("../models/survivor_profile");
const SurvivorProfileDocument = require("../models/survivor_document");
const Document = require("../models/document");
const Rescue = require("../models/survivor_rescue");
const Pc = require("../models/survivor_pc");
const Vc = require("../models/survivor_vc");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorInvestigation = require("../models/survivor_investigation");
const Cit = require("../models/cit");
const lawyer = require("../models/survivor_lawyer");
const loan = require("../models/survivor_loan");
const income = require("../models/survivor_income");
const chargesheet = require("../models/survivor_chargesheet");
const grant = require("../models/survivor_grant");
const shelterHome = require("../models/shelter_home");

const generateChangelog = require("../helper/generateChangeLog");
const infoLoggerModule = require("../logs/infoLogger");
const sendNotification = require("../helper/sendNotification");
const infoLogger = infoLoggerModule();
const errorLoggerModule = require("../logs/errorLogger");
const generatePendingAction = require("../helper/generatePendingAction");
const isAuthenticate = require("../middleware/authcheck");
const errorLogger = errorLoggerModule();
const SurvivorProfileRoute = express.Router();


/**
 * This method is to find all Survivor Profiles
 */
SurvivorProfileRoute.get("/list", async (req, res) => {
    try {
        let SurvivorProfileData = await SurvivorProfile.find({is_deleted:false}).populate([
			{
				path:"surv_status",
				select:"name"
			}
		]).sort({_id: -1});


		let customProfileData = JSON.parse(JSON.stringify(SurvivorProfileData))

		customProfileData.map(e => {
			// console.log(e?.date_of_trafficking);
			e.birth_date =  moment((e?.date_of_birth != undefined || e?.date_of_birth != null) ? e?.date_of_birth.split("T")[0] : e?.date_of_birth).format('DD-MMM-YYYY');
			e.trafficking_date =  moment((e?.date_of_trafficking != undefined || e?.date_of_trafficking != null) ? e?.date_of_trafficking.split("T")[0] : e?.date_of_trafficking).format('DD-MMM-YYYY');
			e.approvalStatus = e.approval ? 'APPROVED' : 'PENDING'
			return e
		})

		
		const message = {
			error: false,
			message: "All Survivor Profile list",
			data: customProfileData,
			
		};

		infoLogger.info({
			req: req.params, 
			res: SurvivorProfileData, 
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
            data: err.toString(),
        };
        res.status(200).send(message);
    }
});

/**
 * This method is to find all Survivor Profiles by user id
 */
SurvivorProfileRoute.get("/list-by-userId/:userId", async (req, res) => {
    try {
        let SurvivorProfileData = await SurvivorProfile.find({
			$and: [
				{is_deleted:false},
				{user_id: req.params.userId}
			]
		}).populate([
			{
				path:"surv_status",
				select:"name"
			}
		]).sort({_id: -1});

		let customProfileData = JSON.parse(JSON.stringify(SurvivorProfileData))

		customProfileData.map(e => {
			// console.log(e?.date_of_trafficking);
			e.trafficking_date =  moment((e?.date_of_trafficking != undefined || e?.date_of_trafficking != null) ? e?.date_of_trafficking.split("T")[0] : e?.date_of_trafficking).format('DD-MMM-YYYY');
			return e
		})

		const message = {
			error: false,
			message: "All Survivor Profile list",
			data: customProfileData,
		};
		infoLogger.info({
			req: req.params, 
			res: SurvivorProfileData, 
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
 * This method is to find Survivor Profile detail
 * @param str survivorId
 */
SurvivorProfileRoute.get("/detail/:survivorId", async (req, res) => {
    try {
        let SurvivorProfileData = await SurvivorProfile.findOne({_id: req.params.survivorId}).populate([
			{
				path: "organization",
				select: "name email phone"
			},
			{
				path: "state",
				select: "name"
			},
			{
				path: "district",
				select: "name"
			},
			{
				path: "block",
				select: "name"
			},
			{
				path:"surv_status",
				select:"name"
			}

		]);

		let profileDetails = {};

		const rescueData = await Rescue.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const pcData = await Pc.findOne({ survivor: req.params.survivorId });
		const vcData = await Vc.findOne({ survivor: req.params.survivorId });
		const citData = await Cit.findOne({ survivor: req.params.survivorId });
		const firData = await SurvivorFir.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const lawyerData = await lawyer.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const loanData = await loan.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const incomeData = await income.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const chargesheetData = await chargesheet.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const grantData = await grant.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const shelterHomeData = await shelterHome.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const investigationData = await SurvivorInvestigation.find({$and:[{ survivor: req.params.survivorId }, {is_deleted: false}]}).sort({_id: -1});
		const documentData = await SurvivorProfileDocument.findOne({$and: [{ survivor_profile: req.params.survivorId }, { file: {$ne: ""} }]});

		profileDetails.rescue = {
			exist: rescueData.length? true : false,
			place_of_rescue: rescueData[0]?.rescue_from_place,
			rescue_date:rescueData[0]?.date_of_rescue,
			sinceMonth: moment(new Date()).diff(new Date(rescueData[0]?.date_of_rescue), 'months')
		}
		profileDetails.pc = {
			exist: pcData? true : false,
		}
		profileDetails.vc = {
			exist: vcData? true : false,
		}
		profileDetails.cit = {
			exist: citData? true : false,
		}
		profileDetails.document = {
			exist: documentData? true : false,
		}
		profileDetails.fir = {
			exist: firData.length? true : false,
			date_of_fir:firData[0]?.createdAt,
		}
		profileDetails.investigation = {
			exist: investigationData.length? true : false,
			date_of_investigation:investigationData[0]?.createdAt,
		}
		profileDetails.trafficking = {
			sinceMonth: moment(new Date()).diff(new Date(SurvivorProfileData.date_of_trafficking), 'months')
		}
		profileDetails.lawyer = {
			exist: lawyerData.length? true : false,
		},
		profileDetails.loan = {
			exist: loanData.length? true : false,
		}
		profileDetails.income = {
			exist: incomeData.length? true : false,
		}
		profileDetails.chargesheet = {
			exist: chargesheetData.length? true : false,
		}
		profileDetails.grant = {
			exist: grantData.length? true : false,
		}
		profileDetails.shelterHome = {
			exist: shelterHomeData.length? true : false,
		}

        message = {
            error: false,
            message: "Survivor Profile detail",
            data: SurvivorProfileData,
			profileDetails
        };
		infoLogger.info({
			req: req.params, 
			res: {SurvivorProfileData, profileDetails}, 
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
 * This method is to create Survivor Profile
 */
SurvivorProfileRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const SurvivorProfileData = new SurvivorProfile(req.body);
		console.log(SurvivorProfileData.date_of_trafficking);
		console.log(SurvivorProfileData.date_of_birth);
		if ( SurvivorProfileData?.date_of_trafficking <= SurvivorProfileData?.date_of_birth) {
			message = {
				error: true,
				message: "date of trafficking should be after date_of_birth",
			};
			return res.status(200).send(message);
		}
		const result = await SurvivorProfileData.save();

		const documentTypes = await Document.find({});
		let survivorDocuments = [];

		//here we mapping docs for survivor profile
		documentTypes.forEach(element => {
			if (element?.name.toLowerCase() == 'photo') {
				if (req.body?.picture?.length) {
					req.body?.picture.forEach(imgEle => {
						survivorDocuments.push({
							survivor_profile: String(result?._id),
							document_type: String(element?._id),
							about: "",
							file: imgEle,
							active: true
						})
					})
				}
			} else if(element?.name.toLowerCase() == 'consent form') {
				if (req.body?.consent_form) {
					survivorDocuments.push({
						survivor_profile: String(result?._id),
						document_type: String(element?._id),
						about: "",
						file: req.body?.consent_form,
						active: true
					})
				}
			} else {
				survivorDocuments.push({
					survivor_profile: String(result?._id),
					document_type: String(element?._id),
					about: "",
					file: "",
					active: false
				})
			}
		});

		// console.log('survivorDocuments',result);
		
		const docResult = await SurvivorProfileDocument.insertMany(survivorDocuments);

		//add user profile 

		let pendingActionGenerate = await generatePendingAction({
			user: result?.user_id,
			survivor: result?._id,
			username: `${result?.survivor_name}(${result?.survivor_id})`
		})

		message = {
			error: false,
			message: "Survivor Profile Added Successfully!",
			data: result,
			docs: docResult
		};
		infoLogger.info({
			req: req.body, 
			res: {result}, 
			method:"POST", 
			url: req.originalUrl, 
			error: false
		});
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
			message: "Operation Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Survivor Profile status
 * @param str SurvivorProfileId
 */
SurvivorProfileRoute.patch("/toggle-approval/:SurvivorProfileId", isAuthenticate, async (req, res) => {
	try {
		const result = await SurvivorProfile.findOneAndUpdate({ _id: req.params.SurvivorProfileId }, {approval: req.body.approval}, {new: true});
		if (result) {
			if (result?.user_id) {
                let sendNotificationData = await sendNotification({
					user: result?.user_id,
					title: "Admin Approves Survivor Profile ",
					description: result?.survivor_id+" with name "+result?.survivor_name+" has been approved by KAMO admin. Keep adding all supporting documents and records."
                });
            }
			message = {
				error: false,
				message: "Survivor Profile approval updated successfully!",
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
				message: "Status not updated",
			};
			errorLogger.error({ message: "Survivor profile error"});
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
 * This method is to update Survivor Profile
 * @param str SurvivorProfileId
 */
SurvivorProfileRoute.patch("/update/:SurvivorProfileId", isAuthenticate, async (req, res) => {
	try {
		const CheckSurvivorProfileData = await SurvivorProfile.findOne({$and:[
			{ _id: req.params.SurvivorProfileId},{is_deleted:false}
		]})
		if (!CheckSurvivorProfileData) return res.status(200).send({error: true, message: "Survivor Profile not found"}) 

		if (req.body.date_of_trafficking && (new Date(req.body.date_of_trafficking) <= new Date(CheckSurvivorProfileData?.date_of_birth))) return res.status(200).send({ error: true, message: "date of trafficking should be after date of birth"})
		



		const SurvivorProfileData = await SurvivorProfile.find({$and:[
			{ _id: req.params.SurvivorProfileId},{is_deleted:false}
		]})
		const result = await SurvivorProfile.findOneAndUpdate({ _id: req.params.SurvivorProfileId }, req.body, {new: true});
		const updatedBy = await SurvivorProfile.findOneAndUpdate({ _id: req.params.SurvivorProfileId }, { $push: { updated_by: {user: req.body.updatedBy, date: Date.now()} } });

		if (result) {
			if (req.body.user_id) {
				let sendNotificationData = await sendNotification({
					user: req.body.user_id,
					title: "Survivor Profile Updated",
					description: "Profile of"+result?.survivor_id+" with name "+result?.survivor_name+" has been updated."
				});
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorProfiles",
					survivor: result._id,
                    old_data: JSON.stringify(SurvivorProfileData),
                    description: "SURVIVOR PROFILE data updated",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.user_id,
                    changed_by_ref: "users",
                    module: "profile",
                    note: "Change log genearted for survivor profile"
                });
            }
			message = {
				error: false,
				message: "Survivor Profile updated successfully!",
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
				message: "SurvivorProfile not updated",
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
 * This method is to delete Survivor Profile
 * @param str SurvivorProfileId
 */
SurvivorProfileRoute.patch("/delete/:SurvivorProfileId", async (req, res) => {
	try {
		const SurvivorProfileData = await SurvivorProfile.find({$and:[
			{ _id: req.params.SurvivorProfileId},{is_deleted:false}
		]})
		const result = await SurvivorProfile.findOneAndUpdate({_id:req.params.SurvivorProfileId},
			{is_deleted: true, deleted_at: Date.now() , deleted_by:req.body.deleted_by , deleted_by_ref:req.body.deleted_by_ref},
			{new:true});
		
		if (result) {
			if (req.body.deleted_by) {
                let changeLogData = await generateChangelog({
                    targeted_data: result?._id,
                    targeted_data_ref: "survivorProfiles",
					survivor: result._id,
                    old_data: JSON.stringify(SurvivorProfileData),
                    description: "SURVIVOR PROFILE data deleted",
                    new_data: JSON.stringify(result),
                    status: false,
                    changed_by: req.body.deleted_by,
                    changed_by_ref: "users",
                    module: "profile",
                    note: "Change log genearted for profile"
                });
            }
			message = {
				error: false,
				message: "Survivor Profile deleted successfully!",
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

SurvivorProfileRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await SurvivorProfile.find({
			"$or":[{"survivor_name":{"$regex":searchText,$options: 'i' }},{"phone_no":{"$regex":searchText,$options: 'i'}},{"alternate_contact_No":{"$regex":searchText,$options: 'i'}}], is_deleted: false})
		
		if (result) {
			message = {
				error: false,
				message: "Survivor Profile search successfully!",
				data:result
			};
			
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "SurvivorProfile search failed",
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




module.exports = SurvivorProfileRoute;