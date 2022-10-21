require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../../middleware/authcheck");
const DocumentType = require("../../models/pcmodel/document_type");
const DocumentTypeRoute = express.Router();

/**
 * This method is to find all documentType
 */
 DocumentTypeRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let DocumentTypeData = await DocumentType.find({is_deleted:false}).sort({_id:-1});

        message = {
            error: false,
            message: "All Document type list",
            data:DocumentTypeData ,
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
 * This method is to create Document Type
 */
 DocumentTypeRoute.post("/create", isAuthenticate, async (req, res) => {
	try {
		const DocumentTypeData = new DocumentType(req.body);
		const result = await DocumentTypeData.save();
		message = {
			error: false,
			message: "Document type Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "Document type Failed!",
			data: err,
		};
		return res.status(200).send(message);
	}
});



/**
 * This method is to update Document Type
 * @param str DocumentId
 */
 DocumentTypeRoute.patch("/update/:DocumentId", isAuthenticate, async (req, res) => {
	try {
		const result = await DocumentType.findOneAndUpdate({ _id: req.params.DocumentId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "Document Type updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "Document Type not updated",
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
 * This method is to delete Document type
 * @param str DocumentId
 */
//  DocumentTypeRoute.delete("/delete/:DocumentId", async (req, res) => {
// 	try {
// 		const result = await DocumentType.deleteOne({ _id: req.params.DocumentId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "Document Type deleted successfully!",
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


DocumentTypeRoute.patch("/delete/:DocumentId", async (req, res) => {
	try {
		const result = await DocumentType.findOneAndUpdate({ _id: req.params.DocumentId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "Document Type deleted successfully!",
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
			data: err,
		};
		res.status(200).send(message);
	}
});



module.exports = DocumentTypeRoute;