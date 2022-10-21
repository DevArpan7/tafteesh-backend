require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const Document = require("../models/document");
const DocumentRoute = express.Router();
const moment = require("moment");
const SurvivorDocument = require("../models/survivor_document");

/** This method is used to find all document */

DocumentRoute.get("/list", isAuthenticate,async (req,res)=>{
    try{
        let DcumentData = await Document.find({is_deleted:false}).sort({_id:-1});

		let customDocumentData = JSON.parse(JSON.stringify(DcumentData))
		customDocumentData.map(e => {
			e.is_required_data = e.is_required? 'YES' : 'NO'
			e.created_date = moment (e?.createdAt.split("T")[0]).format('DD-MMM-YYYY')
			return e
		})

        message = {
            error: false,
            message: "All document list",
            data: customDocumentData,
        };
        res.status(200).send(message);
    }catch(err){
        message = {
            error:true,
            message:"Operation failed",
            data:String(err),
        }
        res.status(200).send(message);
    }
});

/** This method is used to create Document */



DocumentRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const checkDocument = await Document.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkDocument.length){
			for (let index = 0; index < checkDocument.length; index++) {
				if(checkDocument[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A document already exists with this name!"})
				}
			}
		}

		const DcumentData = new Document(req.body);
		const result = await DcumentData.save();
		message = {
			error: false,
			message: "Document Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Document Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});


/**
 * This method is to update Document
 */

 DocumentRoute.patch("/update/:DocumentId",isAuthenticate, async (req, res) => {
	try {
		const checkExistence1 = await SurvivorDocument.findOne({document_type: req.params.DocumentId})
		if (checkExistence1) return res.status(200).send({error: true, message: "This document exists in other module. Can not be updated."});
		
		const checkDocument = await Document.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkDocument.length){
			for (let index = 0; index < checkDocument.length; index++) {
				if(checkDocument[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A document already exists with this name!"})
				}
			}
		}

		const result = await Document.findOneAndUpdate({ _id: req.params.DocumentId}, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Document updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Document not updated",
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
 * This method is to delete Document
 */

 DocumentRoute.patch("/delete/:DocumentId", async (req, res) => {
	try {
		const checkExistence1 = await SurvivorDocument.findOne({document_type: req.params.DocumentId})
		if (checkExistence1) return res.status(200).send({error: true, message: "This document exists in other module. Can not be deleted."});

		const result = await  Document.findOneAndUpdate({ _id: req.params.DocumentId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Document deleted successfully!",
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

module.exports = DocumentRoute;
