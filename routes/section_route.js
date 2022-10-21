require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const Section = require("../models/section");
const SurvivorFir = require("../models/survivor_fir");
const SurvivorChargesheet = require("../models/survivor_chargesheet");
const SupplimentaryChargesheet = require("../models/supplimentary_chargesheet");
const SectionRoute = express.Router();

/**
 * This method is to find all Authority by authority type
//  */
SectionRoute.get("/list/:ActId", isAuthenticate, async (req, res) => {
    try {
        let SectionData = await Section.find({$and:[{act:req.params.ActId},{is_deleted:false}]}).populate([
			{
				path: 'act',
				select: "name"
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All Section list",
            data: SectionData,
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
 * This method is to find all Authority by authority type name
 */
SectionRoute.get("/list-by-act-name/:actName", isAuthenticate, async (req, res) => {
    try {
        let SectionData = await Section.find({is_deleted:false}).populate([
			{
				path: 'act',
				match: { 'name': req.params.actName },
				select: 'name'
			}
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All Section list",
            data: SectionData.filter( e => e.act != null ),
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
 * This method is to find all SetionNumber
 */
 SectionRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let SectionData = await Section.find({$and:[{is_deleted:false}]}).populate([
			{
				path: 'act',
				select: "name"
			}
		]).sort({_id:-1});

		let customSectionData = JSON.parse(JSON.stringify(SectionData))

		customSectionData.map(e => {
			e.act_name = e?.act?.name
			e.section_created_at = moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY')
			return e
		})

        message = {
            error: false,
            message: "All section list",
            data: customSectionData,
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
 * This method is to create SetionNumber
 */
 SectionRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkSectionData = await Section.find({$and: [{number: {$regex: req.body.number, $options: "i"}}, {act: req.body.act}]});
		if (checkSectionData.length) return res.status(200).send({error: true, message: "A same section already exists!"})

		const SectionData = new Section(req.body);
		const result = await SectionData.save();
		message = {
			error: false,
			message: "Section Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Section Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update SetionNumber
 * @param str SetionNumberId
 */
 SectionRoute.patch("/update/:SectionId", isAuthenticate, async (req, res) => {
	try {

		const sectionData = await Section.findOne({ _id: req.params.SectionId }) 
		const existenceCheck1 = await SurvivorFir.findOne({$or: [{"section.section_number": sectionData?.number}, {"section.section_number": sectionData?._id}]});
		const existenceCheck2 = await SurvivorChargesheet.findOne({$or: [{"section.section_number": sectionData?.number}, {"section.section_number": sectionData?._id}]});
		const existenceCheck3 = await SupplimentaryChargesheet.findOne({$or: [{section: sectionData?.number}, {section: sectionData?._id}]});
		if (existenceCheck1 || existenceCheck2 || existenceCheck3) return res.status(200).send({error: true, message: "This section exists in other module. Can not be updated."}); 

		
		const checkSectionData = await Section.find({$and: [{number: {$regex: req.body.number, $options: "i"}}, {act: req.body.act}]});
		if (checkSectionData.length) return res.status(200).send({error: true, message: "A same section already exists!"})


		const result = await Section.findOneAndUpdate({ _id: req.params.SectionId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Section  updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Section  not updated",
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
 * This method is to delete Authority
 * @param str AuthorityId
 */
//  AuthorityRoute.delete("/delete/:AuthorityId", async (req, res) => {
// 	try {
// 		const result = await Authority.deleteOne({ _id: req.params.AuthorityId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Authority deleted successfully!",
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


SectionRoute.patch("/delete/:SectionId", async (req, res) => {
	try {
		const sectionData = await Section.findOne({ _id: req.params.SectionId }) 
		const existenceCheck1 = await SurvivorFir.findOne({$or: [{"section.section_number": sectionData?.number}, {"section.section_number": sectionData?._id}]});
		const existenceCheck2 = await SurvivorChargesheet.findOne({$or: [{"section.section_number": sectionData?.number}, {"section.section_number": sectionData?._id}]});
		const existenceCheck3 = await SupplimentaryChargesheet.findOne({$or: [{section: sectionData?.number}, {section: sectionData?._id}]});
		if (existenceCheck1 || existenceCheck2 || existenceCheck3) return res.status(200).send({error: true, message: "This section exists in other module. Can not be deleted."}); 

		const result = await Section.findOneAndUpdate({_id:req.params.SectionId},{is_deleted: true, deleted_at: Date.now()},{new:true});
		
		if (result) {
			message = {
				error: false,
				message: "Section  delete successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Section not deleted",
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


module.exports = SectionRoute;