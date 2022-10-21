require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const Partner = require("../models/partners");
const PartnerRoute = express.Router();
const moment = require("moment");

/**
 * This method is to find all partners
 */
 PartnerRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let PartnerData = await Partner.find({is_deleted:false}).sort({_id:-1});
		let count = PartnerData.length;

		let customPartnerData = JSON.parse(JSON.stringify(PartnerData))
		customPartnerData.map(e => {
			e.createdAtDate = moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})

        message = {
            error: false,
            message: "All Partner list",
            data: customPartnerData,
			totalcount: count
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
 * This method is to create partner
 */
 PartnerRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkPartner = await Partner.findOne({$or: [{phone_no: req.body.phone_no}, {email: req.body.email}]})
		if (checkPartner && checkPartner.phone_no == req.body.phone_no) {
			message = {
				error: true,
				message: "A partner already exist with this phone!",
			};
			return res.status(200).send(message);
		}
		if (checkPartner && checkPartner.email == req.body.email) {
			message = {
				error: true,
				message: "A partner already exist with this email!",
			};
			return res.status(200).send(message);
		}
		const PartnerData = new Partner(req.body);
		const result = await PartnerData.save();
		message = {
			error: false,
			message: "Partner Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message:  String(err),
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update partner
 * @param str PartnerId
 */
 PartnerRoute.patch("/update/:PartnerId", isAuthenticate, async (req, res) => {
	try {
		// const checkPartner = await Partner.findOne({$or: [{phone_no: req.body.phone_no}, {email: req.body.email}]})
		// if (checkPartner && checkPartner.phone_no == req.body.phone_no) {
		// 	message = {
		// 		error: true,
		// 		message: "A partner already exist with this phone!",
		// 	};
		// 	return res.status(200).send(message);
		// }
		// if (checkPartner && checkPartner.email == req.body.email) {
		// 	message = {
		// 		error: true,
		// 		message: "A partner already exist with this email!",
		// 	};
		// 	return res.status(200).send(message);
		// }
		const result = await Partner.findOneAndUpdate({ _id: req.params.PartnerId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Partner updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Partner not updated",
			};
			res.status(200).send(message);
		}
	} catch (err) {
		message = {
			error: true,
			message:  String(err),
			data: String(err),
		};
		res.status(200).send(message);
	}
});

/**
 * This method is to delete Partner
 * @param str PartnerId
 */
//  PartnerRoute.delete("/delete/:PartnerId", async (req, res) => {
// 	try {
// 		const result = await Partner.deleteOne({ _id: req.params.PartnerId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Partner deleted successfully!",
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


/**
 * This method is to delete Partner
 * @param str PartnerId
 */

 PartnerRoute.patch("/delete/:PartnerId", async (req, res) => {
	try {
		const result = await Partner.findOneAndUpdate({ _id: req.params.PartnerId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Partner deleted successfully!",
				result,
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




/**
 *  This method is to search partner
 */

 PartnerRoute.post("/search", isAuthenticate, async (req, res) => {
	try {
		const searchText = req.body.searchText;
		const result = await Partner.find({
			"$or":[{"name":{"$regex":searchText,$options: 'i' }},{"phone_no":{"$regex":searchText,$options: 'i' }},{"email":{"$regex":searchText,$options: 'i' }}]})
	
		if (result) {
			message = {
				error: false,
				message: "Partner search successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Partner search failed",
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


module.exports = PartnerRoute;