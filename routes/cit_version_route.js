require("dotenv").config();
const express = require("express");
const isAuthenticate = require("../middleware/authcheck");
const CitVersion = require("../models/cit_version");
const CIT = require("../models/cit");
const CitDimension = require("../models/cit_dimension");
const CitVersionRoute = express.Router();
const moment = require("moment");

/**
 * This method is to find all CitVersion
 */

CitVersionRoute.get("/list", isAuthenticate, async (req, res) => {
    try {
        let CitVersionData = await CitVersion.find({is_deleted:false}).sort({_id:-1});

        let customCitVersionData = JSON.parse(JSON.stringify(CitVersionData))
		customCitVersionData.map(e => {
			e.created_date = moment (e?.createdAt.split("T")[0]).format('DD-MMM-YYYY')
			return e
		})

        message = {
            error: false,
            message: "All CitVersion list",
            data: customCitVersionData,
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
 * This method is to add CitVersion
 */

CitVersionRoute.post("/create", isAuthenticate, async (req, res) => {
    try {
        const checkCitVersion = await CitVersion.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkCitVersion.length){
			for (let index = 0; index < checkCitVersion.length; index++) {
				if(checkCitVersion[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A CIT version already exists with this name!"})
				}
			}
		}

        let CitVersionData = new CitVersion(req.body);
        const result = await CitVersionData.save();
        message = {
            error: false,
            message: "CitVersion Data added",
            data: result,
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
 * This method is to edit CitVersion
 */

 CitVersionRoute.patch("/update/:citVersionId", isAuthenticate, async (req, res) => {
    try {
        const citVersionData = await CitVersion.findOne({_id: req.params.citVersionId});
        const check1 = await CitDimension.findOne({cit_version: req.params.citVersionId});
        const check2 = await CIT.findOne({$or: [{cit_version: req.params.citVersionId}, {version: citVersionData?.name}]});
        if (check1 || check2) return res.status(200).send({error: true, message: "This CIT version exists in other module. Can not be updated."});

        const checkCitVersion = await CitVersion.find({name: {$regex: req.body.name, $options: "i"}});
		if (checkCitVersion.length){
			for (let index = 0; index < checkCitVersion.length; index++) {
				if(checkCitVersion[index].name.toLowerCase() == req.body.name.toLowerCase()){
					return res.status(200).send({error: true, message: "A CIT version already exists with this name!"})
				}
			}
		}

        let CitVersionData = await CitVersion.findOneAndUpdate({_id: req.params.citVersionId}, req.body, {new: true});
        message = {
            error: false,
            message: "CitVersion Data updated",
            data: CitVersionData,
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
 * This method is to delete CitVersion
 */

 CitVersionRoute.delete("/delete/:citVersionId", isAuthenticate, async (req, res) => {
    try {
        const citVersionData = await CitVersion.findOne({_id: req.params.citVersionId});
        const check1 = await CitDimension.findOne({cit_version: req.params.citVersionId});
        const check2 = await CIT.findOne({$or: [{cit_version: req.params.citVersionId}, {version: citVersionData?.name}]});
        if (check1 || check2) return res.status(200).send({error: true, message: "This CIT version exists in other module. Can not be deleted."});

        let CitVersionData = await CitVersion.deleteOne({_id: req.params.citVersionId});
        message = {
            error: false,
            message: "CitVersion Data deleted!"
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
 * This method is to delete Result
 * @param str invresultId
 */
 CitVersionRoute.patch("/delete/:citVersionId", async (req, res) => {
	try {
		const citVersionData = await CitVersion.findOne({_id: req.params.citVersionId});
        const check1 = await CitDimension.findOne({cit_version: req.params.citVersionId});
        const check2 = await CIT.findOne({$or: [{cit_version: req.params.citVersionId}, {version: citVersionData?.name}]});
        if (check1 || check2) return res.status(200).send({error: true, message: "This CIT version exists in other module. Can not be deleted."});

		const result = await CitVersion.findOneAndUpdate({ _id: req.params.citVersionId },{
            is_deleted: true, 
            deleted_at: Date.now(),
            deleted_by: req.body.deleted_by,
            deleted_ref: req.body.deleted_ref
        }, { new: true });
		if (result) {
			message = {
				error: false,
				message: "CIT version deleted successfully!",
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


module.exports = CitVersionRoute;