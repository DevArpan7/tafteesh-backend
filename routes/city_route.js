require("dotenv").config();
const express = require("express");
const moment = require("moment");
const isAuthenticate = require("../middleware/authcheck");
const City = require("../models/city");
const Organization = require("../models/organization");
const CityRoute = express.Router();


/**
 * This method is to find all city 
 */
 CityRoute.get("/list", async (req, res) => {
    try {
        let CityData = await City.find({is_deleted:false}).populate([
			{
				path: 'stateId',
				select: "name"
			},
            {
                path: 'districtId',
				select: "name"
            }
		]).sort({_id:-1});

		let customCityData = JSON.parse(JSON.stringify(CityData))

		customCityData.map(e => {
			e.state_name = e?.stateId?.name
			e.district_name = e?.districtId?.name
			e.city_created_date =  moment(e?.createdAt.split("T")[0]).format('DD-MMM-YYYY');
			return e
		})


        message = {
            error: false,
            message: "All city list",
            data: customCityData,
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
 * This method is to find all city by stateId
 */
 CityRoute.get("/list/:StateId", isAuthenticate, async (req, res) => {
    try {
        let CityData = await City.find({$and:[{stateId:req.params.StateId},{is_deleted:false}]}).populate([
			{
				path: 'stateId',
				select: "name"
			},
            {
                path: 'districtId',
				select: "name"
            }
		]).sort({_id:-1});

        message = {
            error: false,
            message: "All District list",
            data: CityData,
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
 * This method is to create City
 */
 CityRoute.post("/create", async (req, res) => {
	try {
		const checkCity = await City.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {stateId: req.body.stateId}, {districtId: req.body.districtId}]});
		if (checkCity.length) return res.status(200).send({error: true, message: "A same city already exists!"})

		const CitytData = new City(req.body);
		const result = await CitytData.save();
		message = {
			error: false,
			message: "City Added Successfully!",
			data: result,
		};
		return res.status(200).send(message);
	} catch (err) {
		message = {
			error: true,
			message: "city Failed!",
			data: String(err),
		};
		return res.status(200).send(message);
	}
});

/**
 * This method is to update Court status
 * @param str CourtId
 */
// DistrictRoute.patch("/toggle-status/:DistrictId", async (req, res) => {
// 	try {
// 		const result = await District.findOneAndUpdate({ _id: req.params.DistrictId }, {status: req.body.status}, {new: true});
// 		if (result) {
// 			message = {
// 				error: false,
// 				message: "District status updated successfully!",
// 			};
// 			res.status(200).send(message);
// 		} else {
// 			message = {
// 				error: true,
// 				message: "Status not updated",
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

// /**
//  * This method is to update Court
//  * @param str CourtId
//  */
CityRoute.patch("/update/:CityId", async (req, res) => {
	try {
		
		const cityData = await City.findOne({_id: req.params.CityId});
		const chechkEsitence1 = await Organization.findOne({$or: [{city: cityData.name}, {city_name: req.params.CityId}]})

		if(chechkEsitence1) return res.status(200).send({error: true, message: "This city exist in other module. Can not be updated."})

		const checkCity = await City.find({$and: [{name: {$regex: req.body.name, $options: "i"}}, {stateId: req.body.stateId}, {districtId: req.body.districtId}]});
		if (checkCity.length) return res.status(200).send({error: true, message: "A same city already exists!"})
		
		const result = await City.findOneAndUpdate({ _id: req.params.CityId }, req.body, {new: true});
		if (result) {
			message = {
				error: false,
				message: "City updated successfully!",
				result
			};
			res.status(200).send(message);
		} else {
			message = {
				error: true,
				message: "City not updated",
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

// /**
//  * This method is to delete Court
//  * @param str CourtId
//  */
// DistrictRoute.delete("/delete/:DistrictId", async (req, res) => {
// 	try {
// 		const result = await District.deleteOne({ _id: req.params.DistrictId });
// 		if (result.deletedCount == 1) {
// 			message = {
// 				error: false,
// 				message: "District deleted successfully!",
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

CityRoute.patch("/delete/:CityId", async (req, res) => {
	try {
		const cityData = await City.findOne({_id: req.params.CityId});
		const chechkEsitence1 = await Organization.findOne({$or: [{city: cityData.name}, {city_name: req.params.CityId}]})
		if(chechkEsitence1) return res.status(200).send({error: true, message: "This city exist in other module. Can not be deleted."})

		const result = await City.findOneAndUpdate({ _id: req.params.CityId },{is_deleted: true, deleted_at: Date.now()},{new:true});
		if (result) {
			message = {
				error: false,
				message: "City deleted successfully!",
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

module.exports = CityRoute;